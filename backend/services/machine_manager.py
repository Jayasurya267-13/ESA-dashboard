"""
Machine State and Telemetry Manager for ESA Predictive Maintenance System.
Supports Multi-Machine Fleet tracking: Motor Pumps & Industrial CNC Machinery.
Features realistic time-series dynamics, CNC spindle/tool metrics, and alert logs.
"""

import time
import math
import random
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

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
        category: str,
        location: str,
        production_line: str,
        base_temp: float = 65.0,
        base_vib: float = 2.8,
        base_curr: float = 6.5,
        operating_hours: int = 2400,
        manufacturer: str = "Siemens Industrial",
        model: str = "SIMOTICS-S",
        serial_number: str = "SN-2024-8841",
        installed_date: str = "2023-04-15",
        last_maintenance: str = "2026-08-10",
        next_maintenance: str = "2026-10-15",
        # CNC Specific Baselines
        base_spindle_speed: float = 0.0,
        base_spindle_load: float = 0.0,
        base_coolant_temp: float = 22.0,
        base_coolant_level: float = 90.0,
        base_tool_wear: float = 15.0,
    ):
        self.id = machine_id
        self.name = name
        self.type = machine_type
        self.category = category  # 'Motor / Pump' or 'CNC'
        self.location = location
        self.production_line = production_line

        self.operating_hours = operating_hours
        self.manufacturer = manufacturer
        self.model = model
        self.serial_number = serial_number
        self.installed_date = installed_date
        self.last_maintenance = last_maintenance
        self.next_maintenance = next_maintenance

        # Common Telemetry Baselines
        self.base_temp = base_temp
        self.base_vib = base_vib
        self.base_curr = base_curr

        # Current Values
        self.current_temp = base_temp
        self.current_vib = base_vib
        self.current_curr = base_curr

        # CNC Specific Telemetry
        self.is_cnc = category == "CNC"
        self.base_spindle_speed = base_spindle_speed
        self.base_spindle_load = base_spindle_load
        self.base_coolant_temp = base_coolant_temp
        self.base_coolant_level = base_coolant_level
        self.base_tool_wear = base_tool_wear

        self.current_spindle_speed = base_spindle_speed
        self.current_spindle_load = base_spindle_load
        self.current_coolant_temp = base_coolant_temp
        self.current_coolant_level = base_coolant_level
        self.current_tool_wear = base_tool_wear

        self.start_time = time.time()
        self.last_update = time.time()

        self.source = "simulated"  # 'simulated' or 'hardware'
        self.simulation_mode = "normal"
        self.history: List[Dict[str, Any]] = []
        self.max_history = 50

    def update_simulation(self) -> None:
        """
        Advance simulated telemetry smoothly using sinusoidal dynamics and noise.
        """
        if self.source == "hardware":
            if time.time() - self.last_update < 15:
                return
            else:
                self.source = "simulated (hardware timeout)"

        now = time.time()
        elapsed = now - self.start_time

        # Multi-frequency oscillations
        freq_offset = (hash(self.id) % 7) * 0.12
        temp_wave = math.sin((elapsed / 24.0) + freq_offset) * 2.2
        vib_wave = math.sin((elapsed / 9.0) + freq_offset) * 0.45
        curr_wave = math.sin((elapsed / 17.0) + freq_offset) * 0.65

        temp_noise = random.uniform(-0.35, 0.35)
        vib_noise = random.uniform(-0.15, 0.15)
        curr_noise = random.uniform(-0.2, 0.2)

        temp = self.base_temp + temp_wave + temp_noise
        vib = self.base_vib + vib_wave + vib_noise
        curr = self.base_curr + curr_wave + curr_noise

        # CNC Specific Dynamics
        if self.is_cnc:
            speed_wave = math.sin((elapsed / 12.0) + freq_offset) * 120.0
            load_wave = math.sin((elapsed / 8.0) + freq_offset) * 6.5
            coolant_wave = math.sin((elapsed / 30.0) + freq_offset) * 1.5

            speed = self.base_spindle_speed + speed_wave + random.uniform(-25, 25)
            load = self.base_spindle_load + load_wave + random.uniform(-1.5, 1.5)
            cool_temp = self.base_coolant_temp + coolant_wave + random.uniform(-0.2, 0.2)
            cool_lvl = max(40.0, self.base_coolant_level - (elapsed * 0.002) % 20.0)
            t_wear = min(98.0, self.base_tool_wear + (elapsed * 0.005) % 15.0)

            self.current_spindle_speed = round(max(0.0, speed), 0)
            self.current_spindle_load = round(max(0.0, min(100.0, load)), 1)
            self.current_coolant_temp = round(cool_temp, 1)
            self.current_coolant_level = round(cool_lvl, 1)
            self.current_tool_wear = round(t_wear, 1)

        # Apply simulation modes
        if self.simulation_mode == "high_temperature":
            temp += 16.5
            if self.is_cnc:
                self.current_spindle_load = min(98.0, self.current_spindle_load + 28.0)
        elif self.simulation_mode == "elevated_temperature":
            temp += 8.5
        elif self.simulation_mode == "excessive_vibration":
            vib += 5.5
            if self.is_cnc:
                self.current_tool_wear = min(95.0, self.current_tool_wear + 35.0)
        elif self.simulation_mode == "elevated_vibration":
            vib += 3.2
        elif self.simulation_mode == "over_current":
            curr += 6.0
            if self.is_cnc:
                self.current_spindle_load = min(99.0, self.current_spindle_load + 35.0)
        elif self.simulation_mode == "elevated_current":
            curr += 4.0
        elif self.simulation_mode == "multiple":
            temp += 15.0
            vib += 5.2
            curr += 5.8
            if self.is_cnc:
                self.current_spindle_load = 94.0
                self.current_tool_wear = 88.0

        # Smooth convergence
        alpha = 0.35
        self.current_temp = round((1 - alpha) * self.current_temp + alpha * temp, 2)
        self.current_vib = round((1 - alpha) * self.current_vib + alpha * vib, 2)
        self.current_curr = round((1 - alpha) * self.current_curr + alpha * curr, 2)
        self.last_update = now

        self._record_history()

    def set_hardware_telemetry(
        self,
        temperature: Optional[float] = None,
        vibration: Optional[float] = None,
        current: Optional[float] = None
    ) -> None:
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
        if self.is_cnc:
            snapshot["spindle_speed"] = self.current_spindle_speed
            snapshot["spindle_load"] = self.current_spindle_load
            snapshot["tool_wear"] = self.current_tool_wear

        self.history.append(snapshot)
        if len(self.history) > self.max_history:
            self.history = self.history[-self.max_history:]

    def get_full_status(self) -> Dict[str, Any]:
        health_eval = calculate_machine_health(
            self.current_temp, self.current_vib, self.current_curr
        )
        fault_eval = detect_fault(
            self.current_temp, self.current_vib, self.current_curr
        )
        prediction = predict_machine_health(
            self.current_temp, self.current_vib, self.current_curr
        )

        res = {
            "machine_id": self.id,
            "name": self.name,
            "type": self.type,
            "category": self.category,
            "location": self.location,
            "production_line": self.production_line,
            "operating_hours": self.operating_hours,
            "manufacturer": self.manufacturer,
            "model": self.model,
            "serial_number": self.serial_number,
            "installed_date": self.installed_date,
            "last_maintenance": self.last_maintenance,
            "next_maintenance": self.next_maintenance,
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
            "is_cnc": self.is_cnc,
        }

        if self.is_cnc:
            res["cnc_metrics"] = {
                "spindle_speed": self.current_spindle_speed,
                "spindle_load": self.current_spindle_load,
                "coolant_temp": self.current_coolant_temp,
                "coolant_level": self.current_coolant_level,
                "tool_wear": self.current_tool_wear,
            }

        return res


