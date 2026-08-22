import { useEffect, useState } from "react";

import {
    Thermometer,
    Activity,
    Zap,
    HeartPulse,
    AlertTriangle
} from "lucide-react";

import "./App.css";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MetricCard from "./components/MetricCard";
import SensorChart from "./components/SensorChart";

function App() {

    const [temperature, setTemperature] = useState(68.4);
    const [vibration, setVibration] = useState(3.21);
    const [current, setCurrent] = useState(2.13);
    const [health, setHealth] = useState(91);
    const [sensorHistory, setSensorHistory] = useState([]);
    const [aiPrediction, setAiPrediction] = useState({
        health: 0,
        status: "Loading..."
    });

    const [connectionStatus, setConnectionStatus] = useState("Connected");
    const [lastUpdated, setLastUpdated] = useState("--");

    const [machineStatus, setMachineStatus] = useState("Normal");
    const [faultMessage, setFaultMessage] = useState("No fault detected");

    useEffect(() => {

    const fetchSensorData = async () => {

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/api/sensor-data"
            );

            if (!response.ok) {
                throw new Error("Backend request failed");
            }

            const data = await response.json();

            setConnectionStatus("Connected");

            setLastUpdated(
                new Date(data.timestamp).toLocaleTimeString()
            );

            setTemperature(data.temperature);
            setVibration(data.vibration);
            setCurrent(data.current);
            setHealth(data.health);

            const predictionResponse = await fetch(
                "http://127.0.0.1:8000/api/ai-prediction"
            );

            const predictionData = await predictionResponse.json();

            setAiPrediction({
                health: predictionData.health,
                status: predictionData.status
            });

            setMachineStatus(data.status);
            setFaultMessage(data.fault);
            const aiResponse = await fetch(
                "http://127.0.0.1:8000/api/ai-prediction"
            );

            if (aiResponse.ok) {
                const aiData = await aiResponse.json();

                setAiPrediction({
                    health: aiData.health,
                    status: aiData.status
                });
            }

            setSensorHistory((previous) => {

                const newReading = {
                    time: new Date(data.timestamp).toLocaleTimeString(),
                    temperature: data.temperature,
                    vibration: data.vibration,
                    current: data.current
                };

                const updated = [...previous, newReading];

                return updated.slice(-20);
            });

        } catch (error) {

            console.error(
                "Unable to connect to backend:",
                error
            );

            setConnectionStatus("Disconnected");

        }
    };


    fetchSensorData();

    const interval = setInterval(
        fetchSensorData,
        3000
    );


    return () => clearInterval(interval);

}, []);

    return (
        <div className="app">

            <Sidebar />

            <main className="main-content">

                <Header connectionStatus={connectionStatus} />

                <div className="dashboard-content">

                    <div className="page-heading">
                        <div>
                            <h1>Machine Monitoring Dashboard</h1>
                            <p>Real-time predictive maintenance monitoring</p>
                        </div>

                        <div className={`system-status ${machineStatus.toLowerCase()}`}>
                            <span className="status-dot"></span>
                            {machineStatus}
                        </div>
                        <div className={`connection-status ${connectionStatus.toLowerCase()}`}>
                            <span className="status-dot"></span>
                            Backend: {connectionStatus}
                        </div>
                        <div className="last-updated">
                            Last updated: {lastUpdated}
                        </div>
                    </div>


                    <section className="dashboard-section">

                        <div className="section-header">
                            <div>
                                <h2>Machine Overview</h2>
                                <p>Live simulated sensor readings</p>
                            </div>
                        </div>


                        <div className="metrics-grid">

                            <MetricCard
                                title="Temperature"
                                value={temperature}
                                unit="°C"
                                icon={<Thermometer size={28} />}
                                status={
                                    temperature > 72
                                        ? "High"
                                        : "Normal"
                                }
                            />

                            <MetricCard
                                title="Vibration"
                                value={vibration}
                                unit="mm/s"
                                icon={<Activity size={28} />}
                                status={
                                    vibration > 3.5
                                        ? "High"
                                        : "Normal"
                                }
                            />

                            <MetricCard
                                title="Current"
                                value={current}
                                unit="A"
                                icon={<Zap size={28} />}
                                status={
                                    current > 2.4
                                        ? "High"
                                        : "Normal"
                                }
                            />

                            <MetricCard
                                title="Machine Health"
                                value={health}
                                unit="%"
                                icon={<HeartPulse size={28} />}
                                status={machineStatus}
                            />

                        </div>

                    </section>


                    <section className="dashboard-section">

                        <div className="section-header">
                            <div>
                                <h2>Fault Detection</h2>
                                <p>Current machine condition</p>
                            </div>
                        </div>

                        <div className="fault-panel">

                            <div className="fault-icon">
                                <AlertTriangle size={30} />
                            </div>

                            <div className="fault-info">
                                <h3>{faultMessage}</h3>
                                <p>
                                    Monitoring temperature, vibration and
                                    current continuously.
                                </p>
                            </div>

                            <div className={`fault-status ${machineStatus.toLowerCase()}`}>
                                {machineStatus}
                            </div>

                        </div>

                    </section>


                    <section className="dashboard-section">

                        <div className="section-header">
                            <div>
                                <h2>Sensor Trends</h2>
                                <p>Live monitoring simulation</p>
                            </div>
                        </div>
                        
                        
                        <SensorChart data={sensorHistory} />

                        <div className="trend-placeholder">

                            <div className="trend-line">
                                <span>Temperature</span>
                                <strong>{temperature} °C</strong>
                            </div>

                            <div className="trend-line">
                                <span>Vibration</span>
                                <strong>{vibration} mm/s</strong>
                            </div>

                            <div className="trend-line">
                                <span>Current</span>
                                <strong>{current} A</strong>
                            </div>

                        </div>

                    </section>

                    <section className="dashboard-section">
                        <div className="section-header">
                            <div>
                                <h2>AI Prediction</h2>
                                <p>Machine health prediction</p>
                            </div>
                        </div>

                        <div className="ai-prediction-card">

                            <div>
                                <h3>Predicted Machine Health</h3>

                                <div className="ai-health-value">
                                    {aiPrediction.health}%
                                </div>

                                <p>
                                    Prediction Status:
                                    <strong> {aiPrediction.status}</strong>
                                </p>
                            </div>

                            <div className="ai-prediction-message">

                                {aiPrediction.status === "Healthy" && (
                                    <p>
                                        Machine condition is currently healthy.
                                    </p>
                                )}

                                {aiPrediction.status === "Warning" && (
                                    <p>
                                        Machine requires attention. Monitor sensor conditions.
                                    </p>
                                )}

                                {aiPrediction.status === "Critical" && (
                                    <p>
                                        Critical condition detected. Maintenance is recommended.
                                    </p>
                                )}

                            </div>

                        </div>

                    </section>

                </div>

            </main>

        </div>
    );
}

export default App;