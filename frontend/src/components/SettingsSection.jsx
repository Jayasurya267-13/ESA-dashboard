import { useState } from "react";
import { Settings, Sliders, Cpu, Activity, Check } from "lucide-react";

function SettingsSection({
    activeMachineId,
    onFaultSimulate,
    currentSimulationMode = "normal"
}) {
    const [simLoading, setSimLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");

    const handleFaultSelect = async (mode) => {
        setSimLoading(true);
        setStatusMsg("");
        try {
            await onFaultSimulate(mode);
            setStatusMsg(`Simulated mode active: ${mode.replace(/_/g, " ")}`);
            setTimeout(() => setStatusMsg(""), 4000);
        } catch (e) {
            setStatusMsg("Error updating simulation mode");
        } finally {
            setSimLoading(false);
        }
    };

    const thresholds = [
        { parameter: "Temperature", unit: "°C", normal: "< 70.0", warning: "70.0 – 79.9", critical: ">= 80.0" },
        { parameter: "Vibration", unit: "mm/s", normal: "< 5.0", warning: "5.0 – 7.99", critical: ">= 8.0" },
        { parameter: "Current", unit: "A", normal: "< 10.0", warning: "10.0 – 11.99", critical: ">= 12.0" }
    ];

    return (
        <section id="settings" className="dashboard-section">
            <div className="section-header">
                <div>
                    <div className="section-kicker">
                        <Settings size={13} /> CONFIGURATION & HARDWARE
                    </div>
                    <h2>System Settings & Edge AI Gateway</h2>
                    <p>Sensor threshold parameters, physical hardware ingestion gateway, and live demo fault injection controls.</p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
                {/* CARD 1: CENTRALIZED THRESHOLDS */}
                <div className="panel" style={{ padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                        <Sliders size={20} color="#00E5BF" />
                        <h3 style={{ margin: 0, fontSize: "16px", color: "#F8FAFC" }}>Standard Sensor Thresholds</h3>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(0, 229, 191, 0.2)", color: "#94A3B8" }}>
                                    <th style={{ padding: "8px" }}>Parameter</th>
                                    <th style={{ padding: "8px" }}>Normal</th>
                                    <th style={{ padding: "8px", color: "#F59E0B" }}>Warning</th>
                                    <th style={{ padding: "8px", color: "#EF4444" }}>Critical</th>
                                </tr>
                            </thead>
                            <tbody>
                                {thresholds.map((t, i) => (
                                    <tr key={i} style={{ borderBottom: "1px solid rgba(148, 163, 184, 0.08)" }}>
                                        <td style={{ padding: "10px 8px", fontWeight: "600", color: "#F8FAFC" }}>
                                            {t.parameter} ({t.unit})
                                        </td>
                                        <td style={{ padding: "10px 8px", color: "#10B981" }}>{t.normal}</td>
                                        <td style={{ padding: "10px 8px", color: "#F59E0B" }}>{t.warning}</td>
                                        <td style={{ padding: "10px 8px", color: "#EF4444" }}>{t.critical}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* CARD 2: FAULT SIMULATION / DEMO MODE */}
                <div className="panel" style={{ padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <Activity size={20} color="#8B5CF6" />
                        <h3 style={{ margin: 0, fontSize: "16px", color: "#F8FAFC" }}>
                            Interactive Demo & Fault Injection ({activeMachineId})
                        </h3>
                    </div>
                    <p style={{ fontSize: "12px", color: "#94A3B8", margin: "0 0 16px" }}>
                        Test and showcase how the dashboard, diagnostics engine, and AI assistant react to real-time anomalies.
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                        {[
                            { mode: "normal", label: "Normal Operation", color: "#00E5BF" },
                            { mode: "high_temperature", label: "Simulate High Temp", color: "#EF4444" },
                            { mode: "excessive_vibration", label: "Simulate Critical Vib", color: "#8B5CF6" },
                            { mode: "over_current", label: "Simulate Overcurrent", color: "#F59E0B" },
                            { mode: "multiple", label: "Simulate Multi-Fault", color: "#EF4444" }
                        ].map((btn) => (
                            <button
                                key={btn.mode}
                                onClick={() => handleFaultSelect(btn.mode)}
                                disabled={simLoading}
                                style={{
                                    background: currentSimulationMode === btn.mode ? "rgba(0, 229, 191, 0.16)" : "#16222E",
                                    color: currentSimulationMode === btn.mode ? "#00E5BF" : "#E2E8F0",
                                    border: `1px solid ${currentSimulationMode === btn.mode ? "#00E5BF" : "rgba(148, 163, 184, 0.15)"}`,
                                    borderRadius: "8px",
                                    padding: "8px 12px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "all 0.15s ease"
                                }}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    {statusMsg && (
                        <div style={{ marginTop: "12px", fontSize: "12px", color: "#00E5BF", display: "flex", alignItems: "center", gap: "6px" }}>
                            <Check size={14} /> {statusMsg}
                        </div>
                    )}
                </div>

                {/* CARD 3: HARDWARE INTEGRATION GATEWAY */}
                <div className="panel" style={{ padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                        <Cpu size={20} color="#00E5BF" />
                        <h3 style={{ margin: 0, fontSize: "16px", color: "#F8FAFC" }}>Physical Hardware Gateway</h3>
                    </div>
                    <p style={{ fontSize: "12px", color: "#94A3B8", margin: "0 0 12px", lineHeight: 1.5 }}>
                        Connect physical sensors (DS18B20 / RTD, MPU6050, SCT-013 CT) via ESP32, Raspberry Pi, or edge gateway.
                    </p>

                    <div style={{
                        background: "#0E1620",
                        border: "1px solid rgba(0, 229, 191, 0.22)",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        fontSize: "11px",
                        fontFamily: "monospace",
                        color: "#00E5BF",
                        wordBreak: "break-all"
                    }}>
                        POST http://127.0.0.1:8000/api/telemetry
                    </div>

                    <div style={{ marginTop: "10px", fontSize: "11px", color: "#64748B" }}>
                        Payload: {"{"} "machine_id": "{activeMachineId}", "temperature": 68.5, "vibration": 2.4, "current": 6.2 {"}"}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default SettingsSection;
