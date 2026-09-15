import { useEffect, useState, useCallback } from "react";
import {
    Thermometer,
    Activity,
    Zap,
    HeartPulse,
    Sparkles,
    Wifi,
    WifiOff,
    Gauge,
    Cpu,
    CheckCircle2
} from "lucide-react";

import "./App.css";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MetricCard from "./components/MetricCard";
import SensorChart from "./components/SensorChart";
import FaultDetection from "./components/FaultDetection";
import AIPrediction from "./components/AIPrediction";
import Chatbot from "./components/Chatbot";
import SettingsSection from "./components/SettingsSection";

const API_BASE_URL = "http://127.0.0.1:8000";

const DEFAULT_MACHINES = [
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

function App() {
    /* =========================================================
       NAVIGATION STATE
    ========================================================= */
    const [activeSection, setActiveSection] = useState("dashboard");

    /* =========================================================
       MACHINE MANAGEMENT
    ========================================================= */
    const [machines, setMachines] = useState(DEFAULT_MACHINES);
    const [selectedMachine, setSelectedMachine] = useState("MTR-001");

    /* =========================================================
       TELEMETRY & SENSOR DATA
    ========================================================= */
    const [temperature, setTemperature] = useState(66.5);
    const [vibration, setVibration] = useState(2.8);
    const [current, setCurrent] = useState(6.5);
    const [health, setHealth] = useState(100);
    const [sensorHistory, setSensorHistory] = useState([]);

    /* =========================================================
       DIAGNOSTICS & FAULT DATA
    ========================================================= */
    const [machineStatus, setMachineStatus] = useState("Normal");
    const [faultMessage, setFaultMessage] = useState("No fault detected");
    const [faultExplanation, setFaultExplanation] = useState("");
    const [recommendedAction, setRecommendedAction] = useState("");
    const [warnings, setWarnings] = useState([]);
    const [faults, setFaults] = useState([]);
    const [dataSource, setDataSource] = useState("simulated");
    const [simulationMode, setSimulationMode] = useState("normal");

    /* =========================================================
       AI PREDICTION STATE
    ========================================================= */
    const [aiPrediction, setAiPrediction] = useState({
        health: 100,
        status: "Healthy",
        risk: "Low",
        recommendation: "Machine condition is currently stable. Operational parameters within normal tolerances.",
        anomaly_score: 0.02,
        estimated_rul_hours: 1000,
        model_version: "ESA-EdgeAI-v1.2"
    });

    /* =========================================================
       SYSTEM & CONNECTION STATUS
    ========================================================= */
    const [connectionStatus, setConnectionStatus] = useState("Connecting...");
    const [lastUpdated, setLastUpdated] = useState("--");

    /* =========================================================
       CHATBOT STATE
    ========================================================= */
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        {
            sender: "bot",
            text: "Hello! I am your Edge AI maintenance assistant. You can ask me about live machine condition, thermal status, vibration abnormalities, or safety guidelines."
        }
    ]);

    /* =========================================================
       FETCH TELEMETRY CYCLE
    ========================================================= */
    const fetchTelemetry = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/sensor-data?machine_id=${selectedMachine}`);
            if (!res.ok) {
                throw new Error(`HTTP error ${res.status}`);
            }
            const data = await res.json();

            setConnectionStatus("Connected");
            setLastUpdated(new Date().toLocaleTimeString());

            // Telemetry updates
            setTemperature(data.temperature);
            setVibration(data.vibration);
            setCurrent(data.current);
            setHealth(data.health);
            setMachineStatus(data.status);
            setFaultMessage(data.fault);
            setFaultExplanation(data.fault_explanation);
            setRecommendedAction(data.recommended_action);
            setWarnings(data.warnings || []);
            setFaults(data.faults || []);
            setDataSource(data.source || "simulated");
            setSimulationMode(data.simulation_mode || "normal");

            // Sensor History
            if (data.history && data.history.length > 0) {
                setSensorHistory(data.history);
            } else {
                setSensorHistory((prev) => {
                    const sample = {
                        time: new Date().toLocaleTimeString(),
                        temperature: data.temperature,
                        vibration: data.vibration,
                        current: data.current
                    };
                    return [...prev, sample].slice(-20);
                });
            }

            // Sync AI prediction if present
            if (data.ai_prediction) {
                setAiPrediction(data.ai_prediction);
            }

        } catch (error) {
            console.error("Telemetry fetch error:", error);
            setConnectionStatus("Disconnected");
        }
    }, [selectedMachine]);

    // Initial machine roster load
    useEffect(() => {
        const fetchMachines = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/machines`);
                if (res.ok) {
                    const list = await res.json();
                    if (Array.isArray(list) && list.length > 0) {
                        setMachines(list);
                    }
                }
            } catch (err) {
                // Keep default machine roster if offline
            }
        };
        fetchMachines();
    }, []);

    // Active polling interval (3000ms)
    useEffect(() => {
        fetchTelemetry();
        const interval = setInterval(fetchTelemetry, 3000);
        return () => clearInterval(interval);
    }, [fetchTelemetry]);

    /* =========================================================
       CHATBOT INTERACTION
    ========================================================= */
    const handleSendMessage = async (queryText) => {
        if (!queryText || !queryText.trim()) return;

        // Add user message
        setChatMessages((prev) => [
            ...prev,
            { sender: "user", text: queryText }
        ]);

        setIsChatLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: queryText,
                    machine_id: selectedMachine
                })
            });

            if (!res.ok) {
                throw new Error(`Chat API error: ${res.status}`);
            }

            const data = await res.json();
            setChatMessages((prev) => [
                ...prev,
                { sender: "bot", text: data.answer }
            ]);

        } catch (err) {
            console.error("Chatbot request failed:", err);
            setChatMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: "⚠️ Unable to connect to the AI diagnostic backend. Please verify that the FastAPI backend server is running on port 8000."
                }
            ]);
        } finally {
            setIsChatLoading(false);
        }
    };

    /* =========================================================
       SIMULATION / DEMO FAULT TOGGLE
    ========================================================= */
    const handleFaultSimulate = async (mode) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/machines/${selectedMachine}/simulate-fault`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode })
            });
            if (res.ok) {
                setSimulationMode(mode);
                // Immediately refresh telemetry
                await fetchTelemetry();
            }
        } catch (err) {
            console.error("Simulation mode toggle failed:", err);
            throw err;
        }
    };

    /* =========================================================
       NAVIGATION SCROLL HANDLER
    ========================================================= */
    const handleNavigation = (sectionId) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    /* =========================================================
       HELPERS
    ========================================================= */
    const getStatusClass = (status) => {
        if (!status) return "normal";
        return status.toLowerCase().replace(/\s+/g, "-");
    };

    const activeMachineObj = machines.find((m) => m.id === selectedMachine) || machines[0];

    // Dynamic sensor threshold indicators
    const getTempStatus = (val) => (val >= 80 ? "Critical" : val >= 70 ? "Warning" : "Normal");
    const getVibStatus = (val) => (val >= 8 ? "Critical" : val >= 5 ? "Warning" : "Normal");
    const getCurrStatus = (val) => (val >= 12 ? "Critical" : val >= 10 ? "Warning" : "Normal");

    return (
        <div className="app">
            {/* SIDEBAR */}
            <Sidebar
                activeSection={activeSection}
                onNavigate={handleNavigation}
            />

            {/* MAIN VIEW */}
            <main className="main-content">
                {/* HEADER */}
                <Header
                    connectionStatus={connectionStatus}
                    activeMachineName={activeMachineObj.name}
                />

                {/* DASHBOARD CONTENT BODY */}
                <div id="dashboard" className="dashboard-content">

                    {/* HERO SECTION */}
                    <section className="dashboard-hero">
                        <div className="hero-background"></div>
                        <div className="hero-overlay"></div>

                        <div className="hero-content">
                            <div className="hero-main">
                                <div className="hero-badge">
                                    <Sparkles size={15} />
                                    <span>EDGE AI MONITORING SYSTEM</span>
                                </div>

                                <h1>ESA Maintenance Dashboard</h1>
                                <p>
                                    Real-time industrial sensor telemetry, AI degradation forecasting,
                                    and predictive failure detection for high-reliability machinery.
                                </p>

                                <div className="hero-stats">
                                    <div className="hero-mini-card">
                                        <div className="hero-mini-icon">
                                            <HeartPulse size={20} />
                                        </div>
                                        <div>
                                            <span>Machine Condition</span>
                                            <strong className={`status-${getStatusClass(machineStatus)}`}>
                                                {machineStatus.toUpperCase()}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="hero-mini-card">
                                        <div className="hero-mini-icon">
                                            {connectionStatus === "Connected" ? (
                                                <Wifi size={20} />
                                            ) : (
                                                <WifiOff size={20} color="#EF4444" />
                                            )}
                                        </div>
                                        <div>
                                            <span>Backend Connection</span>
                                            <strong style={{ color: connectionStatus === "Connected" ? "#22C55E" : "#EF4444" }}>
                                                {connectionStatus.toUpperCase()}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="hero-mini-card">
                                        <div className="hero-mini-icon">
                                            <Cpu size={20} />
                                        </div>
                                        <div>
                                            <span>Data Stream</span>
                                            <strong style={{ color: "#00C9A7" }}>
                                                {dataSource.toUpperCase()}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="hero-visual">
                                <div className={`hero-visual-glow glow-${getStatusClass(machineStatus)}`}>
                                    <Gauge size={95} strokeWidth={1.2} />
                                </div>
                                <div className="hero-visual-text">
                                    <span>OVERALL HEALTH</span>
                                    <strong>{health}%</strong>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* STATUS BAR */}
                    <div className="status-row">
                        <div className={`system-status ${getStatusClass(machineStatus)}`}>
                            <span className="status-dot"></span>
                            <span>System Status: {machineStatus}</span>
                        </div>

                        <div className={`connection-status ${getStatusClass(connectionStatus)}`}>
                            <span className="status-dot"></span>
                            <span>Backend: {connectionStatus}</span>
                        </div>

                        <div className="last-updated">
                            Last Telemetry Sync: {lastUpdated}
                        </div>
                    </div>

                    {/* MACHINE OVERVIEW / MANAGEMENT */}
                    <section id="machines" className="dashboard-section">
                        <div className="section-header">
                            <div>
                                <div className="section-kicker">FLEET ASSETS</div>
                                <h2>Machine Overview & Selection</h2>
                                <p>Select monitored industrial machinery to inspect active telemetry and status.</p>
                            </div>
                        </div>

                        <div className="machine-management-card">
                            <div className="machine-management-header">
                                <div>
                                    <div className="section-kicker">MONITORED ASSET</div>
                                    <h3>{activeMachineObj.name}</h3>
                                    <p>Select asset to dynamically load sensor streams and AI diagnostics.</p>
                                </div>

                                <select
                                    className="machine-selector"
                                    value={selectedMachine}
                                    onChange={(e) => setSelectedMachine(e.target.value)}
                                    aria-label="Select Machine"
                                >
                                    {machines.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.id} - {m.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="machine-information">
                                <div className="machine-info-item">
                                    <span>Machine ID</span>
                                    <strong>{activeMachineObj.id}</strong>
                                </div>
                                <div className="machine-info-item">
                                    <span>Asset Type</span>
                                    <strong>{activeMachineObj.type}</strong>
                                </div>
                                <div className="machine-info-item">
                                    <span>Plant Location</span>
                                    <strong>{activeMachineObj.location}</strong>
                                </div>
                                <div className="machine-info-item">
                                    <span>Operational State</span>
                                    <strong className={`machine-status-text ${getStatusClass(machineStatus)}`}>
                                        {machineStatus}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        {/* METRICS GRID */}
                        <div className="metrics-grid">
                            <MetricCard
                                title="Temperature"
                                value={temperature}
                                unit="°C"
                                icon={<Thermometer size={28} />}
                                status={getTempStatus(temperature)}
                                thresholdInfo="Warn >= 70 | Crit >= 80"
                            />

                            <MetricCard
                                title="Vibration"
                                value={vibration}
                                unit="mm/s"
                                icon={<Activity size={28} />}
                                status={getVibStatus(vibration)}
                                thresholdInfo="Warn >= 5.0 | Crit >= 8.0"
                            />

                            <MetricCard
                                title="Current"
                                value={current}
                                unit="A"
                                icon={<Zap size={28} />}
                                status={getCurrStatus(current)}
                                thresholdInfo="Warn >= 10.0 | Crit >= 12.0"
                            />

                            <MetricCard
                                title="Machine Health"
                                value={health}
                                unit="%"
                                icon={<HeartPulse size={28} />}
                                status={machineStatus}
                                thresholdInfo="Norm: 80-100 | Warn: 60-79"
                            />
                        </div>
                    </section>

                    {/* LIVE SENSOR MONITORING */}
                    <section id="sensors" className="dashboard-section">
                        <div className="section-header">
                            <div>
                                <div className="section-kicker">CONTINUOUS TELEMETRY</div>
                                <h2>Live Sensor Monitoring & History</h2>
                                <p>Dynamic time-series telemetry visualization across physical parameters.</p>
                            </div>

                            <div className="section-live-status">
                                <span className="status-dot"></span>
                                LIVE
                            </div>
                        </div>

                        <div className="sensor-chart-panel">
                            <SensorChart data={sensorHistory} />
                        </div>

                        <div className="trend-placeholder">
                            <div className="trend-line">
                                <div>
                                    <span>Temperature Stream</span>
                                    <small>Thermal RTD / Thermocouple</small>
                                </div>
                                <strong style={{ color: getTempStatus(temperature) === "Critical" ? "#EF4444" : getTempStatus(temperature) === "Warning" ? "#F59E0B" : "#F1F5F9" }}>
                                    {temperature} °C
                                </strong>
                            </div>

                            <div className="trend-line">
                                <div>
                                    <span>Vibration Stream</span>
                                    <small>Triaxial Accelerometer (Velocity RMS)</small>
                                </div>
                                <strong style={{ color: getVibStatus(vibration) === "Critical" ? "#EF4444" : getVibStatus(vibration) === "Warning" ? "#F59E0B" : "#F1F5F9" }}>
                                    {vibration} mm/s
                                </strong>
                            </div>

                            <div className="trend-line">
                                <div>
                                    <span>Electrical Load</span>
                                    <small>Current Transformer (RMS Current)</small>
                                </div>
                                <strong style={{ color: getCurrStatus(current) === "Critical" ? "#EF4444" : getCurrStatus(current) === "Warning" ? "#F59E0B" : "#F1F5F9" }}>
                                    {current} A
                                </strong>
                            </div>
                        </div>
                    </section>

                    {/* FAULT DETECTION SECTION */}
                    <FaultDetection
                        machineStatus={machineStatus}
                        faultMessage={faultMessage}
                        faultExplanation={faultExplanation}
                        recommendedAction={recommendedAction}
                        warnings={warnings}
                        faults={faults}
                    />

                    {/* AI PREDICTION SECTION */}
                    <AIPrediction
                        aiPrediction={aiPrediction}
                    />

                    {/* MAINTENANCE ASSISTANT SECTION */}
                    <Chatbot
                        messages={chatMessages}
                        onSendMessage={handleSendMessage}
                        isLoading={isChatLoading}
                        activeMachineId={selectedMachine}
                    />

                    {/* SETTINGS SECTION */}
                    <SettingsSection
                        activeMachineId={selectedMachine}
                        onFaultSimulate={handleFaultSimulate}
                        currentSimulationMode={simulationMode}
                    />

                </div>
            </main>
        </div>
    );
}

export default App;