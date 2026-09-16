"""
Comprehensive Test Suite for ESA Predictive Maintenance Backend API.
Verifies all 8 machines, CNC parameters, alerts, maintenance logs,
simulation modes, and AI chatbot responses.
"""

import sys
from main import (
    app,
    get_thresholds,
    get_machines,
    get_machine_detail,
    get_sensor_data,
    get_alerts,
    get_maintenance_records,
    create_maintenance_record,
    set_simulation_fault,
    maintenance_chat,
    ChatRequest,
    MaintenanceRecordInput,
    FaultSimulationRequest,
)

def run_tests():
    print("==================================================")
    print("ESA PREDICTIVE MAINTENANCE SYSTEM - BACKEND VERIFICATION")
    print("==================================================")

    # 1. Thresholds
    thresholds = get_thresholds()
    assert "sensor_thresholds" in thresholds
    assert thresholds["sensor_thresholds"]["temperature"]["warning"] == 70.0
    print("[PASS] Centralized sensor thresholds verified.")

    # 2. Machine Fleet (8 units)
    machines = get_machines()
    assert len(machines) == 8, f"Expected 8 machines, got {len(machines)}"
    ids = [m["id"] for m in machines]
    assert "MTR-001" in ids and "MTR-002" in ids and "MTR-003" in ids
    assert "CNC-001" in ids and "CNC-005" in ids
    print(f"[PASS] Monitored machine roster verified: {len(machines)} units ({', '.join(ids)})")

    # 3. CNC Machine Detail & Telemetry
    cnc_detail = get_machine_detail("CNC-001")
    assert cnc_detail["is_cnc"] is True
    assert "cnc_metrics" in cnc_detail
    cnc_metrics = cnc_detail["cnc_metrics"]
    assert "spindle_speed" in cnc_metrics
    assert "tool_wear" in cnc_metrics
    assert "coolant_level" in cnc_metrics
    print(f"[PASS] CNC-001 metrics: Spindle={cnc_metrics['spindle_speed']} RPM, Tool Wear={cnc_metrics['tool_wear']}%, Coolant={cnc_metrics['coolant_level']}%")

    # 4. Fleet Alerts
    alerts = get_alerts()
    assert len(alerts) >= 3
    crit_alerts = get_alerts(severity="Critical")
    print(f"[PASS] Fleet alerts endpoint verified: Total={len(alerts)}, Critical={len(crit_alerts)}")

    # 5. Maintenance Records (GET & POST)
    maint_list = get_maintenance_records()
    init_count = len(maint_list)
    assert init_count >= 5

    new_wo = create_maintenance_record(MaintenanceRecordInput(
        machine_id="CNC-001",
        type="Spindle Laser Runout Check",
        description="Verified dynamic spindle concentricity using laser interferometer.",
        technician="Jayasurya R (Lead)",
        date="2026-09-16",
        next_due="2026-11-15",
        status="Scheduled"
    ))
    assert new_wo["id"].startswith("MNT-2026-")
    assert len(get_maintenance_records()) == init_count + 1
    print(f"[PASS] Maintenance work order created: {new_wo['id']} for {new_wo['machine_name']}")

    # 6. Fault Simulation
    sim_res = set_simulation_fault("CNC-001", FaultSimulationRequest(mode="high_temperature"))
    assert sim_res["simulation_mode"] == "high_temperature"
    # Verify smooth thermal convergence upwards
    assert sim_res["status"]["temperature"] > 65.0
    # Step simulation 5 times to verify full convergence to high temp
    for _ in range(5):
        sim_res = get_machine_detail("CNC-001")
    assert sim_res["temperature"] >= 76.0
    # Reset to normal
    set_simulation_fault("CNC-001", FaultSimulationRequest(mode="normal"))
    print(f"[PASS] Fault simulation and smooth convergence verified (Peak: {sim_res['temperature']} °C).")

    # 7. AI Chatbot Intelligence
    # Test 7a: Safety query
    chat_safe = maintenance_chat(ChatRequest(machine_id="CNC-001", question="Is the machine safe to operate?"))
    assert "Safety Status:" in chat_safe["answer"]
    print("[PASS] Chatbot safety query response verified.")

    # Test 7b: CNC Spindle query
    chat_spindle = maintenance_chat(ChatRequest(machine_id="CNC-001", question="What is the current spindle speed and load?"))
    assert "CNC Spindle Telemetry Analysis" in chat_spindle["answer"]
    print("[PASS] Chatbot CNC spindle query response verified.")

    # Test 7c: Tool wear query
    chat_tool = maintenance_chat(ChatRequest(machine_id="CNC-001", question="How is the cutting tool wear?"))
    assert "CNC Tool Condition" in chat_tool["answer"]
    print("[PASS] Chatbot CNC tool wear query response verified.")

    print("==================================================")
    print("ALL BACKEND VERIFICATION CHECKS PASSED [100% OK]")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
