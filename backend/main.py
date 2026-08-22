from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import random

from services.fault_detection import detect_fault
from prediction import predict_machine_health

app = FastAPI(
    title="ESA Predictive Maintenance API",
    description="Backend API for Edge AI based predictive maintenance dashboard",
    version="1.0.0"
)


# Allow the React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "ESA Predictive Maintenance API is running",
        "status": "online"
    }


@app.get("/api/sensor-data")
def get_sensor_data():

    temperature = round(random.uniform(65, 78), 1)
    vibration = round(random.uniform(2.5, 4.5), 2)
    current = round(random.uniform(1.8, 2.8), 2)

    result = detect_fault(
        temperature,
        vibration,
        current
    )

    return {
        "timestamp": datetime.now().isoformat(),
        "temperature": temperature,
        "vibration": vibration,
        "current": current,
        "health": result["health"],
        "status": result["status"],
        "fault": result["fault"],
        "warnings": result["warnings"],
        "faults": result["faults"]
    }
    
@app.get("/api/ai-prediction")
def get_ai_prediction():

    temperature = round(random.uniform(65, 80), 1)
    vibration = round(random.uniform(2.0, 5.0), 2)
    current = round(random.uniform(1.5, 3.5), 2)

    prediction = predict_machine_health(
        temperature,
        vibration,
        current
    )

    return {
        "timestamp": datetime.now().isoformat(),
        "temperature": temperature,
        "vibration": vibration,
        "current": current,
        "health": prediction["health"],
        "status": prediction["status"]
    }