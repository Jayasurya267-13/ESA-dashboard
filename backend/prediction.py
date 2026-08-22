def predict_machine_health(
    temperature,
    vibration,
    current
):
    health = 100

    # Temperature penalty
    if temperature > 75:
        health -= 10
    elif temperature > 70:
        health -= 5

    # Vibration penalty
    if vibration > 4.5:
        health -= 20
    elif vibration > 3.5:
        health -= 10

    # Current penalty
    if current > 3.0:
        health -= 10
    elif current > 2.5:
        health -= 5

    health = max(0, min(100, health))

    if health >= 80:
        status = "Healthy"
    elif health >= 60:
        status = "Warning"
    else:
        status = "Critical"

    return {
        "health": health,
        "status": status
    }