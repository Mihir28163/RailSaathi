from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class StationRequest(BaseModel):
    station: str = Field(..., description="Name of the station")
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    time: str = Field(..., description="Time in HH:MM format")
    train_type: str = Field(..., description="Fast or Slow")

class CrowdPredictionResponse(BaseModel):
    station: str
    time: str
    crowd_category: str = Field(..., description="Low, Medium, High, Extreme")
    probability_score: float = Field(..., description="0 to 1")
    confidence_interval: List[float] = Field(..., description="[lower_bound, upper_bound]")

class DelayPredictionResponse(BaseModel):
    station: str
    time: str
    train_type: str
    delay_probability: float = Field(..., description="Percentage 0-100")
    confidence_score: float = Field(..., description="0 to 1")

class TravelTimeSuggestion(BaseModel):
    time: str
    crowd_category: str
    delay_probability: float
    score: float

class BestTimeResponse(BaseModel):
    station: str
    target_time: str
    suggestions: List[TravelTimeSuggestion]

# --- Layer 2 Schemas ---

class RouteOptimizeRequest(BaseModel):
    source: str = Field(..., description="Source station")
    destination: str = Field(..., description="Destination station")
    date: str = Field(..., description="Date in YYYY-MM-DD")
    time: str = Field(..., description="Time in HH:MM")
    preference: str = Field(default="balanced", description="fastest, comfortable, balanced")

class RouteOption(BaseModel):
    train_type: str
    departure_time: str
    arrival_time: str
    duration_mins: int
    crowd_category: str
    delay_probability: float
    seat_probability: float
    stress_index: float
    overall_score: float

class RouteOptimizeResponse(BaseModel):
    source: str
    destination: str
    recommendations: List[RouteOption]

class SeatPredictionResponse(BaseModel):
    station: str
    time: str
    train_type: str
    seat_probability: float = Field(..., description="Percentage 0-100")
    confidence: str = Field(..., description="High, Medium, Low")

class StressIndexResponse(BaseModel):
    station: str
    time: str
    stress_score: float = Field(..., description="0 to 100")
    recommendation: str = Field(..., description="Actionable advice for commuter")
