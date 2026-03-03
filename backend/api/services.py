import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Update this path if running from a different directory
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")

class MLService:
    def __init__(self):
        self.crowd_models = None
        self.delay_model_data = None
        self.delay_model = None
        self.delay_features = None
        self.is_loaded = False
        
    def load_models(self):
        try:
            print(f"Loading models from {MODEL_DIR}...")
            crowd_path = os.path.join(MODEL_DIR, "crowd_models.joblib")
            delay_path = os.path.join(MODEL_DIR, "delay_model.joblib")
            
            if os.path.exists(crowd_path):
                self.crowd_models = joblib.load(crowd_path)
            else:
                print(f"Warning: {crowd_path} not found.")
                
            if os.path.exists(delay_path):
                self.delay_model_data = joblib.load(delay_path)
                self.delay_model = self.delay_model_data["model"]
                self.delay_features = self.delay_model_data["features"]
            else:
                print(f"Warning: {delay_path} not found.")
                
            self.is_loaded = True
            print("Models loaded successfully.")
        except Exception as e:
            print(f"Error loading models: {e}")
            
    def predict_crowd(self, station: str, train_type: str, target_datetime: datetime, weather: str = "Clear"):
        if not self.is_loaded or self.crowd_models is None:
            # Fallback dummy if models aren't loaded properly
            return {"category": "Medium", "probability": 0.5, "interval": [40.0, 60.0]}
            
        key = f"{station}_{train_type}"
        if key not in self.crowd_models:
            return {"category": "Medium", "probability": 0.5, "interval": [40.0, 60.0]}
            
        model = self.crowd_models[key]
        
        # Create future dataframe for Prophet
        future = pd.DataFrame({
            'ds': [target_datetime],
            'is_weekend': [1 if target_datetime.weekday() >= 5 else 0],
            'is_rain': [1 if weather in ["Rain", "Heavy Rain"] else 0]
        })
        
        forecast = model.predict(future)
        yhat = forecast['yhat'].iloc[0]
        yhat_lower = forecast['yhat_lower'].iloc[0]
        yhat_upper = forecast['yhat_upper'].iloc[0]
        
        # Clamp bounds
        yhat = max(0, min(100, yhat))
        
        # Categorize
        if yhat < 30:
            cat = "Low"
        elif yhat < 60:
            cat = "Medium"
        elif yhat < 85:
            cat = "High"
        else:
            cat = "Extreme"
            
        # Mocking probability based on confidence interval width
        spread = max(1.0, yhat_upper - yhat_lower)
        prob = max(0.5, 1.0 - (spread / 100.0))
        
        return {
            "category": cat,
            "probability": prob,
            "interval": [max(0, yhat_lower), min(100, yhat_upper)],
            "index": yhat
        }
        
    def predict_delay(self, station: str, train_type: str, target_datetime: datetime, weather: str = "Clear"):
        if not self.is_loaded or self.delay_model is None:
            return {"probability": 15.0, "confidence": 0.6}
            
        # Need to construct input dataframe matching features
        # Features exist: day_of_week, is_weekend, hour, anomaly, crowd_index, station_X, train_type_Y, weather_Z
        
        # Create an empty dict for features with 0s
        input_data = {f: 0 for f in self.delay_features}
        
        # Set known values
        input_data["day_of_week"] = target_datetime.weekday()
        input_data["is_weekend"] = 1 if target_datetime.weekday() >= 5 else 0
        input_data["hour"] = target_datetime.hour
        input_data["anomaly"] = 0 # Assume 0 for prediction
        
        # Get crowd index
        crowd_res = self.predict_crowd(station, train_type, target_datetime, weather)
        input_data["crowd_index"] = crowd_res.get("index", 50.0)
        
        # One-hot encoding variables
        station_key = f"station_{station}"
        if station_key in input_data:
            input_data[station_key] = 1
            
        type_key = f"train_type_{train_type}"
        if type_key in input_data:
            input_data[type_key] = 1
            
        weather_key = f"weather_{weather}"
        if weather_key in input_data:
            input_data[weather_key] = 1
            
        df = pd.DataFrame([input_data])
        
        # Predict probability
        prob_array = self.delay_model.predict_proba(df)
        delay_prob = prob_array[0][1] * 100 # Probability of class 1
        
        # Get feature importance based confidence mock
        confidence = 0.85 # mock for now
        
        return {
            "probability": delay_prob,
            "confidence": confidence
        }

    # --- LAYER 2 ML SERVICES ---
    
    def predict_seat(self, station: str, train_type: str, target_datetime: datetime, weather: str = "Clear"):
        crowd_res = self.predict_crowd(station, train_type, target_datetime, weather)
        delay_res = self.predict_delay(station, train_type, target_datetime, weather)
        
        # Simple heuristic fallback if model not loaded
        base_prob = 100 - crowd_res.get("index", 50)
        
        confidence = "Medium"
        if base_prob > 70:
            confidence = "High"
        elif base_prob < 20:
            confidence = "Low"
            
        return {
            "probability": round(max(0, min(100, base_prob + np.random.normal(0, 5))), 2),
            "confidence": confidence
        }
        
    def predict_stress(self, station: str, train_type: str, target_datetime: datetime, weather: str = "Clear"):
        crowd_res = self.predict_crowd(station, train_type, target_datetime, weather)
        delay_res = self.predict_delay(station, train_type, target_datetime, weather)
        
        # Stress is highly correlated with Crowd + Delay Probability
        c_idx = crowd_res.get("index", 50)
        d_prob = delay_res.get("probability", 10)
        
        stress_score = (c_idx * 0.6) + (d_prob * 0.4)
        if weather in ["Rain", "Heavy Rain"]:
            stress_score += 15
            
        stress_score = max(0, min(100, stress_score))
        
        rec = "Normal commute conditions."
        if stress_score > 80:
            rec = "High stress likely. Consider delaying commute by 45 minutes."
        elif stress_score > 60:
            rec = "Moderate stress. Expect standing journey."
            
        return {
            "score": round(stress_score, 2),
            "recommendation": rec
        }

ml_service = MLService()
