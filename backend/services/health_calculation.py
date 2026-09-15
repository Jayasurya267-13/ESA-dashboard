"""
Machine Health Calculation Module for ESA Predictive Maintenance System.
Computes an overall machine health percentage (0-100%) based on sensor conditions.
Designed to be easily swappable with a trained ML / Anomaly Detection model.
"""

from typing import Dict, Any
from config.thresholds import SENSOR_THRESHOLDS, get_health_status


def calculate_machine_health(
    temperature: float,
    vibration: float,
    current: float
) -> Dict[str, Any]:
    """
    Calculate machine health percentage (0-100%) and individual penalty factors.

    Args:
        temperature: Current temperature in °C
        vibration: Current vibration velocity in mm/s
        current: Current electrical load in A

    Returns:
        Dict with health score (0-100), status (Normal/Warning/Critical), and breakdown.
    """
    temp_cfg = SENSOR_THRESHOLDS["temperature"]
    vib_cfg = SENSOR_THRESHOLDS["vibration"]
    curr_cfg = SENSOR_THRESHOLDS["current"]

    # --- Temperature Penalty (max ~40 points) ---
    temp_penalty = 0.0
    if temperature >= temp_cfg["critical"]:
        # Exceeded 80 °C
        temp_penalty = 25.0 + min(25.0, (temperature - temp_cfg["critical"]) * 2.5)
    elif temperature >= temp_cfg["warning"]:
        # Between 70 °C and 79.9 °C
        ratio = (temperature - temp_cfg["warning"]) / (temp_cfg["critical"] - temp_cfg["warning"])
        temp_penalty = ratio * 20.0

    # --- Vibration Penalty (max ~45 points) ---
    vib_penalty = 0.0
    if vibration >= vib_cfg["critical"]:
        # Exceeded 8.0 mm/s
        vib_penalty = 30.0 + min(30.0, (vibration - vib_cfg["critical"]) * 6.0)
    elif vibration >= vib_cfg["warning"]:
        # Between 5.0 and 7.99 mm/s
        ratio = (vibration - vib_cfg["warning"]) / (vib_cfg["critical"] - vib_cfg["warning"])
        vib_penalty = ratio * 25.0

    # --- Current Penalty (max ~35 points) ---
    curr_penalty = 0.0
    if current >= curr_cfg["critical"]:
        # Exceeded 12.0 A
        curr_penalty = 25.0 + min(25.0, (current - curr_cfg["critical"]) * 5.0)
    elif current >= curr_cfg["warning"]:
        # Between 10.0 and 11.99 A
        ratio = (current - curr_cfg["warning"]) / (curr_cfg["critical"] - curr_cfg["warning"])
        curr_penalty = ratio * 20.0

    total_penalty = temp_penalty + vib_penalty + curr_penalty
    raw_health = 100.0 - total_penalty
    health = max(0.0, min(100.0, round(raw_health, 1)))
    status = get_health_status(health)

    return {
        "health": health,
        "status": status,
        "penalties": {
            "temperature": round(temp_penalty, 1),
            "vibration": round(vib_penalty, 1),
            "current": round(curr_penalty, 1),
            "total": round(total_penalty, 1),
        }
    }
