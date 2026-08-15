# Edge AI Based Predictive Maintenance Node

## Project Overview

An Edge AI based predictive maintenance system designed to monitor machine
parameters, detect abnormal operating conditions, identify possible faults,
and provide predictive maintenance information through a web dashboard.

## Main Objectives

- Monitor machine parameters
- Detect abnormal conditions
- Perform AI-based fault detection
- Display real-time machine information
- Store historical sensor data
- Generate maintenance alerts
- Support Proteus-based simulation
- Provide a path toward future hardware implementation

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

## 1. Project Overview

The Edge AI Based Predictive Maintenance Node is an intelligent machine
monitoring and fault detection system.

The system is designed to collect machine operating parameters, process
sensor information, detect abnormal operating conditions, classify possible
faults using Artificial Intelligence, and display the machine condition
through a web-based dashboard.

The project initially uses simulation and software-based development and
will provide a pathway toward future physical hardware implementation.

---

## 2. Main Objectives

- Monitor machine operating parameters
- Collect sensor data
- Detect abnormal machine conditions
- Perform AI-based fault detection
- Display real-time machine information
- Store historical sensor data
- Generate maintenance alerts
- Support predictive maintenance
- Provide Proteus-based hardware simulation
- Provide a foundation for future physical hardware implementation

---

## 3. System Architecture

```text
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