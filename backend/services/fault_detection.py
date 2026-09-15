"""
Fault Detection Service for ESA Predictive Maintenance System.
Analyzes sensor telemetry against centralized engineering thresholds to detect
and classify machine anomalies.
"""

from typing import Dict, Any, List
from config.thresholds import SENSOR_THRESHOLDS, get_sensor_severity


def detect_fault(
    temperature: float,
    vibration: float,
    current: float
) -> Dict[str, Any]:
    """
    Detect machine faults, calculate severity, and provide actionable recommendations.

    Args:
        temperature: Temperature in °C
        vibration: Vibration velocity in mm/s
        current: Electrical current in A

    Returns:
        Structured fault analysis dictionary.
    """
    temp_sev = get_sensor_severity("temperature", temperature)
    vib_sev = get_sensor_severity("vibration", vibration)
    curr_sev = get_sensor_severity("current", current)

    faults: List[str] = []
    warnings: List[str] = []
    recommendations: List[str] = []

    # Temperature Analysis (Warning >= 70, Critical >= 80)
    if temp_sev == "Critical":
        faults.append("Critical High Temperature")
        recommendations.append("Immediately shut down machine; inspect cooling pump, heat sink, and ventilation.")
    elif temp_sev == "Warning":
        warnings.append("Elevated Temperature")
        recommendations.append("Inspect cooling airflow, check lubrication levels, and monitor load.")

    # Vibration Analysis (Warning >= 5.0, Critical >= 8.0)
    if vib_sev == "Critical":
        faults.append("Excessive Vibration (Critical)")
        recommendations.append("Halt operation immediately; inspect bearing integrity, coupling misalignment, and shaft balance.")
    elif vib_sev == "Warning":
        warnings.append("Elevated Vibration")
        recommendations.append("Inspect mechanical alignment, bearing wear, and tighten mounting bolts.")

    # Current Analysis (Warning >= 10.0, Critical >= 12.0)
    if curr_sev == "Critical":
        faults.append("Over Current (Critical)")
        recommendations.append("Check for motor mechanical binding, electrical short circuit, and phase imbalance.")
    elif curr_sev == "Warning":
        warnings.append("Elevated Current")
        recommendations.append("Verify machine mechanical load, supply voltage stability, and winding condition.")

    # Determine overall status and composite faults
    total_anomalies = len(faults) + len(warnings)

    if faults:
        status = "Critical"
        severity = "Critical"
        if len(faults) > 1 or total_anomalies >= 2:
            primary_fault = "Multiple Sensor Abnormality"
            fault_explanation = (
                f"Multiple critical parameters exceeded safety limits: {', '.join(faults + warnings)}. "
                "Severe mechanical or electrical breakdown is imminent."
            )
            recommended_action = (
                "Execute emergency stop procedure. Conduct full diagnostic inspection of bearings, motor windings, and drive assembly."
            )
        else:
            primary_fault = faults[0]
            if "Temperature" in primary_fault:
                fault_explanation = f"Operating temperature ({temperature:.1f} °C) is in the critical zone (>= 80 °C), risking thermal breakdown."
                recommended_action = "Stop machine operation and verify cooling system functionality and lubricant quality."
            elif "Vibration" in primary_fault:
                fault_explanation = f"Vibration velocity ({vibration:.2f} mm/s) is critical (>= 8.0 mm/s), indicating severe mechanical failure."
                recommended_action = "Halt machine to prevent catastrophic damage. Inspect bearings and shaft alignment immediately."
            else:
                fault_explanation = f"Current draw ({current:.2f} A) exceeded safety threshold (>= 12.0 A), indicating severe motor overload."
                recommended_action = "Check motor electrical windings, disconnect power, and inspect mechanical drive train for binding."

    elif warnings:
        status = "Warning"
        severity = "Warning"
        if len(warnings) > 1:
            primary_fault = "Multiple Elevated Sensors"
            fault_explanation = (
                f"Multiple sensors are elevated above normal operating ranges: {', '.join(warnings)}. "
                "Early-stage degradation detected."
            )
            recommended_action = "Schedule maintenance check during next shift. Monitor trend charts for escalating values."
        else:
            primary_fault = warnings[0]
            if "Temperature" in primary_fault:
                fault_explanation = f"Operating temperature ({temperature:.1f} °C) is elevated (70–79 °C), above normal range."
                recommended_action = "Inspect cooling vents, verify ambient airflow, and inspect lubrication."
            elif "Vibration" in primary_fault:
                fault_explanation = f"Vibration level ({vibration:.2f} mm/s) is above normal range (5–7.99 mm/s)."
                recommended_action = "Inspect mechanical alignment, bearings, and rotating components for early wear."
            else:
                fault_explanation = f"Current draw ({current:.2f} A) is above normal load range (10–11.99 A)."
                recommended_action = "Verify machine operating load and verify electrical supply balance."

    else:
        status = "Normal"
        severity = "Normal"
        primary_fault = "No fault detected"
        fault_explanation = "All machine sensors (temperature, vibration, current) are operating within normal tolerances."
        recommended_action = "Continue regular predictive monitoring."

    if not recommendations:
        recommendations.append("Continue normal operation and continuous telemetry monitoring.")

    return {
        "status": status,
        "fault": primary_fault,
        "severity": severity,
        "fault_explanation": fault_explanation,
        "recommended_action": recommended_action,
        "warnings": warnings,
        "faults": faults,
        "recommendations": recommendations,
        "sensor_severities": {
            "temperature": temp_sev,
            "vibration": vib_sev,
            "current": curr_sev,
        }
    }