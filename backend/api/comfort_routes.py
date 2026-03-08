from fastapi import APIRouter, HTTPException
from .comfort_schemas import ComfortPredictRequest, ComfortPredictResponse
from .comfort_analytics import comfort_engine

router = APIRouter()

@router.post("/comfort/predict", response_model=ComfortPredictResponse)
async def predict_comfort(request: ComfortPredictRequest):
    try:
        # Get unified comfort prediction
        prediction = comfort_engine.predict_comfort(
            request.station, 
            request.time, 
            request.train_type
        )
        
        return ComfortPredictResponse(
            crowd_level=prediction["crowd_level"],
            seat_probability=prediction["seat_probability"],
            stress_index=prediction["stress_index"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
