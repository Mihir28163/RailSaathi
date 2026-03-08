from datetime import datetime, timedelta
from typing import Dict, List
import numpy as np

class SmartAlertEngine:
    def __init__(self):
        # Initialize thresholds and patterns
        self.crowd_thresholds = {
            'low': 30,
            'medium': 60,
            'high': 80
        }
        self.delay_thresholds = {
            'low': 5,
            'medium': 15,
            'high': 25
        }
        self.seat_thresholds = {
            'low': 30,
            'medium': 60,
            'high': 80
        }
        
        # Station-specific patterns
        self.station_patterns = {
            'Dadar': {'base_crowd': 75, 'peak_hours': [8, 9, 18, 19]},
            'Andheri': {'base_crowd': 70, 'peak_hours': [8, 9, 18, 19]},
            'Bandra': {'base_crowd': 65, 'peak_hours': [8, 9, 18, 19]},
            'Borivali': {'base_crowd': 60, 'peak_hours': [8, 9, 18, 19]},
            'Churchgate': {'base_crowd': 80, 'peak_hours': [9, 18, 19]},
            'Mumbai Central': {'base_crowd': 70, 'peak_hours': [8, 9, 18, 19]}
        }
    
    def _get_hour_from_time(self, time_str: str) -> int:
        """Extract hour from time string"""
        try:
            return int(time_str.split(':')[0])
        except:
            return 9  # Default to 9 AM
    
    def _predict_crowd_level(self, station: str, time: str) -> Dict:
        """Predict crowd level for station and time"""
        hour = self._get_hour_from_time(time)
        station_pattern = self.station_patterns.get(station, {'base_crowd': 50, 'peak_hours': [8, 9, 18, 19]})
        
        base_crowd = station_pattern['base_crowd']
        
        # Add variation based on time
        if hour in station_pattern['peak_hours']:
            crowd = base_crowd + np.random.normal(15, 5)
        else:
            crowd = base_crowd + np.random.normal(-10, 5)
        
        # Add some randomness
        crowd += np.random.normal(0, 8)
        crowd = max(0, min(100, crowd))
        
        return {
            'level': round(crowd),
            'category': self._get_crowd_category(crowd),
            'is_high': crowd > self.crowd_thresholds['high']
        }
    
    def _get_crowd_category(self, crowd_level: float) -> str:
        """Get crowd category based on level"""
        if crowd_level >= self.crowd_thresholds['high']:
            return 'extreme'
        elif crowd_level >= self.crowd_thresholds['medium']:
            return 'high'
        elif crowd_level >= self.crowd_thresholds['low']:
            return 'medium'
        else:
            return 'low'
    
    def _predict_delay_probability(self, station: str, time: str) -> Dict:
        """Predict delay probability"""
        hour = self._get_hour_from_time(time)
        station_pattern = self.station_patterns.get(station, {'peak_hours': [8, 9, 18, 19]})
        
        base_delay = 10  # Base delay probability
        
        # Increase delay during peak hours
        if hour in station_pattern['peak_hours']:
            delay_prob = base_delay + np.random.normal(15, 5)
        else:
            delay_prob = base_delay + np.random.normal(-5, 3)
        
        # Add station-specific factors
        if station in ['Dadar', 'Andheri', 'Bandra']:
            delay_prob += np.random.normal(5, 2)
        
        # Add randomness
        delay_prob += np.random.normal(0, 8)
        delay_prob = max(0, min(100, delay_prob))
        
        return {
            'probability': round(delay_prob),
            'category': self._get_delay_category(delay_prob),
            'is_high': delay_prob > self.delay_thresholds['high']
        }
    
    def _get_delay_category(self, delay_prob: float) -> str:
        """Get delay category based on probability"""
        if delay_prob >= self.delay_thresholds['high']:
            return 'very_high'
        elif delay_prob >= self.delay_thresholds['medium']:
            return 'high'
        elif delay_prob >= self.delay_thresholds['low']:
            return 'medium'
        else:
            return 'low'
    
    def _predict_seat_probability(self, station: str, time: str) -> Dict:
        """Predict seat probability"""
        crowd_prediction = self._predict_crowd_level(station, time)
        
        # Seat probability is inversely related to crowd
        seat_prob = max(10, 100 - crowd_prediction['level'] + np.random.normal(0, 10))
        
        return {
            'probability': round(seat_prob),
            'category': self._get_seat_category(seat_prob),
            'is_low': seat_prob < self.seat_thresholds['low']
        }
    
    def _get_seat_category(self, seat_prob: float) -> str:
        """Get seat category based on probability"""
        if seat_prob >= self.seat_thresholds['high']:
            return 'high'
        elif seat_prob >= self.seat_thresholds['medium']:
            return 'medium'
        elif seat_prob >= self.seat_thresholds['low']:
            return 'low'
        else:
            return 'very_low'
    
    def _generate_alternative_trains(self, station: str, time: str) -> List[str]:
        """Generate alternative train suggestions"""
        hour = self._get_hour_from_time(time)
        
        alternatives = []
        
        # Suggest earlier trains
        if hour > 6:
            alternatives.append(f"{hour-1:45 Fast")
            alternatives.append(f"{hour-1:30 Slow")
        
        # Suggest later trains
        if hour < 22:
            alternatives.append(f"{hour+0:15 Fast")
            alternatives.append(f"{hour+0:30 Slow")
        
        # Suggest different routes if applicable
        if station == 'Dadar':
            alternatives.append("Take Harbour Line to Wadala")
            alternatives.append("Take Central Line to Kurla")
        
        return alternatives[:3]  # Return top 3 suggestions
    
    def generate_smart_alerts(self, user_id: int, station: str, time: str) -> Dict:
        """Generate comprehensive smart alerts"""
        
        # Get predictions
        crowd_pred = self._predict_crowd_level(station, time)
        delay_pred = self._predict_delay_probability(station, time)
        seat_pred = self._predict_seat_probability(station, time)
        
        # Generate alerts
        alerts = []
        
        # Crowd alerts
        if crowd_pred['is_high']:
            alerts.append(f"High crowd expected at {station} around {time}")
        elif crowd_pred['level'] > 50:
            alerts.append(f"Moderate crowd expected at {station}")
        
        # Delay alerts
        if delay_pred['is_high']:
            alerts.append(f"High delay probability on your route ({delay_pred['probability']}%)")
        elif delay_pred['probability'] > 15:
            alerts.append(f"Possible delays expected near {station}")
        
        # Seat alerts
        if seat_pred['is_low']:
            alerts.append(f"Low seat probability ({seat_pred['probability']}%)")
        elif seat_pred['probability'] < 40:
            alerts.append(f"Limited seating availability expected")
        
        # Generate recommendations
        alternatives = self._generate_alternative_trains(station, time)
        recommendations = []
        
        if delay_pred['is_high'] or crowd_pred['is_high']:
            recommendations.extend(alternatives)
        
        if seat_pred['is_low']:
            recommendations.append("Consider booking advance tickets")
            recommendations.append("Try earlier trains for better seating")
        
        # Determine overall severity
        severity_count = 0
        if crowd_pred['is_high']:
            severity_count += 1
        if delay_pred['is_high']:
            severity_count += 1
        if seat_pred['is_low']:
            severity_count += 1
        
        if severity_count >= 2:
            severity = 'high'
        elif severity_count >= 1:
            severity = 'medium'
        else:
            severity = 'low'
        
        return {
            'alerts': alerts,
            'severity': severity,
            'recommendations': recommendations,
            'predictions': {
                'crowd': crowd_pred,
                'delay': delay_pred,
                'seat': seat_pred
            }
        }
