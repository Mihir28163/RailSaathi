from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
import random
from .schemas import (
    StationRequest, 
    CrowdPredictionResponse, 
    DelayPredictionResponse, 
    BestTimeResponse,
    TravelTimeSuggestion
)
from .services import ml_service
import asyncio

router = APIRouter()

# Simple mock for weather
def get_weather():
    return random.choice(["Clear", "Clear", "Clear", "Rain"])

@router.on_event("startup")
async def startup_event():
    # Load models in a background thread to prevent blocking startup
    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, ml_service.load_models)

@router.post("/predict-crowd", response_model=CrowdPredictionResponse)
async def predict_crowd(request: StationRequest):
    try:
        dt_str = f"{request.date} {request.time}"
        target_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
        weather = get_weather()
        
        # Call ML Service
        res = ml_service.predict_crowd(request.station, request.train_type, target_dt, weather)
        
        return CrowdPredictionResponse(
            station=request.station,
            time=request.time,
            crowd_category=res["category"],
            probability_score=round(res["probability"], 2),
            confidence_interval=[round(x, 2) for x in res["interval"]]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/predict-delay", response_model=DelayPredictionResponse)
async def predict_delay(request: StationRequest):
    try:
        dt_str = f"{request.date} {request.time}"
        target_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
        weather = get_weather()
        
        # Call ML Service
        res = ml_service.predict_delay(request.station, request.train_type, target_dt, weather)
        
        return DelayPredictionResponse(
            station=request.station,
            time=request.time,
            train_type=request.train_type,
            delay_probability=round(res["probability"], 2),
            confidence_score=round(res["confidence"], 2)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/best-travel-time", response_model=BestTimeResponse)
async def get_best_time(request: StationRequest):
    try:
        dt_str = f"{request.date} {request.time}"
        base_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
        weather = get_weather()
        
        suggestions = []
        
        # Window of -2 hours to +2 hours, step 15m
        for offset_min in range(-120, 121, 15):
            target_dt = base_dt + timedelta(minutes=offset_min)
            
            c_res = ml_service.predict_crowd(request.station, request.train_type, target_dt, weather)
            d_res = ml_service.predict_delay(request.station, request.train_type, target_dt, weather)
            
            # Weighted scoring algorithm: Lower is better
            # We want to minimize (crowd_index * 0.6) + (delay_prob * 0.4)
            # Normalize crowd index (0-100) and delay prob (0-100)
            
            c_idx = c_res.get("index", 50.0)
            d_prob = d_res["probability"]
            
            score = (c_idx * 0.6) + (d_prob * 0.4)
            
            # Since lower score is better, let's invert it for user display out of 100 where 100 is best
            display_score = round(max(0, 100 - score), 1)
            
            suggestions.append(TravelTimeSuggestion(
                time=target_dt.strftime("%H:%M"),
                crowd_category=c_res["category"],
                delay_probability=round(d_prob, 1),
                score=display_score
            ))
            
        # Sort by best score descending
        suggestions.sort(key=lambda x: x.score, reverse=True)
        
        # Return top 5
        return BestTimeResponse(
            station=request.station,
            target_time=request.time,
            suggestions=suggestions[:5]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- LAYER 2 ENDPOINTS ---

from .schemas import SeatPredictionResponse, StressIndexResponse, RouteOptimizeRequest, RouteOptimizeResponse, RouteOption

@router.post("/predict-seat", response_model=SeatPredictionResponse)
async def predict_seat(request: StationRequest):
    try:
        dt_str = f"{request.date} {request.time}"
        target_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
        weather = get_weather()
        
        res = ml_service.predict_seat(request.station, request.train_type, target_dt, weather)
        
        return SeatPredictionResponse(
            station=request.station,
            time=request.time,
            train_type=request.train_type,
            seat_probability=res["probability"],
            confidence=res["confidence"]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/analyze-stress", response_model=StressIndexResponse)
async def analyze_stress(request: StationRequest):
    try:
        dt_str = f"{request.date} {request.time}"
        target_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
        weather = get_weather()
        
        res = ml_service.predict_stress(request.station, request.train_type, target_dt, weather)
        
        return StressIndexResponse(
            station=request.station,
            time=request.time,
            stress_score=res["score"],
            recommendation=res["recommendation"]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/route-optimize", response_model=RouteOptimizeResponse)
async def optimize_route(request: RouteOptimizeRequest):
    try:
        dt_str = f"{request.date} {request.time}"
        target_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
        weather = get_weather()
        
        options = []
        
        # Simulate generating logical options between source and destination
        # For a real graph, we'd use Dijkstra/A* logic with ML weights on edges
        
        for t_type in ["Fast", "Slow"]:
            # Baseline travel time (mocked for distance)
            base_duration = 45 if t_type == "Fast" else 65
            
            c_res = ml_service.predict_crowd(request.source, t_type, target_dt, weather)
            d_res = ml_service.predict_delay(request.source, t_type, target_dt, weather)
            seat_res = ml_service.predict_seat(request.source, t_type, target_dt, weather)
            stress_res = ml_service.predict_stress(request.source, t_type, target_dt, weather)
            
            arrival_dt = target_dt + timedelta(minutes=base_duration + (d_res["probability"] * 0.2))
            
            # Simple weighted sum for options sorting based on preference
            c_idx = c_res.get("index", 50)
            
            if request.preference == "fastest":
                score = (base_duration * 0.6) + (d_res["probability"] * 0.4)
            elif request.preference == "comfortable":
                score = (c_idx * 0.4) + ((100 - seat_res["probability"]) * 0.4) + (stress_res["score"] * 0.2)
            else: # balanced
                score = (base_duration * 0.3) + (c_idx * 0.3) + ((100 - seat_res["probability"]) * 0.2) + (stress_res["score"] * 0.2)
            
            options.append(RouteOption(
                train_type=t_type,
                departure_time=target_dt.strftime("%H:%M"),
                arrival_time=arrival_dt.strftime("%H:%M"),
                duration_mins=base_duration,
                crowd_category=c_res["category"],
                delay_probability=round(d_res["probability"], 1),
                seat_probability=round(seat_res["probability"], 1),
                stress_index=round(stress_res["score"], 1),
                overall_score=round(100 - min(100, score), 1) # Higher is better
            ))
            
        options.sort(key=lambda x: x.overall_score, reverse=True)
        
        return RouteOptimizeResponse(
            source=request.source,
            destination=request.destination,
            recommendations=options
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
