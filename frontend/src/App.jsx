import { useEffect, useState } from "react";

import {
    Thermometer,
    Activity,
    Zap,
    HeartPulse,
    AlertTriangle,
    ShieldCheck,
    Bot,
    ArrowRight,
    Sparkles,
    Wifi,
    Gauge
} from "lucide-react";

import "./App.css";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MetricCard from "./components/MetricCard";
import SensorChart from "./components/SensorChart";


function App() {

    const getSensorStatus = (type, value) => {
        if (type === "temperature") {
            if (value >= 80) return "Critical";
            if (value >= 70) return "Warning";
            return "Normal";
        }

        if (type === "vibration") {
            if (value >= 8) return "Critical";
            if (value >= 5) return "Warning";
            return "Normal";
        }

        if (type === "current") {
            if (value >= 12) return "Critical";
            if (value >= 10) return "Warning";
            return "Normal";
        }

        return "Normal";
    };

    /* =========================================================
       NAVIGATION
    ========================================================= */

    const [activeSection, setActiveSection] =
        useState("dashboard");

    /* =========================================================
    MACHINE MANAGEMENT
    ========================================================= */

    const [selectedMachine, setSelectedMachine] =
        useState("MTR-001");

    const machines = [
        {
            id: "MTR-001",
            name: "Motor Pump 01",
            type: "Industrial Motor",
            location: "Production Line A"
        },
        {
            id: "MTR-002",
            name: "Motor Pump 02",
            type: "Industrial Motor",
            location: "Production Line B"
        },
        {
            id: "MTR-003",
            name: "Cooling Fan 01",
            type: "Cooling System",
            location: "Production Line C"
        }
    ];


    /* =========================================================
       MACHINE DATA
    ========================================================= */

    const [temperature, setTemperature] =
        useState(68.4);

    const [vibration, setVibration] =
        useState(3.21);

    const [current, setCurrent] =
        useState(2.13);

    const [health, setHealth] =
        useState(91);


    const [sensorHistory, setSensorHistory] =
        useState([]);


    /* =========================================================
       AI PREDICTION
    ========================================================= */

    const [aiPrediction, setAiPrediction] =
        useState({
            health: 0,
            status: "Loading..."
        });


    /* =========================================================
       SYSTEM STATUS
    ========================================================= */

    const [connectionStatus, setConnectionStatus] =
        useState("Connected");

    const [lastUpdated, setLastUpdated] =
        useState("--");

    const [machineStatus, setMachineStatus] =
        useState("Normal");


    /* =========================================================
       FAULT DATA
    ========================================================= */

    const [faultMessage, setFaultMessage] =
        useState("No fault detected");

    const [faultExplanation, setFaultExplanation] =
        useState("");

    const [recommendedAction, setRecommendedAction] =
        useState("");


    /* =========================================================
       CHATBOT
    ========================================================= */

    const [chatInput, setChatInput] =
        useState("");

    const [chatMessages, setChatMessages] =
        useState([
            {
                sender: "bot",
                text:
                    "Hello! I am your AI maintenance assistant. Ask me about machine condition, faults, sensor readings, or recommended actions."
            }
        ]);


    /* =========================================================
       BACKEND SENSOR DATA
    ========================================================= */

    useEffect(() => {

        const fetchSensorData = async () => {

            try {

                const response =
                    await fetch(
                        "http://127.0.0.1:8000/api/sensor-data"
                    );


                if (!response.ok) {

                    throw new Error(
                        "Backend request failed"
                    );

                }


                const data =
                    await response.json();


                /* CONNECTION */

                setConnectionStatus(
                    "Connected"
                );


                /* LAST UPDATED */

                setLastUpdated(
                    new Date(
                        data.timestamp
                    ).toLocaleTimeString()
                );


                /* SENSOR VALUES */

                setTemperature(
                    data.temperature
                );

                setVibration(
                    data.vibration
                );

                setCurrent(
                    data.current
                );

                setHealth(
                    data.health
                );


                /* MACHINE STATUS */

                setMachineStatus(
                    data.status
                );


                /* FAULT */

                setFaultMessage(
                    data.fault
                );

                setFaultExplanation(
                    data.fault_explanation
                );

                setRecommendedAction(
                    data.recommended_action
                );


                /* =================================================
                   AI PREDICTION
                ================================================= */

                const predictionResponse =
                    await fetch(
                        "http://127.0.0.1:8000/api/ai-prediction"
                    );


                if (!predictionResponse.ok) {

                    throw new Error(
                        "AI prediction request failed"
                    );

                }


                const predictionData =
                    await predictionResponse.json();


                setAiPrediction({

                    health:
                        predictionData.health,

                    status:
                        predictionData.status

                });


                /* =================================================
                   SENSOR HISTORY
                ================================================= */

                setSensorHistory(
                    (previous) => {

                        const newReading = {

                            time:
                                new Date(
                                    data.timestamp
                                ).toLocaleTimeString(),

                            temperature:
                                data.temperature,

                            vibration:
                                data.vibration,

                            current:
                                data.current

                        };


                        const updated = [

                            ...previous,

                            newReading

                        ];


                        return updated.slice(-20);

                    }
                );


            } catch (error) {

                console.error(
                    "Unable to connect to backend:",
                    error
                );


                setConnectionStatus(
                    "Disconnected"
                );

            }

        };


        fetchSensorData();


        const interval =
            setInterval(
                fetchSensorData,
                3000
            );


        return () =>
            clearInterval(interval);

    }, []);


    /* =========================================================
       CHATBOT BACKEND
    ========================================================= */

    const handleBackendChat = async (
        questionOverride = null
    ) => {

        const question =
            questionOverride || chatInput;


        if (!question.trim()) {

            return;

        }


        /* USER MESSAGE */

        setChatMessages(
            (previous) => [

                ...previous,

                {
                    sender: "user",
                    text: question
                }

            ]
        );


        setChatInput("");


        try {

            const response =
                await fetch(
                    "http://127.0.0.1:8000/api/chat",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                question:
                                    question
                            })
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Chat API failed"
                );

            }


            const data =
                await response.json();


            setChatMessages(
                (previous) => [

                    ...previous,

                    {
                        sender: "bot",
                        text:
                            data.answer
                    }

                ]
            );


        } catch (error) {

            console.error(
                "Chat error:",
                error
            );


            setChatMessages(
                (previous) => [

                    ...previous,

                    {
                        sender: "bot",
                        text:
                            "Unable to connect to the AI backend. Please check that the backend server is running."
                    }

                ]
            );

        }

    };


    /* =========================================================
       NAVIGATION
    ========================================================= */

    const handleNavigation =
        (sectionId) => {

            setActiveSection(
                sectionId
            );


            const section =
                document.getElementById(
                    sectionId
                );


            if (section) {

                section.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "start"

                });

            }

        };


    /* =========================================================
       QUICK QUESTIONS
    ========================================================= */

    const quickQuestions = [

        "What is the current machine status?",

        "Why is vibration high?",

        "What should I do for maintenance?",

        "Is the machine safe to operate?"

    ];


    /* =========================================================
       STATUS HELPER
    ========================================================= */

    const getStatusClass =
        (status) => {

            if (!status) {

                return "normal";

            }


            return status
                .toLowerCase()
                .replace(/\s+/g, "-");

        };


    /* =========================================================
       UI
    ========================================================= */

    return (

        <div className="app">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <Sidebar

                activeSection={
                    activeSection
                }

                onNavigate={
                    handleNavigation
                }

            />


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="main-content">


                {/* =================================================
                    HEADER
                ================================================= */}

                <Header

                    connectionStatus={
                        connectionStatus
                    }

                />


                {/* =================================================
                    DASHBOARD CONTENT
                ================================================= */}

                <div
                    id="dashboard"
                    className="dashboard-content"
                >


                {/* ================================================= 
                                    HERO SECTION 
                ================================================= */}

                <section className="dashboard-hero">

                    {/* HERO BACKGROUND IMAGE */}
                    <div className="hero-background"></div>

                    {/* HERO OVERLAY */}
                    <div className="hero-overlay"></div>

                    <div className="hero-content">

                        {/* HERO LEFT */}
                        <div className="hero-main">

                            <div className="hero-badge">
                                <Sparkles size={15} />

                                <span>
                                    EDGE AI MONITORING
                                </span>
                            </div>

                            <h1>
                                Welcome back, Admin! 👋
                            </h1>

                            <p>
                                Monitor your machines in real-time and predict
                                potential failures before they happen.
                            </p>

                            <div className="hero-stats">

                                <div className="hero-mini-card">

                                    <div className="hero-mini-icon">
                                        <HeartPulse size={20} />
                                    </div>

                                    <div>
                                        <span>
                                            Machine Status
                                        </span>

                                        <strong>
                                            {machineStatus.toUpperCase()}
                                        </strong>
                                    </div>

                                </div>

                                <div className="hero-mini-card">

                                    <div className="hero-mini-icon">
                                        <Wifi size={20} />
                                    </div>

                                    <div>
                                        <span>
                                            Connection
                                        </span>

                                        <strong>
                                            {connectionStatus.toUpperCase()}
                                        </strong>
                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* HERO RIGHT */}
                        <div className="hero-visual">

                            <div className="hero-visual-glow">

                                <Gauge
                                    size={95}
                                    strokeWidth={1.2}
                                />

                            </div>

                            <div className="hero-visual-text">

                                <span>
                                    MACHINE HEALTH
                                </span>

                                <strong>
                                    {health}%
                                </strong>

                            </div>

                        </div>

                    </div>

                </section>


                    {/* =================================================
                        SYSTEM STATUS
                    ================================================= */}

                    <div className="status-row">


                        <div
                            className={`system-status ${getStatusClass(
                                machineStatus
                            )}`}
                        >

                            <span className="status-dot"></span>

                            <span>
                                System: {machineStatus}
                            </span>

                        </div>


                        <div
                            className={`connection-status ${getStatusClass(
                                connectionStatus
                            )}`}
                        >

                            <span className="status-dot"></span>

                            <span>
                                Backend: {connectionStatus}
                            </span>

                        </div>


                        <div className="last-updated">

                            Last updated:
                            {" "}
                            {lastUpdated}

                        </div>


                    </div>


                    {/* =================================================
                        MACHINE OVERVIEW
                    ================================================= */}

                    <section
                        id="machines"
                        className="dashboard-section"
                    >


                        <div className="section-header">

                            <div>

                                <div className="section-kicker">
                                    MACHINE MONITORING
                                </div>

                                <h2>
                                    Machine Overview
                                </h2>

                                <p>
                                    Live simulated sensor readings
                                    from the monitored machine.
                                </p>

                            </div>

                        </div>
                        <div className="machine-management-card">

                            <div className="machine-management-header">

                                <div>

                                    <div className="section-kicker">
                                        MACHINE MANAGEMENT
                                    </div>

                                    <h3>
                                        Monitored Machine
                                    </h3>

                                    <p>
                                        Select and view the currently monitored machine.
                                    </p>

                                </div>

                                <select
                                    className="machine-selector"
                                    value={selectedMachine}
                                    onChange={(e) =>
                                        setSelectedMachine(e.target.value)
                                    }
                                >

                                    {machines.map((machine) => (

                                        <option
                                            key={machine.id}
                                            value={machine.id}
                                        >
                                            {machine.name}
                                        </option>

                                    ))}

                                </select>

                            </div>


                            {machines
                                .filter(
                                    (machine) =>
                                        machine.id === selectedMachine
                                )
                                .map((machine) => (

                                    <div
                                        className="machine-information"
                                        key={machine.id}
                                    >

                                        <div className="machine-info-item">

                                            <span>
                                                Machine ID
                                            </span>

                                            <strong>
                                                {machine.id}
                                            </strong>

                                        </div>


                                        <div className="machine-info-item">

                                            <span>
                                                Machine Type
                                            </span>

                                            <strong>
                                                {machine.type}
                                            </strong>

                                        </div>


                                        <div className="machine-info-item">

                                            <span>
                                                Location
                                            </span>

                                            <strong>
                                                {machine.location}
                                            </strong>

                                        </div>


                                        <div className="machine-info-item">

                                            <span>
                                                Current Status
                                            </span>

                                            <strong
                                                className={`machine-status-text ${getStatusClass(
                                                    machineStatus
                                                )}`}
                                            >
                                                {machineStatus}
                                            </strong>

                                        </div>

                                    </div>

                                ))}

                        </div>  


                        <div className="metrics-grid">


                            <MetricCard

                                title="Temperature"

                                value={
                                    temperature
                                }

                                unit="°C"

                                icon={
                                    <Thermometer
                                        size={28}
                                    />
                                }

                                status={
                                    temperature > 72
                                        ? "High"
                                        : "Normal"
                                }

                            />


                            <MetricCard

                                title="Vibration"

                                value={
                                    vibration
                                }

                                unit="mm/s"

                                icon={
                                    <Activity
                                        size={28}
                                    />
                                }

                                status={
                                    vibration > 3.5
                                        ? "High"
                                        : "Normal"
                                }

                            />


                            <MetricCard

                                title="Current"

                                value={
                                    current
                                }

                                unit="A"

                                icon={
                                    <Zap
                                        size={28}
                                    />
                                }

                                status={
                                    current > 2.4
                                        ? "High"
                                        : "Normal"
                                }

                            />


                            <MetricCard

                                title="Machine Health"

                                value={
                                    health
                                }

                                unit="%"

                                icon={
                                    <HeartPulse
                                        size={28}
                                    />
                                }

                                status={
                                    machineStatus
                                }

                            />


                        </div>

                    </section>


                    {/* =================================================
                        SENSOR MONITORING
                    ================================================= */}

                    <section
                        id="sensors"
                        className="dashboard-section"
                    >


                        <div className="section-header">

                            <div>

                                <div className="section-kicker">
                                    REAL-TIME DATA
                                </div>

                                <h2>
                                    Live Sensor Trends
                                </h2>

                                <p>
                                    Real-time machine sensor
                                    monitoring and performance trends.
                                </p>

                            </div>


                            <div className="section-live-status">

                                <span className="status-dot"></span>

                                LIVE

                            </div>

                        </div>


                        <div className="sensor-chart-panel">

                            <SensorChart
                                data={
                                    sensorHistory
                                }
                            />

                        </div>


                        <div className="trend-placeholder">


                            <div className="trend-line">

                                <div>

                                    <span>
                                        Temperature
                                    </span>

                                    <small>
                                        Thermal sensor
                                    </small>

                                </div>

                                <strong>
                                    {temperature} °C
                                </strong>

                            </div>


                            <div className="trend-line">

                                <div>

                                    <span>
                                        Vibration
                                    </span>

                                    <small>
                                        Vibration sensor
                                    </small>

                                </div>

                                <strong>
                                    {vibration} mm/s
                                </strong>

                            </div>


                            <div className="trend-line">

                                <div>

                                    <span>
                                        Current
                                    </span>

                                    <small>
                                        Electrical sensor
                                    </small>

                                </div>

                                <strong>
                                    {current} A
                                </strong>

                            </div>


                        </div>

                    </section>


                    {/* =================================================
                        FAULT DETECTION
                    ================================================= */}

                    <section
                        id="faults"
                        className="dashboard-section"
                    >


                        <div className="section-header">

                            <div>

                                <div className="section-kicker">
                                    SAFETY MONITORING
                                </div>

                                <h2>
                                    Fault Detection
                                </h2>

                                <p>
                                    AI-assisted machine condition
                                    and fault analysis.
                                </p>

                            </div>

                        </div>


                        <div className="fault-panel">


                            <div className="fault-icon">

                                {machineStatus
                                    .toLowerCase() ===
                                    "normal" ? (

                                    <ShieldCheck
                                        size={36}
                                    />

                                ) : (

                                    <AlertTriangle
                                        size={36}
                                    />

                                )}

                            </div>


                            <div className="fault-info">

                                <h3>
                                    {faultMessage}
                                </h3>

                                <p>
                                    Monitoring temperature,
                                    vibration and current
                                    continuously.
                                </p>

                            </div>


                            <div
                                className={`fault-status ${getStatusClass(
                                    machineStatus
                                )}`}
                            >

                                {machineStatus}

                            </div>


                        </div>


                        <div className="fault-details">


                            <div className="fault-detail-card">

                                <div className="detail-number">
                                    01
                                </div>

                                <div>

                                    <h3>
                                        What is happening?
                                    </h3>

                                    <p>
                                        {faultExplanation ||
                                            "The system is continuously analyzing machine sensor data."
                                        }
                                    </p>

                                </div>

                            </div>


                            <div className="fault-detail-card">

                                <div className="detail-number">
                                    02
                                </div>

                                <div>

                                    <h3>
                                        Recommended Action
                                    </h3>

                                    <p>
                                        {recommendedAction ||
                                            "Continue monitoring the machine."
                                        }
                                    </p>

                                </div>

                            </div>


                        </div>

                    </section>


                    {/* =================================================
                        AI PREDICTION
                    ================================================= */}

                    <section
                        id="predictions"
                        className="dashboard-section"
                    >


                        <div className="section-header">

                            <div>

                                <div className="section-kicker">
                                    ARTIFICIAL INTELLIGENCE
                                </div>

                                <h2>
                                    AI Prediction
                                </h2>

                                <p>
                                    Machine health prediction
                                    generated by the AI model.
                                </p>

                            </div>

                        </div>


                        <div className="ai-prediction-card">


                            <div className="ai-prediction-left">


                                <div className="ai-title">

                                    <div className="ai-icon">

                                        <Bot
                                            size={23}
                                        />

                                    </div>

                                    <div>

                                        <h3>
                                            Predicted Machine Health
                                        </h3>

                                        <span>
                                            AI condition assessment
                                        </span>

                                    </div>

                                </div>


                                <div className="ai-health-value">

                                    {aiPrediction.health}%

                                </div>


                                <p>

                                    Prediction Status:

                                    {" "}

                                    <strong>
                                        {
                                            aiPrediction.status
                                        }
                                    </strong>

                                </p>


                            </div>


                            <div className="ai-prediction-message">

                                <Sparkles
                                    size={25}
                                />


                                {aiPrediction.status ===
                                    "Healthy" && (

                                    <p>
                                        Machine condition
                                        is currently healthy.
                                        Continue normal
                                        monitoring.
                                    </p>

                                )}


                                {aiPrediction.status ===
                                    "Warning" && (

                                    <p>
                                        Machine requires
                                        attention. Monitor
                                        sensor conditions
                                        closely.
                                    </p>

                                )}


                                {aiPrediction.status ===
                                    "Critical" && (

                                    <p>
                                        Critical condition
                                        detected.
                                        Maintenance is
                                        recommended.
                                    </p>

                                )}


                                {aiPrediction.status ===
                                    "Loading..." && (

                                    <p>
                                        AI prediction is
                                        being calculated...
                                    </p>

                                )}

                            </div>


                        </div>

                    </section>


                    {/* =================================================
                        MAINTENANCE ASSISTANT
                    ================================================= */}

                    <section
                        id="assistant"
                        className="dashboard-section"
                    >


                        <div className="section-header">

                            <div>

                                <div className="section-kicker">
                                    AI SUPPORT
                                </div>

                                <h2>
                                    Maintenance Assistant
                                </h2>

                                <p>
                                    Ask the AI assistant about
                                    the current machine condition.
                                </p>

                            </div>

                        </div>


                        <div className="chatbot-container">


                            {/* CHAT HEADER */}

                            <div className="chatbot-header">


                                <div className="chatbot-title">


                                    <div className="chatbot-icon">

                                        <Bot
                                            size={23}
                                        />

                                    </div>


                                    <div>

                                        <h3>
                                            AI Maintenance Assistant
                                        </h3>

                                        <span>
                                            AI-powered machine support
                                        </span>

                                    </div>


                                </div>


                                <div className="assistant-online">

                                    <span className="status-dot"></span>

                                    Online

                                </div>


                            </div>


                            {/* CHAT BODY */}

                            <div className="chatbot-body">


                                <div className="chatbot-messages">


                                    {chatMessages.map(
                                        (
                                            message,
                                            index
                                        ) => (

                                            <div
                                                key={
                                                    index
                                                }
                                                className={`chat-message ${message.sender}`}
                                            >


                                                <div className="chat-message-label">

                                                    {message.sender ===
                                                        "bot"
                                                        ? "Maintenance Assistant"
                                                        : "You"
                                                    }

                                                </div>


                                                <div
                                                    className="chat-message-text"
                                                    style={{
                                                        whiteSpace:
                                                            "pre-line"
                                                    }}
                                                >

                                                    {
                                                        message.text
                                                    }

                                                </div>


                                            </div>

                                        )
                                    )}


                                </div>


                                {/* QUICK QUESTIONS */}

                                <div className="quick-questions">


                                    <div className="quick-title">

                                        Quick Questions

                                    </div>


                                    {quickQuestions.map(
                                        (
                                            question,
                                            index
                                        ) => (

                                            <button
                                                key={
                                                    index
                                                }
                                                className="quick-question"
                                                onClick={() =>
                                                    handleBackendChat(
                                                        question
                                                    )
                                                }
                                            >

                                                <span>
                                                    {
                                                        question
                                                    }
                                                </span>

                                                <ArrowRight
                                                    size={16}
                                                />

                                            </button>

                                        )
                                    )}


                                </div>


                            </div>


                            {/* INPUT */}

                            <div className="chatbot-input-area">


                                <input

                                    type="text"

                                    value={
                                        chatInput
                                    }

                                    onChange={
                                        (e) =>
                                            setChatInput(
                                                e.target.value
                                            )
                                    }

                                    onKeyDown={
                                        (e) => {

                                            if (
                                                e.key ===
                                                "Enter"
                                            ) {

                                                handleBackendChat();

                                            }

                                        }
                                    }

                                    placeholder="Ask something about the machine..."

                                />


                                <button
                                    onClick={() =>
                                        handleBackendChat()
                                    }
                                >

                                    <span>
                                        Send
                                    </span>

                                    <ArrowRight
                                        size={18}
                                    />

                                </button>


                            </div>


                        </div>

                    </section>


                </div>

            </main>

        </div>

    );

}


export default App;