class MachineManager:
    def __init__(self):
        self.machines: Dict[str, Machine] = {
            # --- MOTOR / PUMP FLEET (Original Assets Retained) ---
            "MTR-001": Machine(
                machine_id="MTR-001",
                name="Motor Pump 01",
                machine_type="Industrial Motor Pump",
                category="Motor / Pump",
                location="Production Floor A",
                production_line="Line A",
                base_temp=66.5,
                base_vib=2.8,
                base_curr=6.5,
                operating_hours=4280,
                manufacturer="Siemens Energy",
                model="1LE1503-1BB23",
                serial_number="SN-MTR-8812",
                installed_date="2022-03-10",
                last_maintenance="2026-07-15",
                next_maintenance="2026-10-15",
            ),
            "MTR-002": Machine(
                machine_id="MTR-002",
                name="Motor Pump 02",
                machine_type="Industrial Motor Pump",
                category="Motor / Pump",
                location="Production Floor B",
                production_line="Line B",
                base_temp=69.0,
                base_vib=3.2,
                base_curr=7.8,
                operating_hours=3890,
                manufacturer="Grundfos Industrial",
                model="CR-45-3",
                serial_number="SN-MTR-9941",
                installed_date="2022-06-22",
                last_maintenance="2026-08-01",
                next_maintenance="2026-11-01",
            ),
            "MTR-003": Machine(
                machine_id="MTR-003",
                name="Cooling Fan 01",
                machine_type="Cooling Air System",
                category="Motor / Pump",
                location="Production Floor C",
                production_line="Line C",
                base_temp=58.2,
                base_vib=1.8,
                base_curr=4.2,
                operating_hours=5120,
                manufacturer="Howden Group",
                model="HVAC-IND-500",
                serial_number="SN-FAN-1102",
                installed_date="2021-11-05",
                last_maintenance="2026-06-18",
                next_maintenance="2026-09-25",
            ),

            # --- INDUSTRIAL CNC FLEET (Added for Industry 4.0 Scope) ---
            "CNC-001": Machine(
                machine_id="CNC-001",
                name="CNC Milling Machine 01",
                machine_type="5-Axis CNC Milling Center",
                category="CNC",
                location="High-Precision Bay A",
                production_line="Line A",
                base_temp=62.4,
                base_vib=2.2,
                base_curr=5.4,
                operating_hours=6140,
                manufacturer="DMG MORI",
                model="DMU 50 3rd Gen",
                serial_number="SN-DMG-5041",
                installed_date="2023-01-18",
                last_maintenance="2026-08-12",
                next_maintenance="2026-10-30",
                base_spindle_speed=4500.0,
                base_spindle_load=52.0,
                base_coolant_temp=23.4,
                base_coolant_level=88.0,
                base_tool_wear=21.5,
            ),
            "CNC-002": Machine(
                machine_id="CNC-002",
                name="CNC Turning Machine 01",
                machine_type="CNC Horizontal Turning Lathe",
                category="CNC",
                location="Machining Bay B",
                production_line="Line B",
                base_temp=64.8,
                base_vib=2.6,
                base_curr=6.1,
                operating_hours=4890,
                manufacturer="Mazak Corp",
                model="Quick Turn 250MSY",
                serial_number="SN-MAZ-2509",
                installed_date="2023-05-14",
                last_maintenance="2026-07-28",
                next_maintenance="2026-11-10",
                base_spindle_speed=3200.0,
                base_spindle_load=48.0,
                base_coolant_temp=24.1,
                base_coolant_level=82.0,
                base_tool_wear=34.0,
            ),
            "CNC-003": Machine(
                machine_id="CNC-003",
                name="CNC Vertical Machining Center 01",
                machine_type="Vertical Machining Center",
                category="CNC",
                location="Machining Bay C",
                production_line="Line C",
                base_temp=63.1,
                base_vib=2.4,
                base_curr=5.9,
                operating_hours=3250,
                manufacturer="Haas Automation",
                model="VF-4SS Super-Speed",
                serial_number="SN-HAS-4421",
                installed_date="2024-02-10",
                last_maintenance="2026-08-20",
                next_maintenance="2026-11-20",
                base_spindle_speed=5200.0,
                base_spindle_load=58.0,
                base_coolant_temp=22.8,
                base_coolant_level=91.0,
                base_tool_wear=16.5,
            ),
            "CNC-004": Machine(
                machine_id="CNC-004",
                name="CNC Lathe Machine 01",
                machine_type="Heavy-Duty CNC Lathe",
                category="CNC",
                location="Heavy Machining Floor",
                production_line="Line A",
                base_temp=67.2,
                base_vib=3.1,
                base_curr=7.4,
                operating_hours=7820,
                manufacturer="Okuma Corporation",
                model="LB3000 EX II",
                serial_number="SN-OKU-3001",
                installed_date="2021-08-19",
                last_maintenance="2026-06-30",
                next_maintenance="2026-09-30",
                base_spindle_speed=2800.0,
                base_spindle_load=64.0,
                base_coolant_temp=25.2,
                base_coolant_level=76.0,
                base_tool_wear=42.0,
            ),
            "CNC-005": Machine(
                machine_id="CNC-005",
                name="CNC Milling Machine 02",
                machine_type="High-Speed Gantry Mill",
                category="CNC",
                location="Tooling Workshop D",
                production_line="Line D",
                base_temp=61.9,
                base_vib=1.9,
                base_curr=4.9,
                operating_hours=2180,
                manufacturer="Makino Milling",
                model="D500 5-Axis",
                serial_number="SN-MAK-5002",
                installed_date="2024-06-01",
                last_maintenance="2026-08-25",
                next_maintenance="2026-12-01",
                base_spindle_speed=6000.0,
                base_spindle_load=45.0,
                base_coolant_temp=21.9,
                base_coolant_level=94.0,
                base_tool_wear=11.0,
            ),
        }

    def get_machine(self, machine_id: str) -> Machine:
        return self.machines.get(machine_id, self.machines["MTR-001"])

    def list_machines(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": m.id,
                "name": m.name,
                "type": m.type,
                "category": m.category,
                "location": m.location,
                "production_line": m.production_line,
                "source": m.source,
                "status": m.get_full_status()["status"],
                "health": m.get_full_status()["health"],
                "temperature": m.current_temp,
                "vibration": m.current_vib,
                "current": m.current_curr,
                "operating_hours": m.operating_hours,
                "is_cnc": m.is_cnc,
            }
            for m in self.machines.values()
        ]

    def get_fleet_alerts(self) -> List[Dict[str, Any]]:
        alerts = []
        now = datetime.now()
        for idx, m in enumerate(self.machines.values()):
            m_status = m.get_full_status()
            if m_status["status"] != "Normal":
                alerts.append({
                    "id": f"ALT-{1000 + idx}",
                    "machine_id": m.id,
                    "machine_name": m.name,
                    "severity": m_status["severity"],
                    "sensor": "Vibration" if "Vibration" in m_status["fault"] else "Temperature" if "Temperature" in m_status["fault"] else "Current",
                    "value": f"{m.current_vib} mm/s" if "Vibration" in m_status["fault"] else f"{m.current_temp} °C",
                    "message": m_status["fault"],
                    "timestamp": (now - timedelta(minutes=idx * 12)).strftime("%Y-%m-%d %H:%M:%S"),
                    "status": "Active"
                })

        # Add realistic historical alerts
        alerts.extend([
            {
                "id": "ALT-0982",
                "machine_id": "CNC-004",
                "machine_name": "CNC Lathe Machine 01",
                "severity": "Warning",
                "sensor": "Current",
                "value": "10.8 A",
                "message": "Elevated motor current under heavy stock turning",
                "timestamp": (now - timedelta(hours=3, minutes=20)).strftime("%Y-%m-%d %H:%M:%S"),
                "status": "Resolved"
            },
            {
                "id": "ALT-0975",
                "machine_id": "CNC-001",
                "machine_name": "CNC Milling Machine 01",
                "severity": "Warning",
                "sensor": "Vibration",
                "value": "5.6 mm/s",
                "message": "Tool chatter vibration threshold exceeded",
                "timestamp": (now - timedelta(hours=8, minutes=45)).strftime("%Y-%m-%d %H:%M:%S"),
                "status": "Resolved"
            },
            {
                "id": "ALT-0960",
                "machine_id": "MTR-002",
                "machine_name": "Motor Pump 02",
                "severity": "Critical",
                "sensor": "Temperature",
                "value": "81.4 °C",
                "message": "Cooling impeller cavitation temperature alert",
                "timestamp": (now - timedelta(days=1, hours=2)).strftime("%Y-%m-%d %H:%M:%S"),
                "status": "Resolved"
            }
        ])
        return alerts

    def get_maintenance_records(self) -> List[Dict[str, Any]]:
        if not hasattr(self, "_maintenance_records") or not self._maintenance_records:
            self._maintenance_records = [
                {
                    "id": "MNT-2026-081",
                    "machine_id": "CNC-001",
                    "machine_name": "CNC Milling Machine 01",
                    "type": "Preventive Maintenance",
                    "date": "2026-08-12",
                    "technician": "Jayasurya R (Lead)",
                    "status": "Completed",
                    "description": "Spindle bearing vibration check, high-pressure coolant pump servicing, and 5-axis calibration.",
                    "next_due": "2026-10-30"
                },
                {
                    "id": "MNT-2026-077",
                    "machine_id": "MTR-001",
                    "machine_name": "Motor Pump 01",
                    "type": "Inspection & Lubrication",
                    "date": "2026-07-15",
                    "technician": "Harish kumar A",
                    "status": "Completed",
                    "description": "Grease replenished with Mobil Polyrex EM. Shaft alignment verified with laser tool (0.02mm offset).",
                    "next_due": "2026-10-15"
                },
                {
                    "id": "MNT-2026-071",
                    "machine_id": "CNC-002",
                    "machine_name": "CNC Turning Machine 01",
                    "type": "Tool Replacement",
                    "date": "2026-07-28",
                    "technician": "Harish kumar A",
                    "status": "Completed",
                    "description": "Replaced carbide inserts on turret stations 2, 5, and 8. Slideway lubrication pressure verified.",
                    "next_due": "2026-11-10"
                },
                {
                    "id": "MNT-2026-064",
                    "machine_id": "MTR-003",
                    "machine_name": "Cooling Fan 01",
                    "type": "Corrective Maintenance",
                    "date": "2026-06-18",
                    "technician": "Umesh Madhu P",
                    "status": "Completed",
                    "description": "Replaced worn V-belt drive and tightened motor base dampener springs to eliminate resonance.",
                    "next_due": "2026-09-25"
                },
                {
                    "id": "MNT-2026-090",
                    "machine_id": "CNC-003",
                    "machine_name": "CNC Vertical Machining Center 01",
                    "type": "Spindle Inspection",
                    "date": "2026-08-20",
                    "technician": "Jayasurya R",
                    "status": "Completed",
                    "description": "Spindle thermal runout check. Cleaned pneumatic drawbar gripper and tested tool release piston.",
                    "next_due": "2026-11-20"
                }
            ]
        return self._maintenance_records

    def add_maintenance_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        records = self.get_maintenance_records()
        record_id = f"MNT-2026-{str(len(records) + 91).zfill(3)}"
        new_record = {
            "id": record_id,
            "machine_id": record.get("machine_id", "MTR-001"),
            "machine_name": self.get_machine(record.get("machine_id", "MTR-001")).name,
            "type": record.get("type", "General Inspection"),
            "date": record.get("date", datetime.now().strftime("%Y-%m-%d")),
            "technician": record.get("technician", "Jayasurya R (Lead)"),
            "status": record.get("status", "Scheduled"),
            "description": record.get("description", "Scheduled service inspection."),
            "next_due": record.get("next_due", "2026-12-31")
        }
        records.insert(0, new_record)
        return new_record


# Singleton instance
manager = MachineManager()

