<<<<<<< HEAD
# ESA Dashboard
## Edge AI Based Predictive Maintenance System

ESA Dashboard is an industrial machine monitoring and predictive maintenance platform designed to monitor machine operating conditions in real time and identify potential equipment faults before they lead to major failures.

The system combines **sensor monitoring, machine health assessment, fault detection, Edge AI-based prediction, and a Maintenance Assistant** into a single industrial dashboard.

---

## 🚀 Project Overview

Industrial machines continuously generate data such as:

- Temperature
- Vibration
- Current
- Machine operating condition

Monitoring these parameters manually can make it difficult to detect early signs of machine failure.

The ESA Predictive Maintenance System addresses this problem by collecting machine sensor data, analyzing machine health, detecting abnormal conditions, and providing predictive maintenance information through a web-based dashboard.

### Main Objective

> **To develop an Edge AI based predictive maintenance node capable of monitoring industrial machine parameters and predicting potential failures at an early stage.**

---

## ✨ Key Features

### 📊 Real-Time Machine Monitoring

Displays live machine parameters including:

- 🌡️ Temperature
- 📈 Vibration
- ⚡ Current
- ❤️ Machine Health

Sensor information is continuously updated through the backend API.

---

### 🏭 Machine Overview

Provides an overview of the monitored machine and its current operating condition.

The dashboard presents:

- Machine status
- Sensor readings
- Machine health
- Operating condition

---

### ⚠️ Fault Detection

The system analyzes machine operating parameters to identify abnormal conditions.

Fault detection can help identify issues related to:

- Excessive temperature
- Abnormal vibration
- High current/load
- General machine condition

The dashboard displays the detected fault and its current severity.

---

### 🤖 Edge AI Prediction

The predictive maintenance module provides:

- Predicted machine health
- Risk level
- AI recommendation
- Potential maintenance requirement

The system is designed to support early fault prediction rather than relying only on failure detection after a fault occurs.

---

### 💬 Maintenance Assistant

The dashboard includes an AI-powered Maintenance Assistant that allows users to ask questions about:

- Machine health
- Sensor values
- Fault conditions
- Maintenance requirements
- Machine operating conditions

Why is the machine vibrating?

## System Architecture

Sensors / Proteus
        ↓
Edge Node
        ↓
Backend API
        ↓
AI Fault Detection
        ↓
Database
        ↓
Web Dashboard

## Technology Stack

Frontend:
- React
- Vite

Backend:
- Python
- FastAPI

AI:
- Python
- Machine Learning / Deep Learning

Database:
- SQLite initially
- PostgreSQL later

Simulation:
- Proteus

Hardware:
- Microcontroller / ESP32
- Sensors

## Development Status

Day 1 - Project foundation

# Edge AI Based Predictive Maintenance Node
=======
# ESA Dashboard – Edge AI Based Predictive Maintenance System
>>>>>>> b222809 ("UI/UX and backend works")

## 1. Project Overview
The **ESA Dashboard** is an industrial-grade predictive maintenance monitoring platform designed for high-reliability rotating industrial machinery (e.g., motor pumps, cooling fans, and compressors). The platform continuously analyzes multi-sensor telemetry—including **temperature**, **vibration**, and **electrical current**—to evaluate operational health, detect early mechanical and electrical faults, forecast Remaining Useful Life (RUL), and assist plant engineers through an integrated AI Maintenance Assistant copilot.

The system is architected to operate with simulated industrial data out of the box, with a turnkey ingestion gateway (`POST /api/telemetry`) to transition seamlessly to physical microcontrollers (ESP32, Raspberry Pi, Arduino) and Edge AI hardware.

---

