from pydantic import BaseModel
from typing import List, Optional

class AlertGenerationRequest(BaseModel):
    user_id: int
    station: str
    time: str

class AlertGenerationResponse(BaseModel):
    alerts: List[str]
    severity: str
    recommendations: List[str]

class AlertData(BaseModel):
    id: Optional[int] = None
    user_id: int
    station: str
    time: str
    alert_type: str
    message: str
    severity: str
    is_read: bool = False
    created_at: Optional[str] = None
