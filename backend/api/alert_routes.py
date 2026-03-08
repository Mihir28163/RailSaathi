from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer
from datetime import datetime
from api.alert_schemas import AlertGenerationRequest, AlertGenerationResponse, AlertData
from api.smart_alert_engine import SmartAlertEngine
from api.auth import get_current_user
from api.database import get_db
from sqlalchemy.orm import Session
from typing import List

router = APIRouter(prefix="/api/alerts", tags=["Smart Alerts"])
security = HTTPBearer()

# Initialize smart alert engine
alert_engine = SmartAlertEngine()

# In-memory storage for alerts (in production, use database)
user_alerts = {}

@router.post("/generate", response_model=AlertGenerationResponse)
async def generate_alerts(
    request: AlertGenerationRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate smart alerts based on user's commute
    """
    try:
        # Generate alerts using the smart alert engine
        result = alert_engine.generate_smart_alerts(
            user_id=request.user_id,
            station=request.station,
            time=request.time
        )
        
        # Store alerts for user (in production, save to database)
        if request.user_id not in user_alerts:
            user_alerts[request.user_id] = []
        
        # Create alert records
        for alert_text in result['alerts']:
            alert_record = AlertData(
                user_id=request.user_id,
                station=request.station,
                time=request.time,
                alert_type="prediction",
                message=alert_text,
                severity=result['severity'],
                created_at=datetime.now().isoformat()
            )
            user_alerts[request.user_id].append(alert_record)
        
        return AlertGenerationResponse(
            alerts=result['alerts'],
            severity=result['severity'],
            recommendations=result['recommendations']
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating alerts: {str(e)}"
        )

@router.get("/user-alerts")
async def get_user_alerts(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all alerts for the current user
    """
    try:
        if not current_user or 'id' not in current_user:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        user_id = current_user['id']
        alerts = user_alerts.get(user_id, [])
        
        return {
            "alerts": alerts,
            "total": len(alerts),
            "unread": len([a for a in alerts if not a.get('is_read', False)])
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching alerts: {str(e)}"
        )

@router.put("/mark-read/{alert_id}")
async def mark_alert_read(
    alert_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark an alert as read
    """
    try:
        if not current_user or 'id' not in current_user:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        user_id = current_user['id']
        alerts = user_alerts.get(user_id, [])
        
        # Find and mark alert as read
        for alert in alerts:
            if alert.get('id') == alert_id:
                alert['is_read'] = True
                break
        
        return {"message": "Alert marked as read"}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error marking alert as read: {str(e)}"
        )

@router.delete("/clear-all")
async def clear_all_alerts(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Clear all alerts for the current user
    """
    try:
        if not current_user or 'id' not in current_user:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        user_id = current_user['id']
        user_alerts[user_id] = []
        
        return {"message": "All alerts cleared"}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error clearing alerts: {str(e)}"
        )

@router.get("/stats")
async def get_alert_stats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get alert system statistics
    """
    try:
        total_alerts = sum(len(alerts) for alerts in user_alerts.values())
        
        return {
            "total_users": len(user_alerts),
            "total_alerts_generated": total_alerts,
            "alert_types": ["crowd_prediction", "delay_prediction", "seat_availability"],
            "features": [
                "Real-time crowd monitoring",
                "Delay probability analysis", 
                "Seat availability prediction",
                "Alternative train suggestions",
                "Personalized recommendations"
            ],
            "thresholds": {
                "crowd_high": 80,
                "delay_high": 25,
                "seat_low": 30
            },
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting stats: {str(e)}"
        )
