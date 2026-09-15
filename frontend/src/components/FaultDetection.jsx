import { ShieldCheck, AlertTriangle, CheckCircle, Info } from "lucide-react";

function FaultDetection({
    machineStatus = "Normal",
    faultMessage = "No fault detected",
    faultExplanation = "",
    recommendedAction = "",
    warnings = [],
    faults = []
}) {
    const isNormal = (machineStatus || "").toLowerCase() === "normal";
    const statusClass = (machineStatus || "normal").toLowerCase().replace(/\s+/g, "-");

    return (
        <section id="faults" className="dashboard-section">
            <div className="section-header">
                <div>
                    <div className="section-kicker">
                        <AlertTriangle size={13} /> SAFETY & DIAGNOSTICS
                    </div>
                    <h2>Fault Detection & Root Cause Analysis</h2>
                    <p>Real-time anomaly identification, severity classification, and automated maintenance recommendations.</p>
                </div>
            </div>

            <div className={`fault-panel fault-panel-${statusClass}`}>
                <div className="fault-icon">
                    {isNormal ? (
                        <ShieldCheck size={36} color="#00E5BF" />
                    ) : (
                        <AlertTriangle size={36} color={statusClass === "critical" ? "#EF4444" : "#F59E0B"} />
                    )}
                </div>

                <div className="fault-info">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <h3>{faultMessage}</h3>
                        {!isNormal && (
                            <span style={{
                                fontSize: "11px",
                                fontWeight: "700",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                background: statusClass === "critical" ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)",
                                color: statusClass === "critical" ? "#EF4444" : "#F59E0B",
                                border: `1px solid ${statusClass === "critical" ? "rgba(239, 68, 68, 0.3)" : "rgba(245, 158, 11, 0.3)"}`
                            }}>
                                {statusClass.toUpperCase()}
                            </span>
                        )}
                    </div>
                    <p>
                        Continuous multi-sensor threshold evaluation across thermal, mechanical vibration, and electrical load parameters.
                    </p>
                </div>

                <div className={`fault-status ${statusClass}`}>
                    {machineStatus}
                </div>
            </div>

            <div className="fault-details">
                <div className="fault-detail-card">
                    <div className="detail-number">01</div>
                    <div>
                        <h3>Diagnosis & What is Happening</h3>
                        <p>
                            {faultExplanation || "All sensor streams are operating well within defined safety margins. No mechanical or electrical degradation observed."}
                        </p>
                        {(warnings.length > 0 || faults.length > 0) && (
                            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                                {faults.map((f, i) => (
                                    <div key={`f-${i}`} style={{ fontSize: "12px", color: "#EF4444", display: "flex", alignItems: "center", gap: "5px" }}>
                                        <AlertTriangle size={13} /> {f}
                                    </div>
                                ))}
                                {warnings.map((w, i) => (
                                    <div key={`w-${i}`} style={{ fontSize: "12px", color: "#F59E0B", display: "flex", alignItems: "center", gap: "5px" }}>
                                        <Info size={13} /> {w}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="fault-detail-card">
                    <div className="detail-number">02</div>
                    <div>
                        <h3>Actionable Maintenance Plan</h3>
                        <p>
                            {recommendedAction || "Continue routine scheduled monitoring and check lubricant levels during standard maintenance intervals."}
                        </p>
                        <div style={{ marginTop: "8px", fontSize: "12px", color: "#94A3B8" }}>
                            <strong>Safety Protocol:</strong> {isNormal ? "Normal operation permitted." : "Log inspection ticket and notify floor technician."}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default FaultDetection;
