from pydantic import BaseModel
from typing import Optional

class AnomalyDetectionRequest(BaseModel):
    station: str
    train_id: str
    scheduled_time: str
    actual_time: str

class AnomalyDetectionResponse(BaseModel):
    delay_minutes: int
    is_anomaly: bool
    message: str
    confidence: float
