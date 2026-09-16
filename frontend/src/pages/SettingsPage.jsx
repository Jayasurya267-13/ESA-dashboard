import { useState, useEffect } from "react";
import {
    Settings,
    Cpu,
    Radio,
    Shield,
    Sliders,
    Bell,
    CheckCircle2,
    RotateCcw,
    Sparkles,
    Activity,
    Thermometer,
    Zap
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

const DEFAULT_MACHINES = [
    { id: "MTR-001", name: "Motor Pump 01" },
    { id: "MTR-002", name: "Motor Pump 02" },
    { id: "MTR-003", name: "Cooling Fan 01" },
    { id: "CNC-001", name: "CNC Milling Machine 01" },
    { id: "CNC-002", name: "CNC Turning Machine 01" },
    { id: "CNC-003", name: "CNC Vertical Machining Center 01" },
    { id: "CNC-004", name: "CNC Lathe Machine 01" },
    { id: "CNC-005", name: "CNC Milling Machine 02" }
];

export default function SettingsPage() {
    const [selectedMachine, setSelectedMachine] = useState("MTR-001");
    const [simMode, setSimMode] = useState("normal");
    const [simSuccess, setSimSuccess] = useState("");
    const [simLoading, setSimLoading] = useState(false);

    // Notification toggles
    const [audioAlarms, setAudioAlarms] = useState(true);
    const [criticalBanners, setCriticalBanners] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(false);

    const handleSimulate = async (mode) => {
        setSimLoading(true);
        setSimSuccess("");
        try {
            const res = await fetch(`${API_BASE_URL}/api/machines/${selectedMachine}/simulate-fault`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode })
            });
            if (res.ok) {
                setSimMode(mode);
                setSimSuccess(`Simulation mode for ${selectedMachine} successfully updated to "${mode}"`);
                setTimeout(() => setSimSuccess(""), 4000);
            }
        } catch (err) {
            console.error("Simulation mode error:", err);
        } finally {
            setSimLoading(false);
        }
    };

    return (
        <div className="dashboard-content settings-page">
            {/* PAGE HEADER */}
            <div className="fleet-header-block">
                <div>
                    <div className="section-kicker">
                        <Settings size={13} /> SYSTEM CONFIGURATION
                    </div>
                    <h1>Platform &amp; Hardware Settings</h1>
                    <p>
                        Engineering threshold matrix, hardware gateway ingestion specifications, demo fault injector, and notification protocols.
                    </p>
                </div>
            </div>

            {/* GRID OF CONFIGURATION SECTIONS */}
            <div className="settings-grid">
                {/* 1. SENSOR THRESHOLD MATRIX */}
                <div className="dashboard-section settings-card">
                    <div className="section-header">
                        <div>
                            <div className="section-kicker">
                                <Sliders size={13} /> ENGINEERING CRITERIA
                            </div>
                            <h3>Sensor Safety Threshold Matrix</h3>
                            <p>Global limits adhering to ISO 10816-3 mechanical vibration and NEMA thermal standards.</p>
                        </div>
                    </div>

                    <div className="threshold-items-list">
                        <div className="threshold-item">
                            <div className="threshold-item-title">
                                <Thermometer size={16} color="#F59E0B" />
                                <div>
                                    <strong>Surface &amp; Bearing Temperature</strong>
                                    <small>RTD PT100 / Thermocouple (°C)</small>
                                </div>
                            </div>
                            <div className="threshold-bands">
                                <span className="tb-normal">Normal: &lt; 70 °C</span>
                                <span className="tb-warning">Warning: 70 - 79 °C</span>
                                <span className="tb-critical">Critical: &ge; 80 °C</span>
                            </div>
                        </div>

                        <div className="threshold-item">
                            <div className="threshold-item-title">
                                <Activity size={16} color="#8B5CF6" />
                                <div>
                                    <strong>Vibration Velocity RMS</strong>
                                    <small>Triaxial Accelerometer (mm/s)</small>
                                </div>
                            </div>
                            <div className="threshold-bands">
                                <span className="tb-normal">Normal: &lt; 5.0 mm/s</span>
                                <span className="tb-warning">Warning: 5.0 - 7.9 mm/s</span>
                                <span className="tb-critical">Critical: &ge; 8.0 mm/s</span>
                            </div>
                        </div>

                        <div className="threshold-item">
                            <div className="threshold-item-title">
                                <Zap size={16} color="#00E5BF" />
                                <div>
                                    <strong>Motor Stator Current</strong>
                                    <small>Hall Effect / Current Transformer (A)</small>
                                </div>
                            </div>
                            <div className="threshold-bands">
                                <span className="tb-normal">Normal: &lt; 10.0 A</span>
                                <span className="tb-warning">Warning: 10.0 - 11.9 A</span>
                                <span className="tb-critical">Critical: &ge; 12.0 A</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. DEMO FAULT INJECTION SIMULATOR */}
                <div className="dashboard-section settings-card">
                    <div className="section-header">
                        <div>
                            <div className="section-kicker">
                                <RotateCcw size={13} /> DEMO STRESS TESTING
                            </div>
                            <h3>Fault Simulation Controller</h3>
                            <p>Inject simulated anomalies across machinery for demonstration and verification.</p>
                        </div>
                    </div>

                    <div className="sim-target-row">
                        <label>Select Target Machine Asset:</label>
                        <select
                            value={selectedMachine}
                            onChange={(e) => setSelectedMachine(e.target.value)}
                            className="machine-selector"
                            style={{ maxWidth: "260px" }}
                        >
                            {DEFAULT_MACHINES.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.id} — {m.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {simSuccess && (
                        <div className="sim-alert-banner">
                            <CheckCircle2 size={15} />
                            <span>{simSuccess}</span>
                        </div>
                    )}

                    <div className="detail-sim-buttons" style={{ marginTop: "14px" }}>
                        <button
                            type="button"
                            className="sim-btn sim-btn-normal"
                            onClick={() => handleSimulate("normal")}
                            disabled={simLoading}
                        >
                            ✓ Reset Normal
                        </button>
                        <button
                            type="button"
                            className="sim-btn sim-btn-warn"
                            onClick={() => handleSimulate("high_temperature")}
                            disabled={simLoading}
                        >
                            🔥 Overheat (82°C)
                        </button>
                        <button
                            type="button"
                            className="sim-btn sim-btn-warn"
                            onClick={() => handleSimulate("excessive_vibration")}
                            disabled={simLoading}
                        >
                            〰️ High Vibration (8.8 mm/s)
                        </button>
                        <button
                            type="button"
                            className="sim-btn sim-btn-warn"
                            onClick={() => handleSimulate("over_current")}
                            disabled={simLoading}
                        >
                            ⚡ Over-Current (12.6 A)
                        </button>
                        <button
                            type="button"
                            className="sim-btn sim-btn-crit"
                            onClick={() => handleSimulate("multiple")}
                            disabled={simLoading}
                        >
                            ⚠️ Multiple Overload
                        </button>
                    </div>
                </div>

                {/* 3. HARDWARE EDGE GATEWAY SPECS */}
                <div className="dashboard-section settings-card">
                    <div className="section-header">
                        <div>
                            <div className="section-kicker">
                                <Radio size={13} /> EDGE COMPUTING &amp; IOT
                            </div>
                            <h3>Hardware Ingestion Gateway</h3>
                            <p>Edge IoT telemetry ingest parameters for ESP32 and edge microcontrollers.</p>
                        </div>
                    </div>

                    <div className="gateway-specs-box">
                        <div className="gateway-spec-item">
                            <span>Ingestion REST Endpoint:</span>
                            <code>POST http://127.0.0.1:8000/api/telemetry</code>
                        </div>
                        <div className="gateway-spec-item">
                            <span>MQTT Broker Gateway:</span>
                            <code>broker.hivemq.com:1883 • topic: esa/telemetry</code>
                        </div>
                        <div className="gateway-spec-item">
                            <span>Edge Payload Format:</span>
                            <pre className="gateway-payload-code">
{`{
  "machine_id": "CNC-001",
  "temperature": 68.4,
  "vibration": 3.2,
  "current": 5.8
}`}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* 4. NOTIFICATION & AUDIO PREFERENCES */}
                <div className="dashboard-section settings-card">
                    <div className="section-header">
                        <div>
                            <div className="section-kicker">
                                <Bell size={13} /> OPERATOR PREFERENCES
                            </div>
                            <h3>Alarm &amp; Alert Preferences</h3>
                            <p>Customize dispatch triggers and audio alarm indications on the plant floor.</p>
                        </div>
                    </div>

                    <div className="preferences-list">
                        <label className="pref-toggle-row">
                            <div>
                                <strong>Audible Floor Warning Klaxon</strong>
                                <small>Sound siren beep on Critical severity alarms</small>
                            </div>
                            <input
                                type="checkbox"
                                checked={audioAlarms}
                                onChange={(e) => setAudioAlarms(e.target.checked)}
                            />
                        </label>

                        <label className="pref-toggle-row">
                            <div>
                                <strong>High-Priority Top Banners</strong>
                                <small>Display persistent warning ribbon for active faults</small>
                            </div>
                            <input
                                type="checkbox"
                                checked={criticalBanners}
                                onChange={(e) => setCriticalBanners(e.target.checked)}
                            />
                        </label>

                        <label className="pref-toggle-row">
                            <div>
                                <strong>Daily Maintenance Shift Digest</strong>
                                <small>Dispatch daily email summary to reliability engineering team</small>
                            </div>
                            <input
                                type="checkbox"
                                checked={emailAlerts}
                                onChange={(e) => setEmailAlerts(e.target.checked)}
                            />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
