import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Bell,
    AlertTriangle,
    AlertOctagon,
    CheckCircle2,
    Search,
    Filter,
    ArrowUpRight,
    Clock,
    Layers,
    Activity,
    Thermometer,
    Zap
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function AlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterSeverity, setFilterSeverity] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchAlerts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/alerts`);
            if (res.ok) {
                const data = await res.json();
                setAlerts(data);
            }
        } catch (err) {
            console.error("Failed to load alerts:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 4000);
        return () => clearInterval(interval);
    }, []);

    const filteredAlerts = alerts.filter((a) => {
        const matchesSeverity =
            filterSeverity === "all" ||
            (filterSeverity === "critical" && a.severity?.toLowerCase() === "critical") ||
            (filterSeverity === "warning" && a.severity?.toLowerCase() === "warning") ||
            (filterSeverity === "active" && a.status?.toLowerCase() === "active") ||
            (filterSeverity === "resolved" && a.status?.toLowerCase() === "resolved");

        const matchesSearch =
            a.machine_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.machine_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.sensor?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSeverity && matchesSearch;
    });

    const totalCount = alerts.length;
    const criticalCount = alerts.filter((a) => a.severity?.toLowerCase() === "critical").length;
    const warningCount = alerts.filter((a) => a.severity?.toLowerCase() === "warning").length;
    const activeCount = alerts.filter((a) => a.status?.toLowerCase() === "active").length;

    const handleAcknowledge = (id) => {
        setAlerts((prev) =>
            prev.map((a) => (a.id === id ? { ...a, status: "Resolved" } : a))
        );
    };

    return (
        <div className="dashboard-content alerts-page">
            {/* PAGE HEADER */}
            <div className="fleet-header-block">
                <div>
                    <div className="section-kicker">
                        <Bell size={13} /> ALARM CONSOLE &amp; DISPATCH
                    </div>
                    <h1>Industrial Fleet Alarms</h1>
                    <p>
                        Real-time safety and diagnostic alerts triggered across rotating pump assets and CNC machining centers.
                    </p>
                </div>

                {/* ALERTS KPI CHIPS */}
                <div className="fleet-kpi-summary">
                    <div className="fleet-kpi-chip">
                        <span>Total Alarms</span>
                        <strong>{totalCount}</strong>
                    </div>
                    <div className="fleet-kpi-chip chip-critical">
                        <span>Critical</span>
                        <strong>{criticalCount}</strong>
                    </div>
                    <div className="fleet-kpi-chip chip-warning">
                        <span>Warning</span>
                        <strong>{warningCount}</strong>
                    </div>
                    <div className="fleet-kpi-chip chip-normal">
                        <span>Active</span>
                        <strong>{activeCount}</strong>
                    </div>
                </div>
            </div>

            {/* CONTROLS BAR */}
            <div className="fleet-controls-bar">
                <div className="category-tabs">
                    <button
                        className={`category-tab ${filterSeverity === "all" ? "active" : ""}`}
                        onClick={() => setFilterSeverity("all")}
                    >
                        All ({totalCount})
                    </button>
                    <button
                        className={`category-tab ${filterSeverity === "active" ? "active" : ""}`}
                        onClick={() => setFilterSeverity("active")}
                    >
                        Active ({activeCount})
                    </button>
                    <button
                        className={`category-tab ${filterSeverity === "critical" ? "active" : ""}`}
                        onClick={() => setFilterSeverity("critical")}
                    >
                        Critical ({criticalCount})
                    </button>
                    <button
                        className={`category-tab ${filterSeverity === "warning" ? "active" : ""}`}
                        onClick={() => setFilterSeverity("warning")}
                    >
                        Warning ({warningCount})
                    </button>
                    <button
                        className={`category-tab ${filterSeverity === "resolved" ? "active" : ""}`}
                        onClick={() => setFilterSeverity("resolved")}
                    >
                        Resolved
                    </button>
                </div>

                <div className="fleet-search-box">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search alerts by machine, symptom..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* ALERTS TABLE */}
            <div className="dashboard-section alerts-table-card">
                <div className="table-responsive">
                    <table className="alerts-table">
                        <thead>
                            <tr>
                                <th>Alarm ID</th>
                                <th>Machine / Asset</th>
                                <th>Severity</th>
                                <th>Sensor Parameter</th>
                                <th>Trigger Reading</th>
                                <th>Diagnostic Condition</th>
                                <th>Triggered At</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAlerts.length === 0 ? (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: "center", padding: "40px", color: "#94A3B8" }}>
                                        No alerts matching current filter criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredAlerts.map((alert) => {
                                    const isCrit = alert.severity?.toLowerCase() === "critical";
                                    const isActive = alert.status?.toLowerCase() === "active";

                                    return (
                                        <tr key={alert.id} className={isCrit && isActive ? "row-critical-glow" : ""}>
                                            <td>
                                                <code className="alert-id-code">{alert.id}</code>
                                            </td>

                                            <td>
                                                <Link to={`/machines/${alert.machine_id}`} className="alert-machine-link">
                                                    <strong>{alert.machine_name}</strong>
                                                    <small>({alert.machine_id})</small>
                                                </Link>
                                            </td>

                                            <td>
                                                <span className={`alert-severity-badge ${isCrit ? "asb-critical" : "asb-warning"}`}>
                                                    {isCrit ? <AlertOctagon size={12} /> : <AlertTriangle size={12} />}
                                                    <span>{alert.severity}</span>
                                                </span>
                                            </td>

                                            <td>
                                                <span className="alert-sensor-pill">{alert.sensor}</span>
                                            </td>

                                            <td>
                                                <strong style={{ color: isCrit ? "#EF4444" : "#F59E0B" }}>
                                                    {alert.value}
                                                </strong>
                                            </td>

                                            <td>
                                                <span className="alert-message-text">{alert.message}</span>
                                            </td>

                                            <td>
                                                <div className="alert-time-cell">
                                                    <Clock size={12} color="#64748B" />
                                                    <span>{alert.timestamp}</span>
                                                </div>
                                            </td>

                                            <td>
                                                <span className={`alert-status-badge ${isActive ? "asb-active" : "asb-resolved"}`}>
                                                    {alert.status}
                                                </span>
                                            </td>

                                            <td>
                                                {isActive ? (
                                                    <button
                                                        type="button"
                                                        className="alert-ack-btn"
                                                        onClick={() => handleAcknowledge(alert.id)}
                                                    >
                                                        Acknowledge
                                                    </button>
                                                ) : (
                                                    <span className="alert-done-text">Resolved</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
