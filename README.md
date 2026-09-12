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


