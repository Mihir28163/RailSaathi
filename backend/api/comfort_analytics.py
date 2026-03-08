import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from datetime import datetime
from typing import Dict, List, Tuple

class ComfortAnalyticsEngine:
    def __init__(self):
        self.crowd_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.seat_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        self.stress_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        
        # Feature mapping for stations and train types
        self.station_mapping = {
            "Churchgate": 1, "Marine Lines": 2, "Charni Road": 3, "Grant Road": 4,
            "Mumbai Central": 5, "Mahalaxmi": 6, "Lower Parel": 7, "Elphinstone Road": 8,
            "Dadar": 9, "Matunga Road": 10, "Mahim": 11, "Bandra": 12, "Kurla": 13,
            "Sion": 14, "Vidyavihar": 15, "Ghatkopar": 16, "Andheri": 17, "Vile Parle": 18,
            "Santacruz": 19, "Borivali": 20, "Dahisar": 21, "Mira Road": 22, "Vasai Road": 23,
            "Nallasopara": 24, "Chhatrapati Shivaji Terminus": 25, "Masjid Bunder": 26,
            "Sandhurst Road": 27, "Parel": 28, "Currey Road": 29, "Chinchpokli": 30,
            "Byculla": 31, "Mazgaon": 32, "Lalbaug": 33, "Vashi": 34, "Sanpada": 35,
            "Nerul": 36, "Belapur": 37, "Kharghar": 38, "Jogeshwari": 39, "Goregaon": 40,
            "Malad": 41, "Kandivali": 42, "Gorai": 43, "Vikhroli": 44,
            "Kanjurmarg": 45, "Bhandup": 46, "Nahur": 47, "Mulund": 48, "Thane": 49,
            "Mumbra": 50, "Diwa": 51, "Mansarovar": 52, "Seawoods": 53, "Bhiwandi": 54,
            "Matunga": 55, "Madhav Baug": 56, "Khar Road": 57, "Goregaon": 58,
            "Kandivali": 59, "Jogeshwari": 60, "Vikhroli": 61, "Kanjurmarg": 62,
            "Bhandup": 63, "Nahur": 64, "Mulund": 65, "Thane": 66,
            "Mumbra": 67, "Diwa": 68, "Mansarovar": 69, "Seawoods": 70,
            "Bhiwandi": 71, "Nallasopara": 72, "Belapur": 73, "Kharghar": 74
        }
        
        self.train_type_mapping = {"fast": 1, "slow": 0}
        
        # Train with synthetic data if no real data available
        self._train_with_synthetic_data()
    
    def _create_feature_pipeline(self, station: str, time_str: str, train_type: str) -> np.ndarray:
        """Create unified feature pipeline for all predictions"""
        # Parse time
        time_obj = datetime.strptime(time_str, "%H:%M")
        hour = time_obj.hour
        minute = time_obj.minute
        day_of_week = datetime.now().weekday()
        is_weekend = 1 if day_of_week >= 5 else 0
        
        # Time-based features
        time_of_day = hour + minute / 60.0
        is_peak_hour = 1 if (8 <= hour <= 11) or (17 <= hour <= 20) else 0
        is_morning_peak = 1 if 8 <= hour <= 11 else 0
        is_evening_peak = 1 if 17 <= hour <= 20 else 0
        
        # Station and train type features
        station_id = self.station_mapping.get(station, 0)
        train_type_id = self.train_type_mapping.get(train_type.lower(), 0)
        
        # Historical delay (mock data based on station and time)
        historical_delay = self._get_historical_delay(station_id, hour)
        
        # Create feature vector
        features = np.array([
            time_of_day,           # Continuous time value
            hour,                  # Hour of day
            minute,                # Minute
            day_of_week,           # Day of week (0-6)
            is_weekend,            # Weekend indicator
            is_peak_hour,          # Peak hour indicator
            is_morning_peak,       # Morning peak indicator
            is_evening_peak,       # Evening peak indicator
            station_id,            # Station ID
            train_type_id,         # Train type (fast=1, slow=0)
            historical_delay       # Historical delay for this station/time
        ])
        
        return features.reshape(1, -1)
    
    def _get_historical_delay(self, station_id: int, hour: int) -> float:
        """Mock historical delay based on station and time"""
        # Base delay varies by station (major stations have more delays)
        base_delay = {
            1: 15, 2: 12, 3: 10, 4: 8,    # South Mumbai
            5: 18, 6: 15, 7: 12, 8: 20,   # Central Mumbai
            9: 25, 10: 20, 11: 18, 12: 22, # Dadar and beyond
            13: 20, 14: 18, 15: 15, 16: 17,
            17: 15, 18: 12, 19: 10, 20: 8,
            21: 6, 22: 5, 23: 3
        }.get(station_id, 10)
        
        # Adjust for peak hours
        if 8 <= hour <= 11:
            base_delay *= 1.5
        elif 17 <= hour <= 20:
            base_delay *= 1.8
        
        return base_delay
    
    def _train_with_synthetic_data(self):
        """Train models with synthetic data"""
        # Generate synthetic training data
        n_samples = 1000
        X_train = []
        y_crowd = []
        y_seat = []
        y_stress = []
        
        for _ in range(n_samples):
            # Random features
            station_id = np.random.choice(list(self.station_mapping.values()))
            train_type_id = np.random.choice([0, 1])
            hour = np.random.randint(5, 24)
            minute = np.random.randint(0, 60)
            day_of_week = np.random.randint(0, 7)
            is_weekend = 1 if day_of_week >= 5 else 0
            is_peak_hour = 1 if (8 <= hour <= 11) or (17 <= hour <= 20) else 0
            is_morning_peak = 1 if 8 <= hour <= 11 else 0
            is_evening_peak = 1 if 17 <= hour <= 20 else 0
            time_of_day = hour + minute / 60.0
            historical_delay = self._get_historical_delay(station_id, hour)
            
            features = [
                time_of_day, hour, minute, day_of_week, is_weekend,
                is_peak_hour, is_morning_peak, is_evening_peak,
                station_id, train_type_id, historical_delay
            ]
            
            # Generate synthetic targets with realistic patterns
            base_crowd = 50 + (20 if is_peak_hour else 0) + (10 if train_type_id == 0 else -5)
            crowd_level = max(10, min(95, base_crowd + np.random.normal(0, 15)))
            
            base_seat = 60 - (25 if is_peak_hour else 0) + (15 if train_type_id == 1 else -10)
            seat_probability = max(5, min(95, base_seat + np.random.normal(0, 20)))
            
            base_stress = crowd_level * 0.6 + historical_delay * 0.4
            stress_index = max(10, min(95, base_stress + np.random.normal(0, 10)))
            
            X_train.append(features)
            y_crowd.append(crowd_level)
            y_seat.append(seat_probability)
            y_stress.append(stress_index)
        
        X_train = np.array(X_train)
        y_crowd = np.array(y_crowd)
        y_seat = np.array(y_seat)
        y_stress = np.array(y_stress)
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        
        # Train models
        self.crowd_model.fit(X_train_scaled, y_crowd)
        self.seat_model.fit(X_train_scaled, y_seat)
        self.stress_model.fit(X_train_scaled, y_stress)
        
        self.is_trained = True
    
    def predict_comfort(self, station: str, time: str, train_type: str) -> Dict[str, float]:
        """Make unified comfort prediction"""
        if not self.is_trained:
            # Fallback to rule-based predictions
            return self._rule_based_prediction(station, time, train_type)
        
        try:
            # Create features
            features = self._create_feature_pipeline(station, time, train_type)
            features_scaled = self.scaler.transform(features)
            
            # Make predictions
            crowd_level = self.crowd_model.predict(features_scaled)[0]
            seat_probability = self.seat_model.predict(features_scaled)[0]
            stress_index = self.stress_model.predict(features_scaled)[0]
            
            # Ensure values are within valid ranges
            crowd_level = max(0, min(100, crowd_level))
            seat_probability = max(0, min(100, seat_probability))
            stress_index = max(0, min(100, stress_index))
            
            return {
                "crowd_level": round(crowd_level, 2),
                "seat_probability": round(seat_probability, 2),
                "stress_index": round(stress_index, 2)
            }
            
        except Exception as e:
            print(f"Error in ML prediction: {e}")
            return self._rule_based_prediction(station, time, train_type)
    
    def _rule_based_prediction(self, station: str, time: str, train_type: str) -> Dict[str, float]:
        """Fallback rule-based prediction"""
        try:
            time_obj = datetime.strptime(time, "%H:%M")
            hour = time_obj.hour
            
            # Simple rule-based logic
            is_peak = (8 <= hour <= 11) or (17 <= hour <= 20)
            is_fast = train_type.lower() == "fast"
            
            # Base values
            crowd_level = 70 if is_peak else 40
            seat_probability = 25 if is_peak else 65
            stress_index = 75 if is_peak else 45
            
            # Adjust for train type
            if is_fast:
                crowd_level += 10
                seat_probability -= 15
                stress_index += 5
            
            # Adjust for major stations
            major_stations = ["Dadar", "Churchgate", "Mumbai Central", "Bandra", "Andheri"]
            if station in major_stations:
                crowd_level += 15
                seat_probability -= 20
                stress_index += 10
            
            return {
                "crowd_level": round(crowd_level, 2),
                "seat_probability": round(seat_probability, 2),
                "stress_index": round(stress_index, 2)
            }
            
        except:
            # Ultimate fallback
            return {
                "crowd_level": 50.0,
                "seat_probability": 50.0,
                "stress_index": 50.0
            }

# Global instance
comfort_engine = ComfortAnalyticsEngine()
