# RailSaathi - Intelligence Behind Every Commute 🚆

An AI-powered web platform designed to predict crowd density, forecast delays, and optimize travel times for the Mumbai Local train network. Built with a robust full-stack architecture.

## 🌟 Executive Overview
RailSaathi acts as a civic-tech tool featuring:
- **Crowd Prediction:** Powered by Prophet time-series models (predicting Low/Medium/High/Extreme).
- **Delay Forecasting:** Predicts delays with confidence bounds using XGBoost Classifiers.
- **Smart Time Optimizer:** Recommends optimal commute windows within a 2-hour timeframe using a custom weighted scoring algorithm adjusting for historical patterns and live anomaly risks.

---

## 🏗 System Architecture

The project operates as a standard production-ready monorepo:
1. **Frontend (Next.js + App Router)**
   - SPA architecture with immersive animated transit transitions mimicking physical train coaches via *Framer Motion*.
   - Dark theme, strictly premium typography (`Inter` & `Outfit`), utility-first design (`TailwindCSS`).
   - Dedicated `/admin` dashboard charting global metric accuracy via Recharts.
2. **Backend (FastAPI)**
   - Exposes RESTful endpoints leveraging `Pydantic` for schema validation.
   - Decoupled `MLService` layer ensuring thread-safe inference logic.
3. **ML Pipeline**
   - Scripts to synthesize hyper-realistic dataset scaling for CSMT, Dadar, Thane, Andheri, and Borivali factoring peak hours, weather effects, and spontaneous anomalies.
   - Automated model exporter packaging tuned artifacts into `backend/models`.

---

## 🚀 Quick Start (Local Development)

### 1. Data Generation & Model Training
First, synthesize the dataset and train the underlying ML models.
```bash
cd ml_pipeline
python -m venv venv
venv\Scripts\activate      # or `source venv/bin/activate` on Mac/Linux
pip install -r requirements.txt
python generate_dataset.py
python train_models.py
```

### 2. Startup Backend Service
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Swagger UI available at: `http://localhost:8000/docs`.

### 3. Startup Frontend Experience
```bash
cd frontend
npm install
npm run dev
```
Navigate to: `http://localhost:3000`.

---

## 🛳 Docker Orchestration

Use the pre-configured `docker-compose.yml` to spin up both containers connected securely.
```bash
docker-compose build
docker-compose up -d
```

---

## 🌍 Production Deployment Guide

### Vercel (Frontend)
1. Push the repository to GitHub.
2. Link the repository to vercel.
3. Modify the **Root Directory** inside the Vercel project settings strictly to `frontend`.
4. Ensure the `NEXT_PUBLIC_API_URL` environment variable is set to your production backend host (e.g., `https://railsaathi-api.onrender.com/api`).
5. Deploy.

### Render / Railway (Backend)
1. Add a new **Web Service**.
2. Set the Root Directory to `backend`.
3. Set Build Command: `pip install -r requirements.txt`
4. Set Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. (Crucial Step): The backend expects the trained `.joblib` model binaries inside `backend/models`. If deploying via Git, ensure your `.gitignore` tracks models (requires Git LFS) or integrate an S3 fetch step in your backend startup script (`services.py`).
6. Deploy.
