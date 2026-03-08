from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI(title="RailSaathi API", description="Intelligence Behind Every Commute", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to load models
@app.on_event("startup")
async def startup_event():
    # Will load ml models here later
    pass

@app.get("/")
def read_root():
    return {"status": "ok", "message": "RailSaathi API is running."}

# Import routers after app initialization to avoid circular imports
from api.routes import router as api_router
from api.auth_routes import router as auth_router
from api.mobility_routes import router as mobility_router
from api.comfort_routes import router as comfort_router
from api.transit_routes import router as transit_router
from api.alert_routes import router as alert_router
app.include_router(api_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(mobility_router, prefix="/api")
app.include_router(comfort_router, prefix="/api")
app.include_router(transit_router, prefix="/api")
app.include_router(alert_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
