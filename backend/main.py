from unittest import result

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
    health = result.get("health", 85)
    
    fault = result.get("fault", "No fault detected")

    if fault == "Elevated vibration":
        fault_explanation = "High vibration may indicate bearing wear, imbalance, or mechanical misalignment."
        recommended_action = "Inspect bearings, check shaft alignment, and verify machine mounting."

    elif fault == "Critical vibration":
        fault_explanation = "Critical vibration indicates a potentially serious mechanical abnormality."
        recommended_action = "Stop the machine if necessary and inspect bearings, shaft alignment, and rotating components."

    elif fault == "Elevated current":
        fault_explanation = "High current may indicate excessive load, motor stress, or electrical problems."
        recommended_action = "Check machine load, motor condition, wiring, and electrical connections."

    elif fault == "High temperature":
        fault_explanation = "High temperature may indicate overheating, insufficient cooling, or excessive mechanical load."
        recommended_action = "Check cooling system, ventilation, lubrication, and machine load."

    else:
        fault_explanation = "No significant fault detected."
        recommended_action = "Continue normal monitoring."

    return {
        "timestamp": datetime.now().isoformat(),
        "temperature": temperature,
        "vibration": vibration,
        "current": current,
        "health": health,
        "status": result.get("status", "Normal"),
        "fault": fault,
        "fault_explanation": fault_explanation,
        "recommended_action": recommended_action,
        "warnings": result.get("warnings", []),
        "faults": result.get("faults", [])
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
    
    
from pydantic import BaseModel


class ChatRequest(BaseModel):
    question: str


@app.post("/api/chat")
def maintenance_chat(request: ChatRequest):

    question = request.question.lower()

    # Get the latest machine data
    sensor_response = get_sensor_data()

    temperature = sensor_response["temperature"]
    vibration = sensor_response["vibration"]
    current = sensor_response["current"]
    health = sensor_response["health"]
    status = sensor_response["status"]
    fault = sensor_response["fault"]
    explanation = sensor_response["fault_explanation"]
    action = sensor_response["recommended_action"]
    
    # Maintenance diagnosis
    if fault == "Elevated vibration":

        probable_cause = (
            "Possible bearing wear, shaft misalignment, "
            "mechanical imbalance, or loose mounting."
        )

        machine_risk = (
            "Continued high vibration may cause mechanical "
            "wear and reduce machine reliability."
        )

    elif fault == "High temperature":

        probable_cause = (
            "Possible overheating, insufficient cooling, "
            "excessive load, or lubrication problems."
        )

        machine_risk = (
            "Continued overheating may damage machine "
            "components and reduce operating life."
        )

    elif fault == "High current":

        probable_cause = (
            "Possible excessive load, motor stress, "
            "electrical abnormality, or mechanical resistance."
        )

        machine_risk = (
            "Continued high current may cause motor "
            "overheating or electrical damage."
        )

    elif fault == "Multiple abnormalities":

        probable_cause = (
            "Multiple sensor readings are outside the "
            "expected operating range."
        )

        machine_risk = (
            "The machine may be experiencing a serious "
            "operating abnormality and requires inspection."
        )

    else:

        probable_cause = (
            "No significant abnormality has been detected."
        )

        machine_risk = (
            "Current machine condition appears normal."
        )
    
    # Safety / Continue Running
    if (
        "safe" in question
        or "continue" in question
        or "run" in question
        or "running" in question
    ):

        if status == "Critical":

            answer = (
                f"The machine is currently in a Critical condition. "
                f"Continued operation should be avoided until the fault is inspected. "
                f"Current fault: {fault}. "
                f"Recommended action: {action}"
            )

        elif status == "Warning":

            answer = (
                f"The machine is currently in a Warning condition. "
                f"It can be monitored, but the identified fault should be inspected. "
                f"Current fault: {fault}. "
                f"Recommended action: {action}"
            )

        else:

            answer = (
                f"The machine is currently Normal. "
                f"It is safe to continue normal operation with regular monitoring."
            )


    # Machine condition
    elif (
        "condition" in question
        or "status" in question
        or "machine" in question
    ):

        answer = (
            f"Current machine status is {status}. "
            f"Machine health is {health}%. "
            f"Temperature is {temperature} °C, "
            f"vibration is {vibration} mm/s, "
            f"and current is {current} A. "
            f"Current fault: {fault}."
        )

    # Fault
    elif (
        "fault" in question
        or "problem" in question
        or "wrong" in question
        or "why" in question
        or "cause" in question
        or "causing" in question
        or "vibrating" in question
        or "vibration" in question
        or "check first" in question
    ):

        answer = (
            f"Detected fault: {fault}\n\n"
            f"Probable cause:\n"
            f"{probable_cause}\n\n"
            f"Risk:\n"
            f"{machine_risk}\n\n"
            f"Recommended action:\n"
            f"{action}"
        )
        
    # Maintenance
    elif (
        "solution" in question
        or "fix" in question
        or "action" in question
        or "maintenance" in question
        or "what should i do" in question
    ):

        answer = (
            f"Detected fault: {fault}\n\n"
            f"Recommended maintenance action: {action}\n\n"
            f"Probable cause: {probable_cause}\n"
        )

    # Health
    elif "health" in question:

        answer = (
            f"Current machine health is {health}%. "
            f"Machine status is {status}."
        )

    # Temperature
    elif (
        "temperature" in question
        or "hot" in question
    ):

        answer = (
            f"Current temperature is {temperature} °C."
        )

    # Vibration
    elif (
        "vibration" in question
        or "shake" in question
    ):

        answer = (
            f"Current vibration is {vibration} mm/s. "
        )

        if vibration >= 4:
            answer += (
                "The vibration level is high and "
                "should be inspected."
            )
        else:
            answer += (
                "The vibration level is currently "
                "within the monitored range."
            )

    # Current
    elif (
        "current" in question
        or "electrical" in question
    ):

        answer = (
            f"Current electrical current is {current} A."
        )

    # Safety
    elif (
        "safe" in question
        or "continue" in question
        or "run" in question
    ):

        if status == "Critical":

            answer = (
                "The machine is currently in a Critical "
                "condition. Continued operation should "
                "be avoided until the fault is inspected. "
                f"Current fault: {fault}. "
                f"Recommended action: {action}"
            )

        elif status == "Warning":

            answer = (
                "The machine is currently in a Warning "
                "condition. It should be monitored closely. "
                f"Current fault: {fault}. "
                f"Recommended action: {action}"
            )

        else:

            answer = (
                "The machine is currently Normal. "
                "Continue normal monitoring and "
                "preventive maintenance."
            )

    # Greeting
    elif (
        "hello" in question
        or "hi" in question
    ):

        answer = (
            "Hello! I am your maintenance assistant. "
            "I can help you understand the current "
            "machine condition, faults, sensor values, "
            "and maintenance actions."
        )

    else:

        answer = (
            "I can help with machine condition, health, "
            "temperature, vibration, current, faults, "
            "safety, and maintenance recommendations."
        )

    return {
        "question": request.question,
        "answer": answer,
        "machine_status": status,
        "health": health,
        "fault": fault
    }