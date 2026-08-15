function MetricCard({ title, value, unit, icon, status }) {
    return (
        <div className="metric-card">

            <div className="metric-top">

                <div>
                    <p className="metric-title">{title}</p>

                    <div className="metric-value">
                        {value}
                        <span>{unit}</span>
                    </div>
                </div>

                <div className="metric-icon">
                    {icon}
                </div>

            </div>

            <div className="metric-status">
                {status}
            </div>

        </div>
    );
}

export default MetricCard;