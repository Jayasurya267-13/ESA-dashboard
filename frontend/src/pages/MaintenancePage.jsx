import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Wrench,
    Plus,
    Calendar,
    User,
    CheckCircle2,
    Clock,
    Search,
    Layers,
    Cpu,
    X,
    FileText
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

export default function MaintenancePage() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);

    // Form state for creating new maintenance record
    const [formMachine, setFormMachine] = useState("CNC-001");
    const [formType, setFormType] = useState("Preventive Maintenance");
    const [formTech, setFormTech] = useState("Jayasurya R (Lead)");
    const [formDesc, setFormDesc] = useState("");
    const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
    const [formNextDue, setFormNextDue] = useState("2026-11-30");
    const [submitting, setSubmitting] = useState(false);

    const fetchRecords = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/maintenance`);
            if (res.ok) {
                const data = await res.json();
                setRecords(data);
            }
        } catch (err) {
            console.error("Failed to load maintenance records:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleCreateRecord = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/maintenance`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    machine_id: formMachine,
                    type: formType,
                    description: formDesc || "Standard preventative maintenance overhaul and inspection.",
                    technician: formTech,
                    date: formDate,
                    next_due: formNextDue,
                    status: "Scheduled"
                })
            });
            if (res.ok) {
                setShowModal(false);
                setFormDesc("");
                await fetchRecords();
            }
        } catch (err) {
            console.error("Failed to submit maintenance order:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredRecords = records.filter((r) =>
        r.machine_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.machine_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.technician?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalCount = records.length;
    const completedCount = records.filter((r) => r.status?.toLowerCase() === "completed").length;
    const scheduledCount = records.filter((r) => r.status?.toLowerCase() === "scheduled").length;

    return (
        <div className="dashboard-content maintenance-page">
            {/* PAGE HEADER */}
            <div className="fleet-header-block">
                <div>
                    <div className="section-kicker">
                        <Wrench size={13} /> FIELD OPERATIONS &amp; ASSET CARE
                    </div>
                    <h1>Predictive Maintenance Work Orders</h1>
                    <p>
                        Track overhaul schedules, tool replacement intervals, laser shaft alignments, and lubrication cycles.
                    </p>
                </div>

                <button
                    type="button"
                    className="create-order-btn"
                    onClick={() => setShowModal(true)}
                >
                    <Plus size={16} />
                    <span>Create Work Order</span>
                </button>
            </div>

            {/* KPI STATS CARDS */}
            <div className="maintenance-kpis-grid">
                <div className="maint-kpi-card">
                    <div className="mkc-icon icon-teal">
                        <FileText size={20} />
                    </div>
                    <div className="mkc-text">
                        <span>Total Work Orders</span>
                        <strong>{totalCount}</strong>
                    </div>
                </div>

                <div className="maint-kpi-card">
                    <div className="mkc-icon icon-emerald">
                        <CheckCircle2 size={20} />
                    </div>
                    <div className="mkc-text">
                        <span>Completed Services</span>
                        <strong>{completedCount}</strong>
                    </div>
                </div>

                <div className="maint-kpi-card">
                    <div className="mkc-icon icon-amber">
                        <Clock size={20} />
                    </div>
                    <div className="mkc-text">
                        <span>Scheduled Overhauls</span>
                        <strong>{scheduledCount}</strong>
                    </div>
                </div>

                <div className="maint-kpi-card">
                    <div className="mkc-icon icon-purple">
                        <Calendar size={20} />
                    </div>
                    <div className="mkc-text">
                        <span>Upcoming Due Milestone</span>
                        <strong style={{ fontSize: "17px", color: "#8B5CF6" }}>2026-10-15</strong>
                    </div>
                </div>
            </div>

            {/* CONTROLS BAR */}
            <div className="fleet-controls-bar">
                <div className="fleet-search-box" style={{ maxWidth: "420px" }}>
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search work orders by machine, technician, type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* RECORDS TABLE */}
            <div className="dashboard-section alerts-table-card">
                <div className="table-responsive">
                    <table className="alerts-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Machine Asset</th>
                                <th>Intervention Type</th>
                                <th>Assigned Technician</th>
                                <th>Scope of Work</th>
                                <th>Service Date</th>
                                <th>Next Due</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#94A3B8" }}>
                                        No maintenance work orders found matching search criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <code className="alert-id-code">{item.id}</code>
                                        </td>
                                        <td>
                                            <Link to={`/machines/${item.machine_id}`} className="alert-machine-link">
                                                <strong>{item.machine_name}</strong>
                                                <small>({item.machine_id})</small>
                                            </Link>
                                        </td>
                                        <td>
                                            <span className="maint-type-pill">{item.type}</span>
                                        </td>
                                        <td>
                                            <div className="maint-tech-cell">
                                                <User size={13} color="#00E5BF" />
                                                <span>{item.technician}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="maint-desc-cell">{item.description}</span>
                                        </td>
                                        <td>
                                            <div className="alert-time-cell">
                                                <Calendar size={12} color="#64748B" />
                                                <span>{item.date}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <strong style={{ color: "#00E5BF", fontSize: "12.5px" }}>{item.next_due}</strong>
                                        </td>
                                        <td>
                                            <span className={`maint-status-chip status-${item.status?.toLowerCase()}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CREATE WORK ORDER MODAL */}
            {showModal && (
                <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="modal-card modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <Wrench size={22} color="#00E5BF" />
                                <h3>Create Maintenance Work Order</h3>
                            </div>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setShowModal(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateRecord} className="modal-form">
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Target Machine Asset</label>
                                    <select
                                        value={formMachine}
                                        onChange={(e) => setFormMachine(e.target.value)}
                                        required
                                    >
                                        {DEFAULT_MACHINES.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.id} — {m.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Intervention Classification</label>
                                    <select
                                        value={formType}
                                        onChange={(e) => setFormType(e.target.value)}
                                        required
                                    >
                                        <option value="Preventive Maintenance">Preventive Maintenance</option>
                                        <option value="Bearing Lubrication &amp; Alignment">Bearing Lubrication &amp; Alignment</option>
                                        <option value="Spindle Thermal Check &amp; Chiller">Spindle Thermal Check &amp; Chiller</option>
                                        <option value="ATC Tool Insert Replacement">ATC Tool Insert Replacement</option>
                                        <option value="Vibration Sensor Calibration">Vibration Sensor Calibration</option>
                                        <option value="Emergency Corrective Overhaul">Emergency Corrective Overhaul</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Assigned Field Technician</label>
                                    <input
                                        type="text"
                                        value={formTech}
                                        onChange={(e) => setFormTech(e.target.value)}
                                        placeholder="e.g. Jayasurya R, Harish kumar A, Umesh Madhu P"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Service Scheduled Date</label>
                                    <input
                                        type="date"
                                        value={formDate}
                                        onChange={(e) => setFormDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Next Follow-Up Due Date</label>
                                <input
                                    type="date"
                                    value={formNextDue}
                                    onChange={(e) => setFormNextDue(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Work Scope &amp; Technical Notes</label>
                                <textarea
                                    rows="3"
                                    value={formDesc}
                                    onChange={(e) => setFormDesc(e.target.value)}
                                    placeholder="Specify parts replaced, torque specs, grease type, laser runout values..."
                                    required
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="login-submit-btn"
                                    disabled={submitting}
                                    style={{ width: "auto", minWidth: "160px" }}
                                >
                                    {submitting ? "Logging..." : "Dispatch Work Order"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
