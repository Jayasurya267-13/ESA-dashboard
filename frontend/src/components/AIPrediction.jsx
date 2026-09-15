import { Bot, Sparkles, Clock, AlertCircle } from "lucide-react";

function AIPrediction({ aiPrediction = {} }) {
    const health = aiPrediction.health !== undefined ? aiPrediction.health : 100;
    const status = aiPrediction.status || "Healthy";
    const risk = aiPrediction.risk || "Low";
    const recommendation = aiPrediction.recommendation || "Machine condition is currently stable. Continue normal monitoring.";
    const rulHours = aiPrediction.estimated_rul_hours || 500;
    const anomalyScore = aiPrediction.anomaly_score !== undefined ? aiPrediction.anomaly_score : 0.05;

    const getRiskColor = (r) => {
        if (r === "High") return "#EF4444";
        if (r === "Medium" || r === "Moderate") return "#F59E0B";
        return "#00C9A7";
    };

    return (
        <section id="predictions" className="dashboard-section">
            <div className="section-header">
                <div>
                    <div className="section-kicker">EDGE AI INFERENCE</div>
                    <h2>AI Health Prediction & Risk Analysis</h2>
                    <p>Remaining Useful Life (RUL) estimation and degradation forecasting.</p>
                </div>
            </div>

            <div className="ai-prediction-card">
                <div className="ai-prediction-left">
                    <div className="ai-title">
                        <div className="ai-icon">
                            <Bot size={24} color="#7C5CFC" />
                        </div>
                        <div>
                            <h3>Predicted Machine Health</h3>
                            <span>AI condition forecasting</span>
                        </div>
                    </div>

                    <div className="ai-health-value">
                        {health}%
                    </div>

                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "10px" }}>
                        <p style={{ margin: 0 }}>
                            Prediction Status: <strong style={{ color: getRiskColor(risk) }}>{status}</strong>
                        </p>
                        <p style={{ margin: 0 }}>
                            Failure Risk: <strong style={{ color: getRiskColor(risk) }}>{risk}</strong>
                        </p>
                    </div>

                    <div style={{
                        display: "flex",
                        gap: "18px",
                        marginTop: "16px",
                        paddingTop: "14px",
                        borderTop: "1px solid rgba(124, 92, 252, 0.2)"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#94A3B8" }}>
                            <Clock size={15} color="#7C5CFC" />
                            <span>Estimated RUL: <strong style={{ color: "#F1F5F9" }}>~{rulHours} hrs</strong></span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#94A3B8" }}>
                            <AlertCircle size={15} color="#7C5CFC" />
                            <span>Anomaly Score: <strong style={{ color: "#F1F5F9" }}>{anomalyScore}</strong></span>
                        </div>
                    </div>
                </div>

                <div className="ai-prediction-message">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "#7C5CFC" }}>
                        <Sparkles size={20} />
                        <span style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Prescriptive AI Advisory
                        </span>
                    </div>

                    <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6, color: "#E2E8F0" }}>
                        {recommendation}
                    </p>

                    <div style={{ marginTop: "14px", fontSize: "11px", color: "#64748B" }}>
                        Model: {aiPrediction.model_version || "ESA-EdgeAI-v1.2"} • Live Telemetry Ingested
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AIPrediction;
