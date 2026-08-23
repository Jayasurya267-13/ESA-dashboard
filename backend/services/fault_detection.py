def detect_fault(temperature, vibration, current):

    faults = []
    warnings = []
    recommendations = []

    # Temperature analysis
    if temperature >= 85:
        faults.append("Critical temperature")
        recommendations.append(
            "Stop the machine and inspect the cooling system."
        )
    elif temperature >= 78:
        warnings.append("High temperature")
        recommendations.append(
            "Check cooling airflow and monitor temperature."
        )

    # Vibration analysis
    if vibration >= 5:
        faults.append("Critical vibration")
        recommendations.append(
            "Inspect bearings, shaft alignment and machine mounting."
        )
    elif vibration >= 3.5:
        warnings.append("Elevated vibration")
        recommendations.append(
            "Inspect for mechanical imbalance and bearing wear."
        )

    # Current analysis
    if current >= 3.5:
        faults.append("Overcurrent")
        recommendations.append(
            "Check motor load, wiring and electrical connections."
        )
    elif current >= 2.5:
        warnings.append("Elevated current")
        recommendations.append(
            "Check machine load and motor operating condition."
        )

    # Determine overall status
    if faults:
        status = "Critical"
    elif warnings:
        status = "Warning"
    else:
        status = "Normal"

    # Determine primary fault
    if faults:
        primary_fault = faults[0]
    elif warnings:
        primary_fault = warnings[0]
    else:
        primary_fault = "No fault detected"

    # Determine severity
    if faults:
        severity = "High"
    elif warnings:
        severity = "Medium"
    else:
        severity = "Low"

    return {
        "status": status,
        "fault": primary_fault,
        "severity": severity,
        "warnings": warnings,
        "faults": faults,
        "recommendations": recommendations
    }