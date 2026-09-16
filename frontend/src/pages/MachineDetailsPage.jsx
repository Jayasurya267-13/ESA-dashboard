import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Cpu,
    Thermometer,
    Activity,
    Zap,
    HeartPulse,
    Gauge,
    Layers,
    AlertTriangle,
    AlertOctagon,
    CheckCircle2,
    Calendar,
    Clock,
    Wrench,
    Shield,
    Sparkles,
    Send,
    RotateCcw
} from "lucide-react";

import MetricCard from "../components/MetricCard";
import SensorChart from "../components/SensorChart";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function MachineDetailsPage() {
    const { machineId } = useParams();
    const navigate = useNavigate();

    const [machine, setMachine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [simulating, setSimulating] = useState(false);

    // AI Query State for this machine
    const [queryText, setQueryText] = useState("");
    const [queryResponse, setQueryResponse] = useState(null);
    const [queryLoading, setQueryLoading] = useState(false);

    const fetchMachineDetail = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/machines/${machineId}`);
            if (!res.ok) {
                throw new Error(`Failed to load machine ${machineId}: ${res.status}`);
            }
            const data = await res.json();
            setMachine(data);
            if (data.history && data.history.length > 0) {
                setHistory(data.history);
            }
            setError(null);
        } catch (err) {
            console.error("Machine detail fetch error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [machineId]);

    useEffect(() => {
        fetchMachineDetail();
        const interval = setInterval(fetchMachineDetail, 3000);
        return () => clearInterval(interval);
    }, [fetchMachineDetail]);

    const handleFaultSimulate = async (mode) => {
        setSimulating(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/machines/${machineId}/simulate-fault`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode })
            });
            if (res.ok) {
                await fetchMachineDetail();
            }
        } catch (err) {
            console.error("Fault simulation failed:", err);
        } finally {
            setSimulating(false);
        }
    };

    const handleAskAI = async (e) => {
        e.preventDefault();
        if (!queryText.trim()) return;

        setQueryLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: queryText,
                    machine_id: machineId
                })
            });
            if (res.ok) {
                const data = await res.json();
                setQueryResponse(data.answer);
            }
        } catch (err) {
            setQueryResponse("Unable to obtain diagnostic response. Please ensure backend is running.");
        } finally {
            setQueryLoading(false);
        }
    };

    if (loading && !machine) {
        return (
            <div className="dashboard-content detail-loading-state">
                <Cpu size={36} className="spin-icon" color="#00E5BF" />
                <p>Loading asset telemetry stream for {machineId}...</p>
            </div>
        );
    }

    if (error && !machine) {
        return (
            <div className="dashboard-content detail-error-state">
                <AlertOctagon size={42} color="#EF4444" />
                <h2>Asset Diagnostic Stream Unavailable</h2>
                <p>{error}</p>
                <Link to="/machines" className="btn-secondary">
                    <ArrowLeft size={16} /> Return to Fleet Catalog
                </Link>
            </div>
        );
    }

    const isCnc = machine?.is_cnc;
    const cncMetrics = machine?.cnc_metrics || {};
    const status = machine?.status || "Normal";
    const statusClass = status.toLowerCase();
    const health = machine?.health || 100;
    const aiPred = machine?.ai_prediction || {};

    const getTempStatus = (val) => (val >= 80 ? "Critical" : val >= 70 ? "Warning" : "Normal");
    const getVibStatus = (val) => (val >= 8 ? "Critical" : val >= 5 ? "Warning" : "Normal");
    const getCurrStatus = (val) => (val >= 12 ? "Critical" : val >= 10 ? "Warning" : "Normal");

    return (
        <div className="dashboard-content machine-detail-page">
            {/* TOP NAVIGATION & ASSET HEADER */}
            <div className="detail-top-nav">
                <Link to="/machines" className="back-link">
                    <ArrowLeft size={15} />
                    <span>Back to Machinery Fleet</span>
                </Link>

                <div className="detail-source-tag">
                    <span>Data Stream: </span>
                    <strong style={{ color: "#00E5BF" }}>{machine?.source?.toUpperCase() || "SIMULATED"}</strong>
                </div>
            </div>

            {/* ASSET BANNER */}
            <div className="detail-hero-banner">
                <div className="detail-banner-main">
                    <div className="detail-banner-tags">
                        <span className={`detail-category-badge ${isCnc ? "badge-cnc" : "badge-motor"}`}>
                            {isCnc ? "CNC MACHINING CENTER" : "MOTOR / PUMP ASSET"}
                        </span>
                        <span className="detail-id-chip">{machine.machine_id}</span>
                        <span className="detail-mfg-chip">{machine.manufacturer} • {machine.model}</span>
                    </div>

                    <h1>{machine.name}</h1>
                    <p className="detail-location-sub">
                        Installed at <strong>{machine.location}</strong> | Production Line: <strong>{machine.production_line}</strong>
                    </p>
                </div>

                <div className="detail-banner-status">
                    <div className={`detail-status-pill status-${statusClass}`}>
                        {status === "Critical" ? (
                            <AlertOctagon size={18} />
                        ) : status === "Warning" ? (
                            <AlertTriangle size={18} />
                        ) : (
                            <CheckCircle2 size={18} />
                        )}
                        <span>{status.toUpperCase()}</span>
                    </div>

                    <div className="detail-health-box">
                        <span className="dhb-label">OPERATIONAL HEALTH</span>
                        <strong className="dhb-value" style={{ color: health >= 80 ? "#10B981" : health >= 60 ? "#F59E0B" : "#EF4444" }}>
                            {health}%
                        </strong>
                    </div>
                </div>
            </div>

            {/* SECTION 1: CORE TELEMETRY METRIC CARDS */}
            <div className="metrics-grid">
                <MetricCard
                    title="Temperature"
                    value={machine.temperature}
                    unit="°C"
                    icon={<Thermometer size={26} />}
                    status={getTempStatus(machine.temperature)}
                    thresholdInfo="Warn >= 70 | Crit >= 80"
                />

                <MetricCard
                    title="Vibration"
                    value={machine.vibration}
                    unit="mm/s"
                    icon={<Activity size={26} />}
                    status={getVibStatus(machine.vibration)}
                    thresholdInfo="Warn >= 5.0 | Crit >= 8.0"
                />

                <MetricCard
                    title="Current"
                    value={machine.current}
                    unit="A"
                    icon={<Zap size={26} />}
                    status={getCurrStatus(machine.current)}
                    thresholdInfo="Warn >= 10.0 | Crit >= 12.0"
                />

                <MetricCard
                    title="System Health"
                    value={health}
                    unit="%"
                    icon={<HeartPulse size={26} />}
                    status={status}
                    thresholdInfo="Norm: 80-100 | Warn: 60-79"
                />
            </div>

            {/* SECTION 2: CNC-SPECIFIC ADVANCED TELEMETRY (IF CNC) */}
            {isCnc && (
                <section className="dashboard-section cnc-diagnostics-section">
                    <div className="section-header">
                        <div>
                            <div className="section-kicker">
                                <Cpu size={13} /> CNC TELEMETRY & SPINDLE SUBSYSTEM
                            </div>
                            <h2>CNC Subsystem Diagnostics & Tool Wear</h2>
                            <p>Direct controller metrics for spindle kinematics, cutting tool degradation, and flood coolant.</p>
                        </div>
                    </div>

                    <div className="cnc-gauges-grid">
                        {/* SPINDLE SPEED */}
                        <div className="cnc-gauge-card">
                            <div className="cnc-gauge-header">
                                <span>Spindle Speed</span>
                                <small>Max 8,000 RPM</small>
                            </div>
                            <div className="cnc-gauge-main">
                                <strong className="cnc-gauge-val">{cncMetrics.spindle_speed}</strong>
                                <span className="cnc-gauge-unit">RPM</span>
                            </div>
                            <div className="cnc-progress-track">
                                <div
                                    className="cnc-progress-fill fill-teal"
                                    style={{ width: `${Math.min(100, (cncMetrics.spindle_speed / 8000) * 100)}%` }}
                                />
                            </div>
                            <span className="cnc-gauge-footer">Drive Motor Frequency Inverter: Nominal</span>
                        </div>

                        {/* SPINDLE LOAD */}
                        <div className="cnc-gauge-card">
                            <div className="cnc-gauge-header">
                                <span>Spindle Motor Load</span>
                                <small>Torque Capacity</small>
                            </div>
                            <div className="cnc-gauge-main">
                                <strong
                                    className="cnc-gauge-val"
                                    style={{ color: cncMetrics.spindle_load >= 80 ? "#EF4444" : cncMetrics.spindle_load >= 65 ? "#F59E0B" : "#F8FAFC" }}
                                >
                                    {cncMetrics.spindle_load}
                                </strong>
                                <span className="cnc-gauge-unit">%</span>
                            </div>
                            <div className="cnc-progress-track">
                                <div
                                    className="cnc-progress-fill"
                                    style={{
                                        width: `${cncMetrics.spindle_load}%`,
                                        background: cncMetrics.spindle_load >= 80 ? "#EF4444" : cncMetrics.spindle_load >= 65 ? "#F59E0B" : "#00E5BF"
                                    }}
                                />
                            </div>
                            <span className="cnc-gauge-footer">Threshold: Warn &gt; 70% | Crit &gt; 85%</span>
                        </div>

                        {/* TOOL WEAR */}
                        <div className="cnc-gauge-card">
                            <div className="cnc-gauge-header">
                                <span>Cutting Tool Wear</span>
                                <small>Carbide / Ceramic Flute</small>
                            </div>
                            <div className="cnc-gauge-main">
                                <strong
                                    className="cnc-gauge-val"
                                    style={{ color: cncMetrics.tool_wear >= 70 ? "#EF4444" : cncMetrics.tool_wear >= 50 ? "#F59E0B" : "#10B981" }}
                                >
                                    {cncMetrics.tool_wear}
                                </strong>
                                <span className="cnc-gauge-unit">%</span>
                            </div>
                            <div className="cnc-progress-track">
                                <div
                                    className="cnc-progress-fill"
                                    style={{
                                        width: `${cncMetrics.tool_wear}%`,
                                        background: cncMetrics.tool_wear >= 70 ? "#EF4444" : cncMetrics.tool_wear >= 50 ? "#F59E0B" : "#10B981"
                                    }}
                                />
                            </div>
                            <span className="cnc-gauge-footer">
                                {cncMetrics.tool_wear >= 70
                                    ? "⚠️ Replace insert in ATC immediately"
                                    : cncMetrics.tool_wear >= 50
                                    ? "Plan tool offset swap on next cycle"
                                    : "Cutting edge geometry optimal"}
                            </span>
                        </div>

                        {/* COOLANT SYSTEM */}
                        <div className="cnc-gauge-card">
                            <div className="cnc-gauge-header">
                                <span>Coolant Delivery</span>
                                <small>Reservoir &amp; Thermal</small>
                            </div>
                            <div className="cnc-coolant-dual">
                                <div>
                                    <span className="ccd-label">Level</span>
                                    <strong className="ccd-val" style={{ color: cncMetrics.coolant_level < 35 ? "#EF4444" : "#00E5BF" }}>
                                        {cncMetrics.coolant_level}%
                                    </strong>
                                </div>
                                <div className="ccd-divider" />
                                <div>
                                    <span className="ccd-label">Temp</span>
                                    <strong className="ccd-val">{cncMetrics.coolant_temp} °C</strong>
                                </div>
                            </div>
                            <div className="cnc-progress-track">
                                <div
                                    className="cnc-progress-fill fill-teal"
                                    style={{ width: `${cncMetrics.coolant_level}%` }}
                                />
                            </div>
                            <span className="cnc-gauge-footer">Target Concentration: 6-8% Brix</span>
                        </div>
                    </div>
                </section>
            )}

            {/* SECTION 3: REAL-TIME TIME SERIES TREND */}
            <section className="dashboard-section">
                <div className="section-header">
                    <div>
                        <div className="section-kicker">
                            <Activity size={13} /> CONTINUOUS TIME-SERIES
                        </div>
                        <h2>Live Telemetry Trend Stream</h2>
                        <p>Dynamic sensor readings recorded every 3 seconds for vibration, temperature, and electrical current.</p>
                    </div>
                </div>

                <div className="sensor-chart-panel">
                    <SensorChart data={history} />
                </div>
            </section>

            {/* SECTION 4 & 5: DIAGNOSTICS & AI PREDICTION TWO-COLUMN */}
            <div className="detail-two-col-grid">
                {/* ROOT CAUSE DIAGNOSTICS */}
                <div className="dashboard-section detail-col-card">
                    <div className="section-header">
                        <div>
                            <div className="section-kicker">
                                <AlertTriangle size={13} /> ROOT CAUSE ANALYSIS
                            </div>
                            <h3>Active Condition Diagnostics</h3>
                        </div>
                    </div>

                    <div className={`detail-fault-summary fault-box-${statusClass}`}>
                        <div className="dfs-top">
                            <span className="dfs-label">Detected Status:</span>
                            <strong className={`status-${statusClass}`}>{machine.fault || "Normal Operation"}</strong>
                        </div>
                        <p className="dfs-explanation">
                            {machine.fault_explanation || "All monitored parameters are running within standard operational thresholds."}
                        </p>
                    </div>

                    <div className="dfs-action-box">
                        <span className="dfs-action-title">
                            <Wrench size={14} color="#00E5BF" /> Prescriptive Corrective Action:
                        </span>
                        <p>{machine.recommended_action || "Continue standard predictive monitoring schedule."}</p>
                    </div>

                    {machine.warnings && machine.warnings.length > 0 && (
                        <div className="dfs-list-group">
                            <span className="dfs-list-label">Active Warnings:</span>
                            <ul>
                                {machine.warnings.map((w, idx) => (
                                    <li key={idx} className="dfs-warn-item">
                                        <AlertTriangle size={13} color="#F59E0B" />
                                        <span>{w}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* EDGE AI PREDICTION & RUL */}
                <div className="dashboard-section detail-col-card">
                    <div className="section-header">
                        <div>
                            <div className="section-kicker">
                                <Sparkles size={13} /> EDGE AI PROGNOSTICS
                            </div>
                            <h3>AI Health & Remaining Useful Life</h3>
                        </div>
                    </div>

                    <div className="ai-rul-card">
                        <div className="ai-rul-kpi-row">
                            <div className="ai-rul-kpi">
                                <span>Estimated RUL</span>
                                <strong style={{ color: "#8B5CF6" }}>
                                    {aiPred.estimated_rul_hours || 850} hrs
                                </strong>
                            </div>
                            <div className="ai-rul-kpi">
                                <span>Anomaly Likelihood</span>
                                <strong style={{ color: (aiPred.anomaly_score || 0.05) > 0.3 ? "#EF4444" : "#10B981" }}>
                                    {((aiPred.anomaly_score || 0.05) * 100).toFixed(1)}%
                                </strong>
                            </div>
                            <div className="ai-rul-kpi">
                                <span>AI Risk Rating</span>
                                <strong className={`status-${(aiPred.risk || "Low").toLowerCase()}`}>
                                    {aiPred.risk || "Low"}
                                </strong>
                            </div>
                        </div>

                        <div className="ai-recommendation-box">
                            <span className="arb-label">Edge Model Inference Advisory:</span>
                            <p>{aiPred.recommendation || "System health trend is stable. Continue scheduled vibration spectrum checks."}</p>
                        </div>

                        <div className="ai-model-tag">
                            <span>Model: {aiPred.model_version || "ESA-EdgeAI-v1.2"}</span>
                            <span>Inference Target: ISO 10816-3 Standard</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 6: TECHNICAL SPECIFICATIONS TABLE */}
            <section className="dashboard-section">
                <div className="section-header">
                    <div>
                        <div className="section-kicker">
                            <Layers size={13} /> ASSET SPECIFICATIONS
                        </div>
                        <h2>Technical Nameplate & Maintenance Records</h2>
                        <p>Asset identity, manufacturer serial data, operating hours, and scheduled service overhaul dates.</p>
                    </div>

                    <Link to="/maintenance" className="schedule-maint-btn">
                        <Wrench size={14} /> Schedule Work Order
                    </Link>
                </div>

                <div className="specs-table-wrapper">
                    <table className="specs-table">
                        <tbody>
                            <tr>
                                <th>Equipment ID</th>
                                <td><code>{machine.machine_id}</code></td>
                                <th>Manufacturer</th>
                                <td>{machine.manufacturer || "Siemens Energy"}</td>
                            </tr>
                            <tr>
                                <th>Asset Name</th>
                                <td>{machine.name}</td>
                                <th>Model Designation</th>
                                <td>{machine.model || "Standard Industrial"}</td>
                            </tr>
                            <tr>
                                <th>Machine Classification</th>
                                <td>{machine.type} ({machine.category})</td>
                                <th>Serial Number</th>
                                <td><code>{machine.serial_number || "SN-8821-X"}</code></td>
                            </tr>
                            <tr>
                                <th>Plant Bay & Line</th>
                                <td>{machine.location} ({machine.production_line})</td>
                                <th>Commissioning Date</th>
                                <td>{machine.installed_date || "2023-01-15"}</td>
                            </tr>
                            <tr>
                                <th>Total Operating Hours</th>
                                <td><strong>{machine.operating_hours || 4500} hours</strong></td>
                                <th>Last Maintenance Log</th>
                                <td>{machine.last_maintenance || "2026-07-20"}</td>
                            </tr>
                            <tr>
                                <th>Active Simulation Mode</th>
                                <td><span className="spec-mode-tag">{machine.simulation_mode || "normal"}</span></td>
                                <th>Next Scheduled Overhaul</th>
                                <td><strong style={{ color: "#00E5BF" }}>{machine.next_maintenance || "2026-10-30"}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* SECTION 7: FAULT INJECTION CONTROLS & AI CHAT */}
            <div className="detail-two-col-grid">
                {/* DEMO FAULT INJECTION */}
                <div className="dashboard-section detail-col-card">
                    <div className="section-header">
                        <div>
                            <div className="section-kicker">
                                <RotateCcw size={13} /> DEMO CONTROLS
                            </div>
                            <h3>Fault Injection Testing</h3>
                            <p>Inject simulated stress conditions to observe instantaneous alarm reactions.</p>
                        </div>
                    </div>

                    <div className="detail-sim-buttons">
                        <button
                            type="button"
                            className="sim-btn sim-btn-normal"
                            onClick={() => handleFaultSimulate("normal")}
                            disabled={simulating}
                        >
                            ✓ Reset to Normal
                        </button>
                        <button
                            type="button"
                            className="sim-btn sim-btn-warn"
                            onClick={() => handleFaultSimulate("high_temperature")}
                            disabled={simulating}
                        >
                            🔥 High Temp (82°C)
                        </button>
                        <button
                            type="button"
                            className="sim-btn sim-btn-warn"
                            onClick={() => handleFaultSimulate("excessive_vibration")}
                            disabled={simulating}
                        >
                            〰️ High Vibration (8.8 mm/s)
                        </button>
                        <button
                            type="button"
                            className="sim-btn sim-btn-warn"
                            onClick={() => handleFaultSimulate("over_current")}
                            disabled={simulating}
                        >
                            ⚡ Over-Current (12.6 A)
                        </button>
                        <button
                            type="button"
                            className="sim-btn sim-btn-crit"
                            onClick={() => handleFaultSimulate("multiple")}
                            disabled={simulating}
                        >
                            ⚠️ Multiple Fault Overload
                        </button>
                    </div>
                </div>

                {/* ASSET AI COPILOT */}
                <div className="dashboard-section detail-col-card">
                    <div className="section-header">
                        <div>
                            <div className="section-kicker">
                                <Sparkles size={13} /> AI COPILOT
                            </div>
                            <h3>Ask AI about {machine.machine_id}</h3>
                        </div>
                    </div>

                    <form onSubmit={handleAskAI} className="detail-ai-query-form">
                        <div className="query-input-group">
                            <input
                                type="text"
                                placeholder={isCnc ? "e.g. Is spindle load normal? How is tool wear?" : "e.g. Is this motor safe to operate? Why is vibration high?"}
                                value={queryText}
                                onChange={(e) => setQueryText(e.target.value)}
                            />
                            <button type="submit" disabled={queryLoading} className="query-submit-btn">
                                <Send size={15} />
                            </button>
                        </div>
                    </form>

                    {queryResponse && (
                        <div className="detail-ai-answer-card">
                            <div className="dac-header">
                                <Sparkles size={14} color="#8B5CF6" />
                                <span>AI Maintenance Assessment:</span>
                            </div>
                            <pre className="dac-content">{queryResponse}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
