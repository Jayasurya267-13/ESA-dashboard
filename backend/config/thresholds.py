"""
Centralized sensor thresholds and status boundaries for the ESA Predictive Maintenance System.
Consistent across Backend, Fault Detection, Health Calculation, and Frontend UI.
"""

SENSOR_THRESHOLDS = {
    "temperature": {
        "unit": "°C",
        "warning": 70.0,
        "critical": 80.0,
        "normal_range": (50.0, 69.9),
    },
    "vibration": {
        "unit": "mm/s",
        "warning": 5.0,
        "critical": 8.0,
        "normal_range": (0.5, 4.99),
    },
    "current": {
        "unit": "A",
        "warning": 10.0,
        "critical": 12.0,
        "normal_range": (2.0, 9.99),
    },
}

HEALTH_THRESHOLDS = {
    "normal_min": 80.0,
    "warning_min": 60.0,
}


def get_sensor_severity(sensor_type: str, value: float) -> str:
    """
    Returns 'Normal', 'Warning', or 'Critical' for a given sensor and value.
    """
    config = SENSOR_THRESHOLDS.get(sensor_type.lower())
    if not config:
        return "Normal"

    if value >= config["critical"]:
        return "Critical"
    if value >= config["warning"]:
        return "Warning"
    return "Normal"


def get_health_status(health: float) -> str:
    """
    Returns 'Normal', 'Warning', or 'Critical' based on health percentage (0-100).
    """
    if health >= HEALTH_THRESHOLDS["normal_min"]:
        return "Normal"
    if health >= HEALTH_THRESHOLDS["warning_min"]:
        return "Warning"
    return "Critical"
