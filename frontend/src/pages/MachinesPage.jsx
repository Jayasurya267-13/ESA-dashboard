import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Cpu,
    Search,
    Layers,
    Activity,
    Thermometer,
    Zap,
    HeartPulse,
    ArrowUpRight,
    CheckCircle2,
    AlertTriangle,
    AlertOctagon,
    Gauge,
    Wrench,
    Clock,
    MapPin
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function MachinesPage() {
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchMachines = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/machines`);
            if (res.ok) {
                const data = await res.json();
                setMachines(data);
            }
        } catch (err) {
            console.error("Failed to load machines:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMachines();
        const interval = setInterval(fetchMachines, 3000);
        return () => clearInterval(interval);
    }, []);

    const filteredMachines = machines.filter((m) => {
        const matchesCategory =
            activeCategory === "all" ||
            (activeCategory === "cnc" && m.category === "CNC") ||
            (activeCategory === "motor" && (m.category === "Motor / Pump" || !m.is_cnc));

        const matchesSearch =
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (m.location && m.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (m.type && m.type.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesCategory && matchesSearch;
    });

    const totalCount = machines.length;
    const normalCount = machines.filter((m) => m.status === "Normal").length;
    const warnCount = machines.filter((m) => m.status === "Warning").length;
    const critCount = machines.filter((m) => m.status === "Critical").length;

    const getStatusIcon = (status) => {
        switch (status) {
            case "Critical":
                return <AlertOctagon size={14} color="#EF4444" />;
            case "Warning":
                return <AlertTriangle size={14} color="#F59E0B" />;
            default:
                return <CheckCircle2 size={14} color="#10B981" />;
        }
    };

    return (
        <div className="dashboard-content fleet-page">
            {/* PAGE HEADER */}
            <div className="fleet-header-block">
                <div>
                    <div className="section-kicker">
                        <Layers size={13} /> FLEET ASSETS CATALOG
                    </div>
                    <h1>Industrial Machinery Fleet</h1>
                    <p>
                        Comprehensive health diagnostics, telemetry feeds, and asset status across all 8 monitored factory units.
                    </p>
                </div>

                {/* QUICK FLEET COUNTER CHIPS */}
                <div className="fleet-kpi-summary">
                    <div className="fleet-kpi-chip">
                        <span>Total Assets</span>
                        <strong>{totalCount}</strong>
                    </div>
                    <div className="fleet-kpi-chip chip-normal">
                        <span>Normal</span>
                        <strong>{normalCount}</strong>
                    </div>
                    <div className="fleet-kpi-chip chip-warning">
                        <span>Warning</span>
                        <strong>{warnCount}</strong>
                    </div>
                    <div className="fleet-kpi-chip chip-critical">
                        <span>Critical</span>
                        <strong>{critCount}</strong>
                    </div>
                </div>
            </div>

            {/* CONTROLS BAR: CATEGORIES & SEARCH */}
            <div className="fleet-controls-bar">
                <div className="category-tabs">
                    <button
                        className={`category-tab ${activeCategory === "all" ? "active" : ""}`}
                        onClick={() => setActiveCategory("all")}
                    >
                        All Assets ({totalCount})
                    </button>
                    <button
                        className={`category-tab ${activeCategory === "motor" ? "active" : ""}`}
                        onClick={() => setActiveCategory("motor")}
                    >
                        Motor & Pump Units (3)
                    </button>
                    <button
                        className={`category-tab ${activeCategory === "cnc" ? "active" : ""}`}
                        onClick={() => setActiveCategory("cnc")}
                    >
                        CNC Precision Centers (5)
                    </button>
                </div>

                <div className="fleet-search-box">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by ID, name, bay..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* MACHINES GRID */}
            <div className="fleet-grid">
                {filteredMachines.map((m) => {
                    const statusClass = (m.status || "normal").toLowerCase();

                    return (
                        <div key={m.id} className={`fleet-machine-card card-status-${statusClass}`}>
                            {/* TOP META ROW */}
                            <div className="fmc-top-row">
                                <span className={`fmc-category-badge ${m.is_cnc ? "badge-cnc" : "badge-motor"}`}>
                                    {m.is_cnc ? "CNC MACHINE" : "MOTOR / PUMP"}
                                </span>

                                <div className={`fmc-status-pill status-${statusClass}`}>
                                    {getStatusIcon(m.status)}
                                    <span>{m.status || "Normal"}</span>
                                </div>
                            </div>

                            {/* ASSET TITLE & ID */}
                            <div className="fmc-title-section">
                                <div className="fmc-id-badge">{m.id}</div>
                                <h3>{m.name}</h3>
                                <p className="fmc-type-desc">{m.type}</p>
                            </div>

                            {/* HEALTH PROGRESS */}
                            <div className="fmc-health-section">
                                <div className="fmc-health-label">
                                    <span>Condition Health</span>
                                    <strong style={{ color: m.health >= 80 ? "#10B981" : m.health >= 60 ? "#F59E0B" : "#EF4444" }}>
                                        {m.health}%
                                    </strong>
                                </div>
                                <div className="fmc-health-bar-track">
                                    <div
                                        className="fmc-health-bar-fill"
                                        style={{
                                            width: `${m.health}%`,
                                            background: m.health >= 80 ? "#10B981" : m.health >= 60 ? "#F59E0B" : "#EF4444"
                                        }}
                                    />
                                </div>
                            </div>

                            {/* CORE TELEMETRY METRICS ROW */}
                            <div className="fmc-telemetry-grid">
                                <div className="fmc-telemetry-tile">
                                    <div className="fmc-tile-header">
                                        <Thermometer size={13} color="#F59E0B" />
                                        <span>Temp</span>
                                    </div>
                                    <strong>{m.temperature} °C</strong>
                                </div>

                                <div className="fmc-telemetry-tile">
                                    <div className="fmc-tile-header">
                                        <Activity size={13} color="#8B5CF6" />
                                        <span>Vibration</span>
                                    </div>
                                    <strong>{m.vibration} mm/s</strong>
                                </div>

                                <div className="fmc-telemetry-tile">
                                    <div className="fmc-tile-header">
                                        <Zap size={13} color="#00E5BF" />
                                        <span>Current</span>
                                    </div>
                                    <strong>{m.current} A</strong>
                                </div>
                            </div>

                            {/* FOOTER INFO & ACTION */}
                            <div className="fmc-footer">
                                <div className="fmc-loc">
                                    <MapPin size={12} color="#94A3B8" />
                                    <span>{m.location}</span>
                                </div>
                                <div className="fmc-hours">
                                    <Clock size={12} color="#94A3B8" />
                                    <span>{m.operating_hours || 4000} hrs</span>
                                </div>
                            </div>

                            <Link to={`/machines/${m.id}`} className="fmc-inspect-btn">
                                <span>Inspect Diagnostics</span>
                                <ArrowUpRight size={15} />
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
