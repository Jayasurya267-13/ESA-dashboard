import {
    Thermometer,
    Activity,
    Zap,
    HeartPulse
} from "lucide-react";

import "./App.css";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MetricCard from "./components/MetricCard";

function App() {

    return (
        <div className="app">

            <Sidebar />

            <main className="main-content">

                <Header />

                <section className="dashboard-content">

                    <div className="section-title">
                        <div>
                            <h2>Machine Overview</h2>
                            <p>Real-time machine condition monitoring</p>
                        </div>

                        <div className="machine-selector">
                            Machine 01
                        </div>
                    </div>

                    <div className="metrics-grid">

                        <MetricCard
                            title="Temperature"
                            value="68.4"
                            unit="°C"
                            icon={<Thermometer size={26} />}
                            status="Normal"
                        />

                        <MetricCard
                            title="Vibration"
                            value="3.21"
                            unit="mm/s"
                            icon={<Activity size={26} />}
                            status="Normal"
                        />

                        <MetricCard
                            title="Current"
                            value="2.13"
                            unit="A"
                            icon={<Zap size={26} />}
                            status="Normal"
                        />

                        <MetricCard
                            title="Machine Health"
                            value="91"
                            unit="%"
                            icon={<HeartPulse size={26} />}
                            status="Healthy"
                        />

                    </div>

                    <div className="dashboard-grid">

                        <div className="panel chart-panel">

                            <div className="panel-header">
                                <div>
                                    <h3>Sensor Trends</h3>
                                    <p>Machine parameters over time</p>
                                </div>

                                <select>
                                    <option>Last 1 Hour</option>
                                    <option>Last 6 Hours</option>
                                    <option>Last 24 Hours</option>
                                </select>
                            </div>

                            <div className="chart-placeholder">
                                <Activity size={40} />
                                <p>Sensor chart will be added soon</p>
                            </div>

                        </div>

                        <div className="panel alert-panel">

                            <div className="panel-header">
                                <div>
                                    <h3>System Status</h3>
                                    <p>Current machine condition</p>
                                </div>
                            </div>

                            <div className="health-display">

                                <div className="health-circle">
                                    91%
                                </div>

                                <h3>Machine Healthy</h3>

                                <p>
                                    No critical faults detected
                                </p>

                            </div>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default App;