from pydantic import BaseModel
from typing import List, Optional

class MobilityRouteRequest(BaseModel):
    source: str
    destination: str
    time: str
    preference: str = "balanced"  # fastest, comfortable, balanced

class RouteSegment(BaseModel):
    from_station: str
    to_station: str
    train_type: str
    departure_time: str
    arrival_time: str
    duration_mins: int

class MobilityRouteResponse(BaseModel):
    recommended_route: List[RouteSegment]
    estimated_travel_time: int
    crowd_score: float
    delay_probability: float
    transfers: int
    overall_score: float
