"""
AI Machine Health Prediction Service for ESA Predictive Maintenance System.
Provides AI-based machine health forecasting, anomaly risk evaluation, and
proactive maintenance recommendations.
Architecture designed to easily host ML/DL models (XGBoost, Random Forest, Autoencoder, LSTM).
"""

from typing import Dict, Any
from services.health_calculation import calculate_machine_health
from config.thresholds import SENSOR_THRESHOLDS


def predict_machine_health(
    temperature: float,
    vibration: float,
    current: float
) -> Dict[str, Any]:
    """
    Generate predictive health assessment and risk evaluation based on sensor telemetry.

    Args:
        temperature: Current temperature in °C
        vibration: Current vibration velocity in mm/s
        current: Current electrical load in A

    Returns:
        Structured prediction output containing health, risk, status, and recommendations.
    """
    # Base health from current telemetry conditions
    health_eval = calculate_machine_health(temperature, vibration, current)
    current_health = health_eval["health"]

    # Predictive degradation projection:
    # If parameters are elevated, project forward deterioration
    temp_excess = max(0.0, temperature - SENSOR_THRESHOLDS["temperature"]["warning"])
    vib_excess = max(0.0, vibration - SENSOR_THRESHOLDS["vibration"]["warning"])
    curr_excess = max(0.0, current - SENSOR_THRESHOLDS["current"]["warning"])

    projected_degradation = (temp_excess * 0.8) + (vib_excess * 2.2) + (curr_excess * 1.5)
    predicted_health = max(0.0, min(100.0, round(current_health - (projected_degradation * 0.5), 1)))

    # Risk evaluation
    if predicted_health < 60.0 or current_health < 60.0:
        status = "Critical"
        risk = "High"
        recommendation = (
            "Immediate maintenance intervention required. Elevated risk of component failure within current shift."
        )
        rul_hours = round(max(2.0, predicted_health * 0.2), 1)
        anomaly_score = round(min(0.99, 0.70 + (100.0 - predicted_health) * 0.003), 2)

    elif predicted_health < 80.0 or current_health < 80.0:
        status = "Warning"
        risk = "Medium"
        recommendation = (
            "Machine condition requires attention. Schedule inspection of bearings, cooling, and electrical balance."
        )
        rul_hours = round(48.0 + (predicted_health - 60.0) * 4.0, 1)
        anomaly_score = round(0.35 + (80.0 - predicted_health) * 0.015, 2)

    else:
        status = "Healthy"
        risk = "Low"
        recommendation = (
            "Machine condition is currently stable. Operational parameters within normal tolerances. Continue regular monitoring."
        )
        rul_hours = round(500.0 + (predicted_health - 80.0) * 25.0, 1)
        anomaly_score = round(max(0.02, (100.0 - predicted_health) * 0.01), 2)

    return {
        "health": int(round(predicted_health)),
        "current_health": current_health,
        "status": status,
        "risk": risk,
        "recommendation": recommendation,
        "anomaly_score": anomaly_score,
        "estimated_rul_hours": rul_hours,
        "model_version": "ESA-EdgeAI-v1.2",
    }