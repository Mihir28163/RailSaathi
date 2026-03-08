import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import statistics

class AnomalyDetectionEngine:
    def __init__(self):
        # Initialize Isolation Forest model
        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.1,  # Expect 10% anomalies
            random_state=42
        )
        self.scaler = StandardScaler()
        self.is_trained = False
        
        # Historical data storage (in production, this would be a database)
        self.historical_delays = {}
        self.station_delays = {}
        
        # Train with synthetic data
        self._train_with_synthetic_data()
    
    def _train_with_synthetic_data(self):
        """Train the model with synthetic historical data"""
        # Generate synthetic delay data for different stations and times
        np.random.seed(42)
        
        # Create synthetic dataset
        n_samples = 1000
        data = []
        
        stations = ['Churchgate', 'Dadar', 'Andheri', 'Bandra', 'Borivali', 'Virar', 
                   'Kurla', 'Ghatkopar', 'Vasai Road', 'Mumbai Central']
        
        for i in range(n_samples):
            station = np.random.choice(stations)
            hour = np.random.randint(5, 23)  # Train hours 5 AM to 11 PM
            
            # Normal delays based on station and time
            base_delay = np.random.normal(5, 2)  # Base delay 5 minutes
            
            # Peak hours have higher delays
            if 8 <= hour <= 11 or 17 <= hour <= 20:
                base_delay += np.random.normal(3, 1)
            
            # Some stations are more congested
            if station in ['Dadar', 'Andheri', 'Bandra']:
                base_delay += np.random.normal(2, 1)
            
            # Cap delay to reasonable values
            base_delay = max(0, min(base_delay, 30))
            
            data.append({
                'station_id': self._get_station_id(station),
                'hour': hour,
                'is_peak': 1 if (8 <= hour <= 11 or 17 <= hour <= 20) else 0,
                'delay_minutes': base_delay
            })
        
        df = pd.DataFrame(data)
        
        # Prepare features
        feature_columns = ['station_id', 'hour', 'is_peak']
        X = df[feature_columns].values
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled)
        self.is_trained = True
        
        # Store historical averages for statistical detection
        for station in stations:
            station_data = df[df['station_id'] == self._get_station_id(station)]
            self.station_delays[station] = {
                'mean_delay': station_data['delay_minutes'].mean(),
                'std_delay': station_data['delay_minutes'].std(),
                'peak_mean': station_data[station_data['is_peak'] == 1]['delay_minutes'].mean(),
                'off_peak_mean': station_data[station_data['is_peak'] == 0]['delay_minutes'].mean()
            }
    
    def _get_station_id(self, station: str) -> int:
        """Convert station name to ID"""
        station_mapping = {
            'Churchgate': 1, 'Dadar': 2, 'Andheri': 3, 'Bandra': 4,
            'Borivali': 5, 'Virar': 6, 'Kurla': 7, 'Ghatkopar': 8,
            'Vasai Road': 9, 'Mumbai Central': 10, 'Marine Lines': 11,
            'Charni Road': 12, 'Grant Road': 13, 'Mahalaxmi': 14,
            'Lower Parel': 15, 'Elphinstone Road': 16, 'Matunga Road': 17,
            'Mahim': 18, 'Matunga': 19, 'Sion': 20, 'Vidyavihar': 21
        }
        return station_mapping.get(station, 0)
    
    def _parse_time(self, time_str: str) -> datetime:
        """Parse time string to datetime object"""
        try:
            return datetime.strptime(time_str, "%H:%M")
        except:
            # Handle different formats
            return datetime.strptime(time_str.split()[0], "%H:%M")
    
    def _calculate_delay(self, scheduled_time: str, actual_time: str) -> int:
        """Calculate delay in minutes"""
        scheduled = self._parse_time(scheduled_time)
        actual = self._parse_time(actual_time)
        
        # Handle cases where actual time is next day
        if actual < scheduled:
            actual += timedelta(days=1)
        
        delay = (actual - scheduled).total_seconds() / 60
        return max(0, int(delay))
    
    def detect_anomaly(self, station: str, train_id: str, 
                      scheduled_time: str, actual_time: str) -> Dict:
        """Detect if the delay is anomalous"""
        if not self.is_trained:
            return {
                'delay_minutes': 0,
                'is_anomaly': False,
                'message': 'Model not trained yet',
                'confidence': 0.0
            }
        
        # Calculate delay
        delay = self._calculate_delay(scheduled_time, actual_time)
        
        # Get actual time for hour calculation
        actual_dt = self._parse_time(actual_time)
        hour = actual_dt.hour
        is_peak = 1 if (8 <= hour <= 11 or 17 <= hour <= 20) else 0
        
        # Prepare features for prediction
        station_id = self._get_station_id(station)
        features = np.array([[station_id, hour, is_peak]])
        features_scaled = self.scaler.transform(features)
        
        # Predict anomaly
        anomaly_score = self.model.decision_function(features_scaled)[0]
        is_anomaly_ml = self.model.predict(features_scaled)[0] == -1
        
        # Statistical detection
        station_stats = self.station_delays.get(station, {'mean_delay': 5, 'std_delay': 2})
        z_score = (delay - station_stats['mean_delay']) / max(station_stats['std_delay'], 1)
        is_anomaly_stat = abs(z_score) > 2.5  # More than 2.5 standard deviations
        
        # Combine both methods
        is_anomaly = is_anomaly_ml or is_anomaly_stat or delay > 20  # Also flag if delay > 20 mins
        
        # Generate message
        if is_anomaly:
            if delay > 20:
                message = f"Major service disruption detected at {station}"
            elif is_anomaly_ml:
                message = f"Possible service disruption detected at {station}"
            else:
                message = f"Unusual delay pattern at {station}"
        else:
            message = f"Normal operation at {station}"
        
        # Calculate confidence
        confidence = min(0.95, abs(anomaly_score) / 3.0)
        confidence = max(0.5, confidence)
        
        return {
            'delay_minutes': delay,
            'is_anomaly': is_anomaly,
            'message': message,
            'confidence': round(confidence, 2)
        }
