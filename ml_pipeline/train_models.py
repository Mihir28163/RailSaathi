import pandas as pd
import numpy as np
import os
import joblib
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from prophet import Prophet
import argparse
from sklearn.linear_model import LogisticRegression, LinearRegression


def train_delay_model(df, model_dir):
    print("\n--- Training Delay Prediction Model (XGBoost) ---")

    df_delay = df.copy()
    df_delay = pd.get_dummies(df_delay, columns=["station", "train_type", "weather"], drop_first=False)

    features = [col for col in df_delay.columns 
                if col not in ["timestamp", "is_delayed", "crowd_category", "delay_probability"]]

    X = df_delay[features]
    y = df_delay["is_delayed"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = XGBClassifier(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Delay Model Accuracy: {accuracy:.4f}")
    print(classification_report(y_test, y_pred))

    os.makedirs(model_dir, exist_ok=True)
    joblib.dump({"model": model, "features": features},
                os.path.join(model_dir, "delay_model.joblib"))

    print(f"Saved delay model to {model_dir}/delay_model.joblib")


def train_crowd_model(df, model_dir):
    print("\n--- Training Crowd Prediction Model (Prophet) ---")

    models = {}
    stations = df['station'].unique()
    train_types = df['train_type'].unique()

    os.makedirs(model_dir, exist_ok=True)

    for station in stations:
        for t_type in train_types:
            key = f"{station}_{t_type}"
            print(f"Training Prophet model for {key}...")

            subset = df[(df['station'] == station) &
                        (df['train_type'] == t_type)][
                        ['timestamp', 'crowd_index', 'is_weekend', 'weather']]

            subset = subset.rename(columns={'timestamp': 'ds', 'crowd_index': 'y'})
            subset['ds'] = pd.to_datetime(subset['ds'])

            subset['is_rain'] = subset['weather'].isin(['Rain', 'Heavy Rain']).astype(int)

            m = Prophet(yearly_seasonality=False,
                        weekly_seasonality=True,
                        daily_seasonality=True)

            m.add_regressor('is_weekend')
            m.add_regressor('is_rain')

            recent_subset = subset[
                subset['ds'] > (subset['ds'].max() - pd.Timedelta(days=30))
            ]

            m.fit(recent_subset)
            models[key] = m

    joblib.dump(models, os.path.join(model_dir, "crowd_models.joblib"))

    print(f"Saved {len(models)} Prophet models to {model_dir}/crowd_models.joblib")


def train_seat_model(df, model_dir):
    print("\n--- Training Seat Probability Model (Logistic Regression) ---")

    df_seat = df.copy()
    df_seat['seat_likely'] = (df_seat['seat_probability'] >= 50.0).astype(int)

    df_seat = pd.get_dummies(df_seat,
                             columns=["station", "train_type"],
                             drop_first=False)

    features = [col for col in df_seat.columns
                if col not in ["timestamp", "is_delayed",
                               "crowd_category", "delay_probability",
                               "weather", "seat_probability",
                               "seat_likely", "stress_index"]]

    X = df_seat[features]
    y = df_seat["seat_likely"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42)

    model = LogisticRegression(max_iter=1000, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Seat Probability Model Accuracy: {accuracy:.4f}")

    os.makedirs(model_dir, exist_ok=True)
    joblib.dump({"model": model, "features": features},
                os.path.join(model_dir, "seat_model.joblib"))

    print(f"Saved seat model to {model_dir}/seat_model.joblib")


def train_stress_model(df, model_dir):
    print("\n--- Training Stress Index Model (Linear Regression) ---")

    df_stress = df.copy()
    df_stress = pd.get_dummies(df_stress,
                               columns=["station", "train_type", "weather"],
                               drop_first=False)

    features = [col for col in df_stress.columns
                if col not in ["timestamp", "crowd_category", "stress_index"]]

    X = df_stress[features]
    y = df_stress["stress_index"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42)

    model = LinearRegression()
    model.fit(X_train, y_train)

    score = model.score(X_test, y_test)
    print(f"Stress Regression Model R^2 Score: {score:.4f}")

    os.makedirs(model_dir, exist_ok=True)
    joblib.dump({"model": model, "features": features},
                os.path.join(model_dir, "stress_model.joblib"))

    print(f"Saved stress model to {model_dir}/stress_model.joblib")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=str,
                        default="data/mumbai_local_data.csv",
                        help="Path to generated CSV")
    parser.add_argument("--model-dir", type=str,
                        default="../backend/models",
                        help="Directory to save models")

    args = parser.parse_args()

    print(f"Loading data from {args.data}...")
    df = pd.read_csv(args.data)

    train_delay_model(df, args.model_dir)
    train_crowd_model(df, args.model_dir)
    train_seat_model(df, args.model_dir)
    train_stress_model(df, args.model_dir)

    print("\nAll models trained and saved successfully!")