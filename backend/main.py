"""
ESA Predictive Maintenance System - Backend API
FastAPI service delivering real-time industrial telemetry, AI health predictions,
fault diagnostics, multi-machine tracking, and conversational maintenance assistance.
"""

import logging
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config.thresholds import SENSOR_THRESHOLDS, HEALTH_THRESHOLDS, get_sensor_severity
from services.machine_manager import manager
from services.health_calculation import calculate_machine_health
from services.fault_detection import detect_fault
from prediction import predict_machine_health

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("esa_backend")

# Initialize FastAPI App
app = FastAPI(
    title="ESA Predictive Maintenance API",
    description="Edge AI Based Predictive Maintenance Monitoring Platform",
    version="2.0.0"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# PYDANTIC DATA CONTRACTS
# =========================================================

class ChatRequest(BaseModel):
    question: str
    machine_id: Optional[str] = "MTR-001"


class TelemetryInput(BaseModel):
    machine_id: str
    temperature: Optional[float] = Field(None, description="Temperature in °C")
    vibration: Optional[float] = Field(None, description="Vibration in mm/s")
    current: Optional[float] = Field(None, description="Current in A")


class FaultSimulationRequest(BaseModel):
    mode: str = Field(
        ...,
        description="Simulation mode: normal, high_temperature, elevated_temperature, excessive_vibration, elevated_vibration, over_current, elevated_current, multiple"
    )


# =========================================================
# API ENDPOINTS
# =========================================================

@app.get("/")
def root():
    """Service health check."""
    return {
        "message": "ESA Predictive Maintenance API is active",
        "status": "online",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/thresholds")
def get_thresholds():
    """Retrieve centralized sensor thresholds and health status criteria."""
    return {
        "sensor_thresholds": SENSOR_THRESHOLDS,
        "health_thresholds": HEALTH_THRESHOLDS
    }


@app.get("/api/machines")
def get_machines():
    """Retrieve list of all monitored machines."""
    return manager.list_machines()


@app.get("/api/machines/{machine_id}")
def get_machine_detail(machine_id: str):
    """Retrieve details and live telemetry for a specific machine."""
    machine = manager.get_machine(machine_id)
    machine.update_simulation()
    return machine.get_full_status()


@app.get("/api/sensor-data")
def get_sensor_data(machine_id: Optional[str] = Query("MTR-001")):
    """
    Get live sensor telemetry, health, and fault diagnostics for the active machine.
    Advances the simulation smoothly.
    """
    try:
        machine = manager.get_machine(machine_id)
        machine.update_simulation()
        return machine.get_full_status()
    except Exception as e:
        logger.error(f"Error generating sensor data for {machine_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to retrieve sensor data")


@app.get("/api/ai-prediction")
def get_ai_prediction(machine_id: Optional[str] = Query("MTR-001")):
    """
    Get AI-based health prediction, risk assessment, and RUL for the current machine telemetry.
    """
    try:
        machine = manager.get_machine(machine_id)
        prediction = predict_machine_health(
            machine.current_temp,
            machine.current_vib,
            machine.current_curr
        )
        return {
            "machine_id": machine.id,
            "timestamp": datetime.now().isoformat(),
            "temperature": machine.current_temp,
            "vibration": machine.current_vib,
            "current": machine.current_curr,
            "health": prediction["health"],
            "current_health": prediction["current_health"],
            "status": prediction["status"],
            "risk": prediction["risk"],
            "recommendation": prediction["recommendation"],
            "anomaly_score": prediction["anomaly_score"],
            "estimated_rul_hours": prediction["estimated_rul_hours"],
            "model_version": prediction["model_version"],
        }
    except Exception as e:
        logger.error(f"Error calculating AI prediction for {machine_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate AI prediction")


@app.post("/api/chat")
def maintenance_chat(request: ChatRequest):
    """
    AI Maintenance Assistant chatbot.
    Answers diagnostic, safety, sensor, and maintenance questions using active telemetry.
    Prioritizes specific sensor and safety questions before generic matching.
    """
    try:
        raw_question = request.question.strip()
        question = raw_question.lower()
        machine_id = request.machine_id or "MTR-001"

        machine = manager.get_machine(machine_id)
        status_data = machine.get_full_status()

        temperature = status_data["temperature"]
        vibration = status_data["vibration"]
        current = status_data["current"]
        health = status_data["health"]
        status = status_data["status"]
        fault = status_data["fault"]
        explanation = status_data.get("fault_explanation", "Normal machine operation.")
        action = status_data.get("recommended_action", "Continue standard predictive monitoring.")
        ai_pred = status_data.get("ai_prediction", {})
        ai_risk = ai_pred.get("risk", "Low")
        source = status_data.get("source", "simulated")

        temp_sev = get_sensor_severity("temperature", temperature)
        vib_sev = get_sensor_severity("vibration", vibration)
        curr_sev = get_sensor_severity("current", current)

        # Context prefix adhering to safety standards
        context_prefix = (
            f"Based on current telemetry for {machine.name} ({machine_id}) [{source}]:\n\n"
        )

        # -------------------------------------------------------------
        # 1. SAFETY & OPERATION QUERIES (Checked FIRST)
        # -------------------------------------------------------------
        if any(w in question for w in ["safe", "continue", "operate", "operation", "shut down", "stop", "danger", "run"]):
            if status == "Critical":
                answer = (
                    f"{context_prefix}"
                    f"⚠️ Safety Status: NOT SAFE\n"
                    f"• Machine Condition: Critical (Health: {health}%)\n"
                    f"• Active Fault: {fault}\n"
                    f"• Risk Assessment: High\n\n"
                    f"Explanation:\n{explanation}\n\n"
                    f"Recommended Action:\n{action}\n\n"
                    f"Continued operation risks severe mechanical or electrical failure. Immediately disconnect and perform inspection."
                )
            elif status == "Warning":
                answer = (
                    f"{context_prefix}"
                    f"⚠️ Safety Status: CAUTION\n"
                    f"• Machine Condition: Warning (Health: {health}%)\n"
                    f"• Active Issue: {fault}\n"
                    f"• Risk Assessment: Moderate\n\n"
                    f"Explanation:\n{explanation}\n\n"
                    f"Recommended Action:\n{action}\n\n"
                    f"The machine may continue temporary operation under close supervision, but inspection is strongly advised."
                )
            else:
                answer = (
                    f"{context_prefix}"
                    f"✅ Safety Status: SAFE TO OPERATE\n"
                    f"• Machine Condition: Normal (Health: {health}%)\n"
                    f"• Active Fault: None detected\n"
                    f"• AI Risk Assessment: Low\n\n"
                    f"All monitored parameters (Temperature, Vibration, Current) are within safe engineering limits."
                )

        # -------------------------------------------------------------
        # 2. VIBRATION-SPECIFIC QUERIES (Checked before generic machine queries)
        # -------------------------------------------------------------
        elif any(w in question for w in ["vibrat", "shake", "shaking", "bearing", "alignment", "oscillation"]):
            answer = (
                f"{context_prefix}"
                f"📊 Vibration Analysis:\n"
                f"• Current Reading: {vibration} mm/s\n"
                f"• Severity: {vib_sev} (Warning: >= 5.0 mm/s, Critical: >= 8.0 mm/s)\n\n"
                f"Meaning:\n"
                f"{'Vibration is critical! High risk of mechanical bearing failure, severe imbalance, or looseness.' if vib_sev == 'Critical' else 'Vibration is elevated above normal. May indicate early bearing wear, shaft misalignment, or unbalance.' if vib_sev == 'Warning' else 'Vibration is well within normal operating thresholds (< 5.0 mm/s).'}\n\n"
                f"Recommended Action:\n"
                f"{'Stop the motor immediately and inspect bearings, shaft alignment, and foundation anchor bolts.' if vib_sev != 'Normal' else 'No mechanical vibration corrective action required. Maintain routine lubrication schedule.'}"
            )

        # -------------------------------------------------------------
        # 3. TEMPERATURE-SPECIFIC QUERIES
        # -------------------------------------------------------------
        elif any(w in question for w in ["temperature", "hot", "heat", "overheat", "overheating", "thermal", "cooling"]):
            answer = (
                f"{context_prefix}"
                f"🌡️ Temperature Analysis:\n"
                f"• Current Reading: {temperature} °C\n"
                f"• Severity: {temp_sev} (Warning: >= 70 °C, Critical: >= 80 °C)\n\n"
                f"Meaning:\n"
                f"{'Temperature is critically high! Danger of winding insulation breakdown or thermal seizure.' if temp_sev == 'Critical' else 'Temperature is elevated above normal operational limits. Inspect cooling vents and lubrication.' if temp_sev == 'Warning' else 'Thermal conditions are optimal (< 70 °C).'}\n\n"
                f"Recommended Action:\n"
                f"{'Check cooling fan airflow, clean heat sink fins, and verify grease viscosity.' if temp_sev != 'Normal' else 'Maintain normal thermal monitoring.'}"
            )

        # -------------------------------------------------------------
        # 4. CURRENT / ELECTRICAL QUERIES
        # -------------------------------------------------------------
        elif any(w in question for w in ["current", "electrical", "amp", "amps", "amperage", "load", "motor stress", "voltage"]):
            answer = (
                f"{context_prefix}"
                f"⚡ Current & Electrical Load Analysis:\n"
                f"• Current Draw: {current} A\n"
                f"• Severity: {curr_sev} (Warning: >= 10.0 A, Critical: >= 12.0 A)\n\n"
                f"Meaning:\n"
                f"{'Current draw is in the critical overload zone! Imminent risk of tripping circuit protection or burning motor windings.' if curr_sev == 'Critical' else 'Current draw is elevated, indicating excessive mechanical resistance or elevated line demand.' if curr_sev == 'Warning' else 'Current draw is normal and within nominal rating.'}\n\n"
                f"Recommended Action:\n"
                f"{'Inspect mechanical load, check for rotor binding, and verify supply phase balance.' if curr_sev != 'Normal' else 'Continue standard electrical monitoring.'}"
            )

        # -------------------------------------------------------------
        # 5. MAINTENANCE & ACTION QUERIES
        # -------------------------------------------------------------
        elif any(w in question for w in ["maintenance", "action", "do", "recommend", "fix", "repair", "procedure", "solution"]):
            answer = (
                f"{context_prefix}"
                f"🔧 Maintenance Recommendations:\n"
                f"• Machine Status: {status}\n"
                f"• Primary Diagnosis: {fault}\n\n"
                f"Explanation:\n{explanation}\n\n"
                f"Target Action:\n{action}\n\n"
                f"AI Risk Index: {ai_risk} | Estimated RUL: {ai_pred.get('estimated_rul_hours', 'N/A')} hours."
            )

        # -------------------------------------------------------------
        # 6. FAULT / ROOT CAUSE QUERIES
        # -------------------------------------------------------------
        elif any(w in question for w in ["fault", "problem", "wrong", "abnormal", "why", "cause", "issue"]):
            answer = (
                f"{context_prefix}"
                f"🔍 Diagnostic Breakdown:\n"
                f"• Detected Condition: {fault}\n"
                f"• Severity Level: {status}\n\n"
                f"Engineering Cause:\n{explanation}\n\n"
                f"Recommended Resolution:\n{action}"
            )

        # -------------------------------------------------------------
        # 7. AI PREDICTION & RUL QUERIES
        # -------------------------------------------------------------
        elif any(w in question for w in ["predict", "ai", "rul", "remaining", "forecast", "future", "risk"]):
            answer = (
                f"{context_prefix}"
                f"🤖 Edge AI Prediction Report:\n"
                f"• Predicted Health: {ai_pred.get('health', health)}%\n"
                f"• AI Risk Classification: {ai_risk}\n"
                f"• Estimated Remaining Useful Life (RUL): ~{ai_pred.get('estimated_rul_hours', 'N/A')} operating hours\n"
                f"• Anomaly Likelihood Score: {ai_pred.get('anomaly_score', 0.05)}\n\n"
                f"Advisory:\n{ai_pred.get('recommendation', 'Continue normal predictive monitoring.')}"
            )

        # -------------------------------------------------------------
        # 8. GENERAL STATUS & HEALTH QUERIES
        # -------------------------------------------------------------
        elif any(w in question for w in ["status", "health", "overview", "condition", "how is"]):
            answer = (
                f"{context_prefix}"
                f"📋 Machine Overview:\n"
                f"• Machine: {machine.name} ({machine.type})\n"
                f"• Location: {machine.location}\n"
                f"• Overall Health: {health}%\n"
                f"• System Status: {status}\n"
                f"• Active Fault: {fault}\n\n"
                f"Telemetry Snapshot:\n"
                f"• Temperature: {temperature} °C ({temp_sev})\n"
                f"• Vibration: {vibration} mm/s ({vib_sev})\n"
                f"• Current: {current} A ({curr_sev})"
            )

        # -------------------------------------------------------------
        # 9. GREETING
        # -------------------------------------------------------------
        elif any(w in question for w in ["hello", "hi", "hey", "help", "assistant"]):
            answer = (
                f"Hello! I am your AI Maintenance Assistant for the ESA Predictive Maintenance System.\n\n"
                f"Currently monitoring: {machine.name} ({machine_id}).\n\n"
                f"You can ask me questions such as:\n"
                f"• 'Is the machine safe to operate?'\n"
                f"• 'Why is vibration high?'\n"
                f"• 'What is the current temperature status?'\n"
                f"• 'What should I do for maintenance?'\n"
                f"• 'What is the AI prediction and remaining useful life?'"
            )

        # -------------------------------------------------------------
        # 10. FALLBACK
        # -------------------------------------------------------------
        else:
            answer = (
                f"{context_prefix}"
                f"I can assist with machine diagnostics and predictive maintenance:\n"
                f"• Safety & Operation: 'Is the machine safe to run?'\n"
                f"• Vibration Analysis: 'Why is the machine vibrating?'\n"
                f"• Thermal Conditions: 'What is the motor temperature?'\n"
                f"• Electrical Load: 'What is the current draw?'\n"
                f"• Fault & Actions: 'What should I do for maintenance?'\n"
                f"• AI Forecasting: 'What is the predicted health and RUL?'"
            )

        return {
            "question": raw_question,
            "answer": answer,
            "machine_id": machine_id,
            "machine_status": status,
            "health": health,
            "fault": fault,
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Error in maintenance chat: {e}", exc_info=True)
        return {
            "question": request.question,
            "answer": "An error occurred while analyzing machine telemetry. Please ensure the machine manager is running.",
            "machine_status": "Unknown",
            "health": 0,
            "fault": "Internal error"
        }


@app.post("/api/telemetry")
def ingest_hardware_telemetry(payload: TelemetryInput):
    """
    Ingest real hardware telemetry from ESP32, Raspberry Pi, or industrial edge gateways.
    Switches data source to 'hardware'.
    """
    machine = manager.get_machine(payload.machine_id)
    machine.set_hardware_telemetry(
        temperature=payload.temperature,
        vibration=payload.vibration,
        current=payload.current
    )
    logger.info(
        f"Ingested hardware telemetry for {payload.machine_id}: "
        f"T={payload.temperature}°C, V={payload.vibration}mm/s, I={payload.current}A"
    )
    return {
        "status": "success",
        "message": f"Telemetry updated for {payload.machine_id}",
        "machine_status": machine.get_full_status()
    }


@app.post("/api/machines/{machine_id}/simulate-fault")
def set_simulation_fault(machine_id: str, request: FaultSimulationRequest):
    """
    Toggle fault injection simulation for academic demonstration and system testing.
    Valid modes: normal, high_temperature, elevated_temperature, excessive_vibration,
    elevated_vibration, over_current, elevated_current, multiple.
    """
    machine = manager.get_machine(machine_id)
    machine.simulation_mode = request.mode
    machine.source = "simulated"
    machine.update_simulation()
    logger.info(f"Set simulation mode on {machine_id} to '{request.mode}'")
    return {
        "machine_id": machine_id,
        "simulation_mode": request.mode,
        "status": machine.get_full_status()
    }