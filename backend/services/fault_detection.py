def detect_fault(temperature, vibration, current):

    warnings = []
    faults = []

    # Temperature analysis
    if temperature >= 75:
        faults.append("Critical temperature")
    elif temperature >= 72:
        warnings.append("High temperature")

    # Vibration analysis
    if vibration >= 4.0:
        faults.append("Critical vibration")
    elif vibration >= 3.5:
        warnings.append("High vibration")

    # Current analysis
    if current >= 2.7:
        faults.append("High current overload")
    elif current >= 2.4:
        warnings.append("Elevated current")

    # Overall machine condition
    if faults:
        status = "Critical"
    elif warnings:
        status = "Warning"
    else:
        status = "Normal"

    # Health score
    health = 100

    health -= len(warnings) * 15
    health -= len(faults) * 30

    health = max(0, health)

    # Fault message
    if faults:
        message = ", ".join(faults)
    elif warnings:
        message = ", ".join(warnings)
    else:
        message = "No fault detected"

    return {
        "status": status,
        "health": health,
        "fault": message,
        "warnings": warnings,
        "faults": faults
    }