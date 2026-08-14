from fastapi import FastAPI
from datetime import datetime

app = FastAPI(
    title="Edge AI Predictive Maintenance API",
    description="Backend API for the Edge AI based predictive maintenance system",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "Edge AI Predictive Maintenance API is running",
        "status": "online"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "predictive-maintenance-backend",
        "timestamp": datetime.now().isoformat()
    }