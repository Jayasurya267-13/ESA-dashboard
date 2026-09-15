"""
Machine State and Telemetry Manager for ESA Predictive Maintenance System.
Manages multi-machine state, realistic time-series simulation, telemetry history,
fault simulation modes, and hardware ingestion.
"""

import time
import math
import random
from typing import Dict, Any, List, Optional
from datetime import datetime

from config.thresholds import SENSOR_THRESHOLDS
from services.health_calculation import calculate_machine_health
from services.fault_detection import detect_fault
from prediction import predict_machine_health


class Machine:
    def __init__(
        self,
        machine_id: str,
        name: str,
        machine_type: str,
        location: str,
        base_temp: float = 65.0,
        base_vib: float = 2.8,
        base_curr: float = 6.5,
    ):
        self.id = machine_id
        self.name = name
        self.type = machine_type
        self.location = location

        self.base_temp = base_temp
        self.base_vib = base_vib
        self.base_curr = base_curr

        self.current_temp = base_temp
        self.current_vib = base_vib
        self.current_curr = base_curr

        self.start_time = time.time()
        self.last_update = time.time()

        self.source = "simulated"  # 'simulated' or 'hardware'
        self.simulation_mode = "normal"  # 'normal', 'high_temperature', 'excessive_vibration', 'over_current', 'multiple'
        self.history: List[Dict[str, Any]] = []
        self.max_history = 50

    def update_simulation(self) -> None:
        """
        Advance simulated telemetry smoothly using sinusoidal dynamics and noise.
        """
        if self.source == "hardware":
            # If real hardware has updated in the last 15 seconds, preserve hardware readings
            if time.time() - self.last_update < 15:
                return
            else:
                self.source = "simulated (hardware timeout)"

        now = time.time()
        elapsed = now - self.start_time

        # Smooth wave variations with distinct frequencies per machine
        freq_offset = (hash(self.id) % 5) * 0.1
        temp_wave = math.sin((elapsed / 22.0) + freq_offset) * 2.2
        vib_wave = math.sin((elapsed / 9.0) + freq_offset) * 0.4
        curr_wave = math.sin((elapsed / 16.0) + freq_offset) * 0.6

        # Sensor noise
        temp_noise = random.uniform(-0.4, 0.4)
        vib_noise = random.uniform(-0.15, 0.15)
        curr_noise = random.uniform(-0.2, 0.2)

        # Baseline calculation
        temp = self.base_temp + temp_wave + temp_noise
        vib = self.base_vib + vib_wave + vib_noise
        curr = self.base_curr + curr_wave + curr_noise

        # Apply simulation mode adjustments
        if self.simulation_mode == "high_temperature":
            temp += 16.5  # Pushes ~81-84 °C (Critical)
        elif self.simulation_mode == "elevated_temperature":
            temp += 8.5   # Pushes ~73-76 °C (Warning)
        elif self.simulation_mode == "excessive_vibration":
            vib += 5.5    # Pushes ~8.2-8.7 mm/s (Critical)
        elif self.simulation_mode == "elevated_vibration":
            vib += 3.2    # Pushes ~5.8-6.4 mm/s (Warning)
        elif self.simulation_mode == "over_current":
            curr += 6.0   # Pushes ~12.2-12.8 A (Critical)
        elif self.simulation_mode == "elevated_current":
            curr += 4.0   # Pushes ~10.4-10.9 A (Warning)
        elif self.simulation_mode == "multiple":
            temp += 15.0
            vib += 5.0
            curr += 5.5

        # Smooth transitions towards target
        alpha = 0.35
        self.current_temp = round((1 - alpha) * self.current_temp + alpha * temp, 2)
        self.current_vib = round((1 - alpha) * self.current_vib + alpha * vib, 2)
        self.current_curr = round((1 - alpha) * self.current_curr + alpha * curr, 2)
        self.last_update = now

        # Add to history
        self._record_history()

    def set_hardware_telemetry(
        self,
        temperature: Optional[float] = None,
        vibration: Optional[float] = None,
        current: Optional[float] = None
    ) -> None:
        """
        Update machine state with telemetry from physical IoT hardware (ESP32 / Edge Node).
        """
        if temperature is not None:
            self.current_temp = round(float(temperature), 2)
        if vibration is not None:
            self.current_vib = round(float(vibration), 2)
        if current is not None:
            self.current_curr = round(float(current), 2)

        self.source = "hardware"
        self.simulation_mode = "hardware_live"
        self.last_update = time.time()
        self._record_history()

    def _record_history(self) -> None:
        snapshot = {
            "time": datetime.fromtimestamp(self.last_update).strftime("%H:%M:%S"),
            "timestamp": self.last_update,
            "temperature": self.current_temp,
            "vibration": self.current_vib,
            "current": self.current_curr,
        }
        self.history.append(snapshot)
        if len(self.history) > self.max_history:
            self.history = self.history[-self.max_history:]

    def get_full_status(self) -> Dict[str, Any]:
        """
        Calculate health, fault detection, and AI prediction for current state.
        """
        health_eval = calculate_machine_health(
            self.current_temp, self.current_vib, self.current_curr
        )
        fault_eval = detect_fault(
            self.current_temp, self.current_vib, self.current_curr
        )
        prediction = predict_machine_health(
            self.current_temp, self.current_vib, self.current_curr
        )

        return {
            "machine_id": self.id,
            "name": self.name,
            "type": self.type,
            "location": self.location,
            "source": self.source,
            "simulation_mode": self.simulation_mode,
            "temperature": self.current_temp,
            "vibration": self.current_vib,
            "current": self.current_curr,
            "health": health_eval["health"],
            "status": fault_eval["status"],
            "fault": fault_eval["fault"],
            "severity": fault_eval["severity"],
            "fault_explanation": fault_eval["fault_explanation"],
            "recommended_action": fault_eval["recommended_action"],
            "warnings": fault_eval["warnings"],
            "faults": fault_eval["faults"],
            "recommendations": fault_eval["recommendations"],
            "ai_prediction": prediction,
            "timestamp": datetime.fromtimestamp(self.last_update).isoformat(),
            "history": self.history[-20:],
        }


class MachineManager:
    def __init__(self):
        self.machines: Dict[str, Machine] = {
            "MTR-001": Machine(
                machine_id="MTR-001",
                name="Motor Pump 01",
                machine_type="Industrial Motor",
                location="Production Line A",
                base_temp=66.5,
                base_vib=2.8,
                base_curr=6.5,
            ),
            "MTR-002": Machine(
                machine_id="MTR-002",
                name="Motor Pump 02",
                machine_type="Industrial Motor",
                location="Production Line B",
                base_temp=69.0,
                base_vib=3.2,
                base_curr=7.8,
            ),
            "MTR-003": Machine(
                machine_id="MTR-003",
                name="Cooling Fan 01",
                machine_type="Cooling System",
                location="Production Line C",
                base_temp=58.2,
                base_vib=1.8,
                base_curr=4.2,
            ),
        }

    def get_machine(self, machine_id: str) -> Machine:
        if machine_id not in self.machines:
            return self.machines["MTR-001"]
        return self.machines[machine_id]

    def list_machines(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": m.id,
                "name": m.name,
                "type": m.type,
                "location": m.location,
                "source": m.source,
                "status": m.get_full_status()["status"],
                "health": m.get_full_status()["health"],
            }
            for m in self.machines.values()
        ]

    def update_all(self) -> None:
        for m in self.machines.values():
            m.update_simulation()


# Singleton instance
manager = MachineManager()
