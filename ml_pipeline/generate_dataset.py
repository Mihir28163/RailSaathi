import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import argparse

# Configuration for simulated data
STATIONS = [
    "Chhatrapati Shivaji Maharaj Terminus",
    "Dadar",
    "Thane",
    "Andheri",
    "Borivali"
]
TRAIN_TYPES = ["Fast", "Slow"]
WEATHER_CONDITIONS = ["Clear", "Rain", "Heavy Rain", "Extreme Heat"]

# Function to generate base crowd index based on time of day and day of week
def get_base_crowd(hour, is_weekend):
    if is_weekend:
        # Weekends have lower baseline, slight peaks in afternoon
        if 11 <= hour <= 20:
            return np.random.uniform(40, 60)
        return np.random.uniform(10, 30)
    else:
        # Weekday peaks: 8-11 AM, 6-9 PM
        if 8 <= hour <= 11:
            return np.random.uniform(80, 100) # Morning Peak
        elif 18 <= hour <= 21:
            return np.random.uniform(85, 100) # Evening Peak
        elif 12 <= hour <= 17:
            return np.random.uniform(40, 70)  # Mid-day
        else:
            return np.random.uniform(10, 30)  # Off-peak (night/early morning)

# Function to generate base delay based on time, train type and weather
def get_base_delay_prob(hour, is_weekend, weather, crowd_index):
    base = 5.0 # 5% baseline delay probability
    
    if weather == "Rain":
        base += 15.0
    elif weather == "Heavy Rain":
        base += 40.0
    
    # Delays more likely during peak crowd
    if crowd_index > 80:
        base += 20.0
    elif crowd_index > 60:
        base += 10.0
        
    return min(base, 95.0) # Cap at 95%

def generate_data(start_date, end_date, interval_minutes=15):
    records = []
    
    current_time = start_date
    while current_time <= end_date:
        hour = current_time.hour
        is_weekend = current_time.weekday() >= 5
        
        # Determine weather for the day (roughly 80% clear, 15% rain, 5% others)
        # Simplified: random per hour for variation, realistically should be per day
        weather = np.random.choice(
            WEATHER_CONDITIONS, 
            p=[0.8, 0.1, 0.05, 0.05]
        )
        
        # Introduce random anomaly (e.g. signal failure)
        anomaly = np.random.random() < 0.02 # 2% chance of major anomaly
        
        for station in STATIONS:
            for train_type in TRAIN_TYPES:
                # Add station specific multiplier
                # CSMT and Dadar are generally more crowded
                station_mult = 1.2 if station in ["Dadar", "Chhatrapati Shivaji Maharaj Terminus"] else 1.0
                train_type_mult = 1.1 if train_type == "Fast" else 0.9
                
                base_crowd = get_base_crowd(hour, is_weekend)
                crowd_idx = base_crowd * station_mult * train_type_mult
                
                # Weather effect on crowd (rain slightly reduces non-essential travel, but congests stations)
                if weather != "Clear":
                    crowd_idx *= 1.1 # People wait at stations
                
                if anomaly:
                    crowd_idx *= 1.5
                    
                crowd_idx = min(100.0, max(0.0, crowd_idx))
                
                # Determine crowd category
                if crowd_idx < 30:
                    crowd_category = "Low"
                elif crowd_idx < 60:
                    crowd_category = "Medium"
                elif crowd_idx < 85:
                    crowd_category = "High"
                else:
                    crowd_category = "Extreme"
                    
                # Base probability
                delay_prob = get_base_delay_prob(hour, is_weekend, weather, crowd_idx)
                if anomaly:
                    delay_prob = min(99.0, delay_prob + 50.0)
                    
                # Target delay classification (1 if delayed, 0 if on time)
                is_delayed = 1 if np.random.uniform(0, 100) < delay_prob else 0

                # --- NEW LAYER 2 & 3 FEATURES ---
                # Boarding Density: High in peaks, lower in off-peaks.
                boarding_density = crowd_idx * np.random.uniform(0.8, 1.2)
                boarding_density = min(100.0, max(0.0, boarding_density))
                
                # Seat Probability: Inversely related to boarding density & crowd index
                if crowd_idx > 80:
                    seat_prob = np.random.uniform(0, 5) # Impossible
                elif crowd_idx > 60:
                    seat_prob = np.random.uniform(5, 20) # Very hard
                elif crowd_idx > 30:
                    seat_prob = np.random.uniform(20, 50) # Moderate
                else:
                    seat_prob = np.random.uniform(50, 95) # High
                
                # Stress Index (Regression Target): Function of Crowd + Delay + Weather
                base_stress = crowd_idx * 0.6 + delay_prob * 0.3
                if weather != "Clear":
                    base_stress += 15.0
                if anomaly:
                    base_stress += 25.0
                stress_index = min(100.0, max(0.0, base_stress + np.random.normal(0, 5)))
                
                records.append({
                    "timestamp": current_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "station": station,
                    "train_type": train_type,
                    "day_of_week": current_time.weekday(),
                    "is_weekend": 1 if is_weekend else 0,
                    "hour": hour,
                    "weather": weather,
                    "anomaly": 1 if anomaly else 0,
                    "crowd_index": round(crowd_idx, 2),
                    "crowd_category": crowd_category,
                    "delay_probability": round(delay_prob, 2),
                    "is_delayed": is_delayed,
                    "boarding_density": round(boarding_density, 2),
                    "seat_probability": round(seat_prob, 2),
                    "stress_index": round(stress_index, 2)
                })
        
        current_time += timedelta(minutes=interval_minutes)
        
    return pd.DataFrame(records)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic dataset for Mumbai Local Trains")
    parser.add_argument("--days", type=int, default=180, help="Number of days of data to generate (default 180)")
    parser.add_argument("--output", type=str, default="data/mumbai_local_data.csv", help="Output CSV path")
    args = parser.parse_args()

    # Create output dir if it doesn't exist
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=args.days)
    
    print(f"Generating enhanced Layer 2 synthetic dataset from {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}...")
    
    df = generate_data(start_date, end_date)
    
    # Save to CSV
    df.to_csv(args.output, index=False)
    print(f"Enhanced dataset successfully generated and saved to {args.output}")
    print(f"Total records generated: {len(df)}")
    
    # Display some stats
    print("\nDataset Summary:")
    print(df["crowd_category"].value_counts())
    print(f"Average Stress Index: {df['stress_index'].mean():.2f}")
    print(f"Average Seat Probability: {df['seat_probability'].mean():.2f}%")
