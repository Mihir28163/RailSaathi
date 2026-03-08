from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer
from datetime import datetime
from api.transit_schemas import AnomalyDetectionRequest, AnomalyDetectionResponse
from api.anomaly_detection import AnomalyDetectionEngine
from api.auth import get_current_user
from api.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/transit", tags=["Transit Intelligence"])
security = HTTPBearer()

# Initialize anomaly detection engine
anomaly_engine = AnomalyDetectionEngine()

@router.post("/anomaly-detection", response_model=AnomalyDetectionResponse)
async def detect_anomaly(
    request: AnomalyDetectionRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Detect anomalies in train delays using Isolation Forest and statistical methods
    """
    try:
        # Detect anomaly using the engine
        result = anomaly_engine.detect_anomaly(
            station=request.station,
            train_id=request.train_id,
            scheduled_time=request.scheduled_time,
            actual_time=request.actual_time
        )
        
        return AnomalyDetectionResponse(
            delay_minutes=result['delay_minutes'],
            is_anomaly=result['is_anomaly'],
            message=result['message'],
            confidence=result['confidence']
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error detecting anomaly: {str(e)}"
        )

@router.get("/anomaly-stats")
async def get_anomaly_stats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get anomaly detection statistics
    """
    try:
        # Return statistics about the anomaly detection system
        return {
            "model_status": "trained" if anomaly_engine.is_trained else "training",
            "stations_monitored": len(anomaly_engine.station_delays),
            "total_samples": 1000,  # Synthetic data samples
            "detection_methods": ["isolation_forest", "statistical_deviation"],
            "thresholds": {
                "z_score_threshold": 2.5,
                "minimum_delay_anomaly": 20,
                "contamination_rate": 0.1
            },
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting stats: {str(e)}"
        )
