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

function App() {

    const [temperature, setTemperature] = useState(68.4);
    const [vibration, setVibration] = useState(3.21);
    const [current, setCurrent] = useState(2.13);
    const [health, setHealth] = useState(91);

    const [machineStatus, setMachineStatus] = useState("Normal");
    const [faultMessage, setFaultMessage] = useState("No fault detected");

    useEffect(() => {

        const interval = setInterval(() => {

            const newTemperature =
                Number((65 + Math.random() * 10).toFixed(1));

            const newVibration =
                Number((2.5 + Math.random() * 1.5).toFixed(2));

            const newCurrent =
                Number((1.8 + Math.random() * 0.8).toFixed(2));

            let newHealth = 100;

            if (newTemperature > 72) {
                newHealth -= 20;
            }

            if (newVibration > 3.5) {
                newHealth -= 20;
            }

            if (newCurrent > 2.4) {
                newHealth -= 15;
            }

            newHealth = Math.max(40, newHealth);

            setTemperature(newTemperature);
            setVibration(newVibration);
            setCurrent(newCurrent);
            setHealth(newHealth);

            if (newHealth >= 80) {
                setMachineStatus("Normal");
                setFaultMessage("No fault detected");
            } else if (newHealth >= 60) {
                setMachineStatus("Warning");
                setFaultMessage("Abnormal sensor condition");
            } else {
                setMachineStatus("Critical");
                setFaultMessage("Possible machine fault");
            }

        }, 3000);

        return () => clearInterval(interval);

    }, []);

    return (
        <div className="app">

            <Sidebar />

            <main className="main-content">

                <Header />

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

                </div>

            </main>

        </div>
    );
}

export default App;