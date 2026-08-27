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
    
    # Sensor severity analysis
    if vibration >= 4:
        vibration_severity = "High"
        vibration_message = (
            "Vibration is above the monitored range and "
            "may indicate a mechanical problem."
        )
    elif vibration >= 3.5:
        vibration_severity = "Moderate"
        vibration_message = (
            "Vibration is elevated and should be monitored closely."
        )
    else:
        vibration_severity = "Normal"
        vibration_message = (
            "Vibration is currently within the monitored range."
        )

    if temperature >= 75:
        temperature_severity = "High"
        temperature_message = (
            "Temperature is high and may indicate overheating "
            "or excessive machine load."
        )
    elif temperature >= 72:
        temperature_severity = "Moderate"
        temperature_message = (
            "Temperature is elevated and should be monitored."
        )
    else:
        temperature_severity = "Normal"
        temperature_message = (
            "Temperature is currently within the monitored range."
        )
    
    if current >= 2.4:
        current_severity = "High"
        current_message = (
            "Electrical current is elevated and may indicate "
            "excessive load or motor stress."
        )
    else:
        current_severity = "Normal"
        current_message = (
            "Electrical current is currently within the monitored range."
        )
        
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
        or "operate" in question
        or "operation" in question
    ):

        if status == "Critical":

            answer = (
                f"Safety status: NOT SAFE\n\n"
                f"Machine condition: Critical\n\n"
                f"Continued operation should be avoided until the fault is inspected.\n\n"
                f"Detected fault:\n"
                f"{fault}\n\n"
                f"Recommended action:\n"
                f"{action}"
            )

        elif status == "Warning":

            answer = (
                f"Safety status: CAUTION\n\n"
                f"Machine condition: Warning\n\n"
                f"The machine may continue operating with close monitoring, "
                f"but the identified issue should be inspected.\n\n"
                f"Detected fault:\n"
                f"{fault}\n\n"
                f"Recommended action:\n"
                f"{action}"
            )

        else:

            answer = (
                f"Safety status: SAFE\n\n"
                f"Machine condition: Normal\n\n"
                f"The machine can continue normal operation "
                f"with regular monitoring."
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
            f"Probable cause:\n"
            f"{explanation}\n\n"
            f"Risk:\n"
            f"{'Continued operation may increase machine wear and reduce reliability.' if status != 'Normal' else 'Current machine condition appears normal.'}\n\n"
            f"Recommended action:\n"
            f"{action}"
        )
        
    # Fault questions
    elif (
        "fault" in question
        or "problem" in question
        or "wrong" in question
        or "why is there a fault" in question
        or "what caused the fault" in question
        or "check first" in question
    ):

        answer = (
            f"Detected fault: {fault}\n\n"
            f"Probable cause:\n"
            f"{explanation}\n\n"
            f"Risk:\n"
            f"{'Continued operation may increase machine wear and reduce reliability.' if status != 'Normal' else 'Current machine condition appears normal.'}\n\n"
            f"Recommended action:\n"
            f"{action}"
        )



     # Temperature-specific questions
    elif (
        "temperature" in question
        or "hot" in question
    ):

        answer = (
            f"Temperature: {temperature} °C\n\n"
            f"Severity: {temperature_severity}\n\n"
            f"Meaning:\n"
            f"{temperature_message}\n\n"
            f"Current machine status: {status}\n\n"
            f"Recommended action:\n"
            f"{action}"
        )

    # Vibration-specific questions
    elif (
        "vibration" in question
        or "vibrating" in question
        or "shake" in question
    ):

        answer = (
            f"Vibration: {vibration} mm/s\n\n"
            f"Severity: {vibration_severity}\n\n"
            f"Meaning:\n"
            f"{vibration_message}\n\n"
            f"Current machine status: {status}\n\n"
            f"Recommended action:\n"
            f"{action}"
        )

    # Current-specific questions
    elif (
        "current" in question
        or "electrical" in question
    ):

        answer = (
            f"Electrical current: {current} A\n\n"
            f"Severity: {current_severity}\n\n"
            f"Meaning:\n"
            f"{current_message}\n\n"
            f"Current machine status: {status}\n\n"
            f"Recommended action:\n"
            f"{action}"
        )


    # Health
    elif "health" in question:

        answer = (
            f"Current machine health is {health}%. "
            f"Machine status is {status}."
        )
        
    # Machine condition
    elif (
        "condition" in question
        or "status" in question
    ) and not (
        "fault" in question
        or "problem" in question
        or "why" in question
        or "cause" in question
        or "causing" in question
        or "vibrat" in question
    ):

        answer = (
            f"Current machine status is {status}. "
            f"Machine health is {health}%. "
            f"Temperature is {temperature} °C, "
            f"vibration is {vibration} mm/s, "
            f"and current is {current} A. "
            f"Current fault: {fault}."
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

    # Unknown question
    else:
        answer = (
            "I can help you with:\n\n"
            "• Machine condition\n"
            "• Machine health\n"
            "• Temperature\n"
            "• Vibration\n"
            "• Electrical current\n"
            "• Faults and causes\n"
            "• Safety and operation\n"
            "• Maintenance recommendations"
        )

    return {
        "question": request.question,
        "answer": answer,
        "machine_status": status,
        "health": health,
        "fault": fault
    }