## 2. Key Features
- **Real-Time Telemetry Streaming**: Continuous monitoring of thermal (°C), mechanical vibration (mm/s RMS), and electrical current draw (A).
- **Multi-Machine Asset Fleet**: Dynamic switching between multiple industrial assets (`MTR-001`, `MTR-002`, `MTR-003`) with independent telemetry state.
- **Dynamic Machine Health Calculation**: Modular health engine calculating dynamic scores from 0% to 100% based on multi-sensor degradation penalties.
- **Automated Fault Detection**: Classification of high temperature, excessive vibration, motor overcurrent, and compound multi-sensor failures with root cause analysis.
- **AI Health Prediction & Risk Analysis**: Edge AI inference forecasting machine condition, failure risk level (Low, Medium, High), anomaly scores, and Remaining Useful Life (RUL).
- **AI Maintenance Assistant**: Context-aware conversational assistant prioritizing safety and sensor-specific queries with industrial disclaimer safeguards.
- **Interactive Fault Simulation**: Live demonstration controls for academic presentations to inject critical thermal, vibration, or overload conditions in real time.
- **Industrial UI/UX**: High-contrast dark theme (#0B1117, #00C9A7, #7C5CFC) built with semantic HTML, dual-axis time-series visualization, and accessible status badges.

---

## 3. System Architecture

```text
<<<<<<< HEAD
Machine / Sensors
       |
       v
Edge Node / Proteus Simulation
       |
       v
Sensor Data
       |
       v
Backend API
       |
       +----------------+
       |                |
       v                v
   AI Model         Database
       |                |
       +-------+--------+
               |
               v
        Web Dashboard


=======
                     [ PHYSICAL ASSET / MOTOR ]
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
    [RTD / DS18B20]       [MPU6050 / ADXL]       [SCT-013 CT]
    (Temperature °C)     (Vibration mm/s)        (Current A)
          │                     │                     │
          └─────────────────────┼─────────────────────┘
                                │
                                ▼
                   ┌─────────────────────────┐
                   │   EDGE DEVICE / ESP32   │
                   │  - Sensor Sampling      │
                   │  - Filtering & RMS Calc │
                   │  - Edge Anomaly Filter  │
                   └────────────┬────────────┘
                                │  HTTP POST /api/telemetry
                                ▼
                   ┌─────────────────────────┐
                   │     FASTAPI BACKEND     │
                   │  - Multi-Machine Engine │
                   │  - Health Calculation   │
                   │  - Fault Diagnostics    │
                   │  - Edge AI Prediction   │
                   │  - AI Maintenance Chat  │
                   └────────────┬────────────┘
                                │  HTTP Polling & REST APIs
                                ▼
                   ┌─────────────────────────┐
                   │    REACT 19 DASHBOARD   │
                   │  - Real-time Visualizer │
                   │  - Recharts Dual-Axis   │
                   │  - Diagnostics Cards    │
                   │  - AI Copilot Interface │
                   │  - Demo Fault Controls  │
                   └─────────────────────────┘
```

---

## 4. Technology Stack
- **Frontend**: React 19, Vite 8, Recharts 3, Lucide React icons, CSS3 Design Tokens.
- **Backend**: Python 3.13+, FastAPI 0.115+, Uvicorn 0.30+, Pydantic 2.8+.
- **Edge / Hardware**: ESP32 DevKit, C++ Arduino Framework, OneWire, I2C.
- **AI / Modeling**: Python numerical analysis, anomaly scoring, predictive regression.

---

## 5. Project Structure
```text
ESA DASHBOARD/
├── backend/
│   ├── config/
│   │   ├── __init__.py
│   │   └── thresholds.py            # Centralized engineering thresholds
│   ├── services/
│   │   ├── fault_detection.py       # Fault classification & root cause analysis
│   │   ├── health_calculation.py    # Modular health score engine (0-100%)
│   │   └── machine_manager.py       # Multi-machine state & telemetry simulator
│   ├── prediction.py                # AI Health & RUL prediction module
│   ├── main.py                      # FastAPI REST API endpoints
│   ├── requirements.txt             # Python backend dependencies
│   └── venv/                        # Python virtual environment
├── frontend/
│   ├── public/                      # Static assets & favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx           # Industrial header & machine badge
│   │   │   ├── Sidebar.jsx          # Smooth-scrolling 8-section navigation
│   │   │   ├── MetricCard.jsx       # Sensor metric card with threshold criteria
│   │   │   ├── SensorChart.jsx      # Dual-axis Recharts time-series stream
│   │   │   ├── FaultDetection.jsx   # Dedicated diagnostics & root cause UI
│   │   │   ├── AIPrediction.jsx     # AI health, risk, and RUL forecast UI
│   │   │   ├── Chatbot.jsx          # AI maintenance assistant copilot
│   │   │   └── SettingsSection.jsx  # Threshold viewer & demo fault controls
│   │   ├── App.jsx                  # Main dashboard application
│   │   ├── App.css                  # Industrial design system styles
│   │   ├── index.css                # Global root dark reset
│   │   └── main.jsx                 # React root entrypoint
│   ├── package.json
│   └── vite.config.js
├── hardware/
│   └── esp32_firmware_sample.ino    # Turnkey ESP32 Arduino C++ firmware
├── ai/
│   └── edge_model_stub.py           # Abstraction layer for ML/DL model pipeline
└── README.md
```

---

## 6. Installation & Prerequisites
- **Node.js**: v18.0 or newer (v24.x recommended).
- **Python**: v3.10 or newer (v3.13.5 tested).

---

## 7. Backend Setup

1. Open terminal in the project directory:
   ```bash
   cd backend
   ```
2. Activate the existing virtual environment:
   - **Windows PowerShell**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     source venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
5. Verify API is running:
   - Browse to: `http://127.0.0.1:8000`
   - Interactive Swagger API docs: `http://127.0.0.1:8000/docs`

---

## 8. Frontend Setup

1. Open a new terminal in the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the dashboard:
   - Browse to: `http://localhost:5173`

---

## 9. API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Healthcheck and service status |
| `GET` | `/api/thresholds` | Retrieve centralized sensor thresholds and health bands |
| `GET` | `/api/machines` | List all monitored machines with current status |
| `GET` | `/api/machines/{machine_id}` | Detailed telemetry and diagnostics for a specific machine |
| `GET` | `/api/sensor-data?machine_id=...` | Live sensor streams, health score, fault diagnosis, and history |
| `GET` | `/api/ai-prediction?machine_id=...` | Predictive health assessment, risk level, and RUL estimation |
| `POST` | `/api/chat` | AI Maintenance Assistant dialogue endpoint |
| `POST` | `/api/telemetry` | Physical hardware sensor ingestion endpoint (ESP32 / Edge Node) |
| `POST` | `/api/machines/{machine_id}/simulate-fault` | Demo toggle for fault injection (thermal, vibration, current, compound) |

---

## 10. Sensor Parameters & Centralized Thresholds

| Parameter | Sensor Type | Normal Operating Range | Warning Range | Critical Range | Units |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Temperature** | RTD / Thermocouple | `< 70.0 °C` | `70.0 – 79.9 °C` | `>= 80.0 °C` | °C |
| **Vibration** | Piezo / Accelerometer | `< 5.0 mm/s` | `5.0 – 7.99 mm/s` | `>= 8.0 mm/s` | mm/s |
| **Current** | Current Transformer | `< 10.0 A` | `10.0 – 11.99 A` | `>= 12.0 A` | A |

---

## 11. Machine Health Calculation Logic
Machine health is calculated dynamically by `backend/services/health_calculation.py`:
- **Starting Health**: 100.0%
- **Temperature Penalty**: Proportional deduction up to 40% when exceeding 70 °C; accelerated penalty above 80 °C.
- **Vibration Penalty**: Proportional deduction up to 45% when exceeding 5.0 mm/s; accelerated penalty above 8.0 mm/s.
- **Current Penalty**: Proportional deduction up to 35% when exceeding 10.0 A; accelerated penalty above 12.0 A.
- **Status Classification**:
  - **80% – 100%**: Normal (Operational)
  - **60% – 79%**: Warning (Attention required)
  - **0% – 59%**: Critical (Immediate maintenance intervention)

---

## 12. Fault Detection & Root Cause Analysis
Implemented in `backend/services/fault_detection.py`:
- **High Temperature**: Identifies cooling airflow restriction, heat exchanger blockage, or lubrication breakdown.
- **Excessive Vibration**: Identifies bearing race spalling, shaft angular/radial misalignment, and rotor unbalance.
- **Over Current**: Identifies mechanical binding, electrical winding degradation, or line over-demand.
- **Multiple Sensor Abnormality**: Composite multi-parameter failure requiring immediate emergency shutdown.

---

## 13. Edge AI Prediction & RUL Estimation
Implemented in `backend/prediction.py`:
- Forecasts degraded machine health forward in time based on rate-of-change and excess severity.
- Classifies operational risk into **Low**, **Medium**, or **High**.
- Provides estimated Remaining Useful Life (RUL) in operating hours:
  - `> 500 hours` for healthy machinery.
  - `48 – 120 hours` for warning states.
  - `< 12 hours` for critical states.
- Calculates an Anomaly Score (0.0 to 1.0) ready for industrial SCADA logging.

---

## 14. Maintenance Assistant (Chatbot Copilot)
Located at `POST /api/chat`:
- Evaluates specific queries using live telemetry context.
- **Priority Logic**: Safety and operation queries ("Is it safe to run?") are evaluated first; specific sensor queries ("Why is vibration high?") are resolved before generic machine matching.
- **Safety Standard**: Phrased with realistic data qualifications ("Based on current telemetry from MTR-001...") and provides safe maintenance instructions.

---

## 15. Future Hardware Integration
Physical microcontrollers can push readings directly to the platform via HTTP POST:
- **Endpoint**: `http://<backend-host>:8000/api/telemetry`
- **Payload Schema**:
  ```json
  {
    "machine_id": "MTR-001",
    "temperature": 72.4,
    "vibration": 3.12,
    "current": 6.85
  }
  ```
- **Firmware**: Turnkey ESP32 code is provided in `hardware/esp32_firmware_sample.ino`.

---

## 16. Future Edge AI Model Deployment
The modular backend architecture is designed to host offline or online machine learning models:
- **Model Frameworks Supported**: Scikit-Learn, PyTorch, TensorFlow Lite, ONNX Runtime.
- **Deployment Location**: `ai/edge_model_stub.py` contains the feature extraction pipeline (RMS, standard deviation, peak-to-peak) ready to plug in model weights (`.onnx` / `.tflite`).

---

## 17. Development Status
- **Phase 1 (Core Fixes & Centralized Config)**: Completed.
- **Phase 2 (Multi-Machine State & Ingestion Engine)**: Completed.
- **Phase 3 (AI Diagnostics & Copilot Refinement)**: Completed.
- **Phase 4 (Frontend Modularization & Industrial UI/UX)**: Completed.
- **Phase 5 (Hardware Firmwares & Verification)**: Completed.
- **Platform Status**: Stable, tested, and presentation-ready.
>>>>>>> b222809 ("UI/UX and backend works")
