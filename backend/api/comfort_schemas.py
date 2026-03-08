from pydantic import BaseModel

class ComfortPredictRequest(BaseModel):
    station: str
    time: str
    train_type: str = "fast"

class ComfortPredictResponse(BaseModel):
    crowd_level: float
    seat_probability: float
    stress_index: float
