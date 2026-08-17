from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import random

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

    temperature = round(random.uniform(65, 75), 1)
    vibration = round(random.uniform(2.5, 4.0), 2)
    current = round(random.uniform(1.8, 2.6), 2)

    health = 100

    if temperature > 72:
        health -= 20

    if vibration > 3.5:
        health -= 20

    if current > 2.4:
        health -= 15

    health = max(40, health)

    if health >= 80:
        status = "Normal"
        fault = "No fault detected"

    elif health >= 60:
        status = "Warning"
        fault = "Abnormal sensor condition"

    else:
        status = "Critical"
        fault = "Possible machine fault"

    return {
        "timestamp": datetime.now().isoformat(),
        "temperature": temperature,
        "vibration": vibration,
        "current": current,
        "health": health,
        "status": status,
        "fault": fault
    }