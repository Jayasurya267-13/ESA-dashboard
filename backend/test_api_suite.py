"""
Verification test suite for ESA Predictive Maintenance System.
Tests all endpoints, multi-machine tracking, fault simulation, and chatbot intents.
"""

import sys
sys.path.insert(0, '.')

import main

def run_tests():
    print("--- 1. Healthcheck ---")
    r1 = main.root()
    assert r1['status'] == "online", f"Healthcheck failed: {r1}"
    print("[PASS] GET / -> OK:", r1['status'])

    print("\n--- 2. Thresholds ---")
    r2 = main.get_thresholds()
    assert 'sensor_thresholds' in r2 and 'health_thresholds' in r2
    print("[PASS] GET /api/thresholds -> OK:", list(r2['sensor_thresholds'].keys()))

    print("\n--- 3. Machines Roster ---")
    r3 = main.get_machines()
    assert len(r3) == 3
    print("[PASS] GET /api/machines -> OK:", [m['id'] for m in r3])

    print("\n--- 4. Multi-Machine Telemetry Streams ---")
    d1 = main.get_sensor_data('MTR-001')
    d2 = main.get_sensor_data('MTR-002')
    assert 'fault_explanation' in d1 and 'recommended_action' in d1
    assert d1['machine_id'] == 'MTR-001' and d2['machine_id'] == 'MTR-002'
    print(f"[PASS] MTR-001 Telemetry: Temp={d1['temperature']} C, Vib={d1['vibration']} mm/s, Curr={d1['current']} A, Health={d1['health']}%, Status={d1['status']}")
    print(f"[PASS] MTR-002 Telemetry: Temp={d2['temperature']} C, Vib={d2['vibration']} mm/s, Curr={d2['current']} A, Health={d2['health']}%, Status={d2['status']}")

    print("\n--- 5. AI Prediction ---")
    p = main.get_ai_prediction('MTR-001')
    assert 'risk' in p and 'health' in p
    print(f"[PASS] AI Prediction: Health={p['health']}%, Risk={p['risk']}, Status={p['status']}, RUL=~{p['estimated_rul_hours']}h")

    print("\n--- 6. Maintenance Copilot (Chatbot) ---")
    chat_tests = [
        ("Why is the machine vibrating so much?", "Vibration"),
        ("Is the motor safe to operate right now?", "Safety Status"),
        ("What is the current temperature?", "Temperature"),
        ("Is current draw normal?", "Current"),
        ("What maintenance action should we take?", "Maintenance Recommendations"),
        ("Hello", "Hello!")
    ]

    for query, expected_phrase in chat_tests:
        res = main.maintenance_chat(main.ChatRequest(question=query, machine_id='MTR-001'))
        ans = res['answer']
        assert expected_phrase.lower() in ans.lower(), f"Expected '{expected_phrase}' in answer for '{query}'"
        print(f"[PASS] Query '{query}' -> OK (matched '{expected_phrase}')")

    print("\n--- 7. Fault Simulation & Injection ---")
    r7 = main.set_simulation_fault('MTR-001', main.FaultSimulationRequest(mode='high_temperature'))
    s_high = main.get_sensor_data('MTR-001')
    print(f"[PASS] Simulated high temperature: Temp={s_high['temperature']} C, Status={s_high['status']}, Fault={s_high['fault']}")
    assert s_high['temperature'] >= 70.0

    # Reset
    main.set_simulation_fault('MTR-001', main.FaultSimulationRequest(mode='normal'))

    print("\n--- 8. Physical Hardware Telemetry Ingestion ---")
    r8 = main.ingest_hardware_telemetry(main.TelemetryInput(machine_id='MTR-001', temperature=67.2, vibration=2.3, current=5.8))
    s_hw = main.get_sensor_data('MTR-001')
    assert s_hw['source'] == 'hardware' and s_hw['temperature'] == 67.2
    print(f"[PASS] Ingested hardware telemetry applied: Source={s_hw['source']}, Temp={s_hw['temperature']} C")

    # Reset back to simulation
    main.set_simulation_fault('MTR-001', main.FaultSimulationRequest(mode='normal'))

    print("\n===========================================================")
    print("  ALL 8 END-TO-END BACKEND API VERIFICATIONS PASSED 100%!  ")
    print("===========================================================")

if __name__ == "__main__":
    run_tests()
