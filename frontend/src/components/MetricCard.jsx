function MetricCard({ title, value, unit, icon, status = "Normal", thresholdInfo }) {
    const statusClass = (status || "normal").toLowerCase().replace(/\s+/g, "-");

    return (
        <div className={`metric-card metric-status-${statusClass}`}>
            <div className="metric-top">
                <div>
                    <p className="metric-title">
                        {title}
                    </p>

                    <div className="metric-value">
                        {value !== undefined && value !== null ? value : "--"}
                        <span>{unit}</span>
                    </div>

                    {thresholdInfo && (
                        <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
                            {thresholdInfo}
                        </div>
                    )}
                </div>

                <div className="metric-icon">
                    {icon}
                </div>
            </div>

            <div className="metric-status">
                <span className={`status-indicator ${statusClass}`}></span>
                <span style={{ fontWeight: "600" }}>{status}</span>
            </div>
        </div>
    );
}

export default MetricCard;