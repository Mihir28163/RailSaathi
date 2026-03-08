from fastapi import APIRouter, HTTPException
from datetime import datetime
from .mobility_schemas import MobilityRouteRequest, MobilityRouteResponse, RouteSegment
from .route_optimizer import RouteOptimizer
from .services import ml_service

router = APIRouter()

@router.post("/mobility/optimal-route", response_model=MobilityRouteResponse)
async def get_optimal_route(request: MobilityRouteRequest):
    try:
        # Parse time
        time_str = request.time
        target_time = datetime.strptime(time_str, "%H:%M").replace(
            year=datetime.now().year,
            month=datetime.now().month,
            day=datetime.now().day
        )
        
        # Initialize route optimizer
        optimizer = RouteOptimizer()
        
        # Get optimal route using Dijkstra with ML weights
        route_segments = optimizer.dijkstra_with_ml_weights(
            request.source, 
            request.destination, 
            target_time, 
            request.preference,
            ml_service
        )
        
        if not route_segments:
            raise HTTPException(status_code=404, detail="No route found between stations")
        
        # Convert to response format
        segments = []
        total_crowd_score = 0
        total_delay_prob = 0
        transfers = 0
        
        for i, segment in enumerate(route_segments[:-1]):  # Exclude final destination
            departure_time = segment['departure_time'].strftime("%H:%M")
            arrival_time = segment['arrival_time'].strftime("%H:%M")
            
            route_segment = RouteSegment(
                from_station=segment['from'],
                to_station=segment['to'],
                train_type=segment['train_type'],
                departure_time=departure_time,
                arrival_time=arrival_time,
                duration_mins=segment['duration']
            )
            segments.append(route_segment)
            
            total_crowd_score += segment['crowd_density']
            total_delay_prob += segment['delay_probability']
            transfers += 1 if segment['train_type'] == "slow" else 0
        
        # Calculate averages
        avg_crowd_score = total_crowd_score / len(segments) if segments else 0
        avg_delay_prob = total_delay_prob / len(segments) if segments else 0
        
        # Calculate total travel time
        total_travel_time = sum(seg.duration_mins for seg in segments)
        
        # Calculate overall score (inverse of weighted cost)
        weighted_cost = (0.4 * total_travel_time + 
                        0.3 * avg_crowd_score + 
                        0.2 * avg_delay_prob + 
                        0.1 * transfers)
        overall_score = max(0, 100 - weighted_cost)
        
        return MobilityRouteResponse(
            recommended_route=segments,
            estimated_travel_time=total_travel_time,
            crowd_score=round(avg_crowd_score, 2),
            delay_probability=round(avg_delay_prob, 2),
            transfers=transfers,
            overall_score=round(overall_score, 2)
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
