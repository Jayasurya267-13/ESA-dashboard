import { Bot, Sparkles, Clock, AlertCircle, Brain } from "lucide-react";

function AIPrediction({ aiPrediction = {} }) {
    const health = aiPrediction.health !== undefined ? aiPrediction.health : 100;
    const status = aiPrediction.status || "Healthy";
    const risk = aiPrediction.risk || "Low";
    const recommendation = aiPrediction.recommendation || "Machine condition is currently stable. Operational parameters within normal tolerances.";
    const rulHours = aiPrediction.estimated_rul_hours || 1000;
    const anomalyScore = aiPrediction.anomaly_score !== undefined ? aiPrediction.anomaly_score : 0.02;

    const getRiskColor = (r) => {
        if (r === "High") return "#EF4444";
        if (r === "Medium" || r === "Moderate") return "#F59E0B";
        return "#00E5BF";
    };

    return (
        <section id="predictions" className="dashboard-section">
            <div className="section-header">
                <div>
                    <div className="section-kicker">
                        <Brain size={13} /> EDGE AI INFERENCE
                    </div>
                    <h2>AI Health Prediction & Risk Analysis</h2>
                    <p>Machine health degradation forecasting, Remaining Useful Life (RUL) estimation, and predictive risk scoring.</p>
                </div>
            </div>

            <div className="ai-prediction-card">
                <div className="ai-prediction-left">
                    <div className="ai-title">
                        <div className="ai-icon">
                            <Bot size={24} color="#8B5CF6" />
                        </div>
                        <div>
                            <h3>Predicted Machine Health</h3>
                            <span>AI-driven degradation modeling</span>
                        </div>
                    </div>

                    <div className="ai-health-value">
                        {health}%
                    </div>

                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "10px" }}>
                        <p style={{ margin: 0, fontSize: "13px" }}>
                            Prediction Status: <strong style={{ color: getRiskColor(risk) }}>{status}</strong>
                        </p>
                        <p style={{ margin: 0, fontSize: "13px" }}>
                            Failure Risk: <strong style={{ color: getRiskColor(risk) }}>{risk}</strong>
                        </p>
                    </div>

                    <div style={{
                        display: "flex",
                        gap: "18px",
                        marginTop: "16px",
                        paddingTop: "14px",
                        borderTop: "1px solid rgba(139, 92, 246, 0.2)"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#94A3B8" }}>
                            <Clock size={15} color="#8B5CF6" />
                            <span>Estimated RUL: <strong style={{ color: "#F8FAFC" }}>~{rulHours} hrs</strong></span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#94A3B8" }}>
                            <AlertCircle size={15} color="#8B5CF6" />
                            <span>Anomaly Score: <strong style={{ color: "#F8FAFC" }}>{anomalyScore}</strong></span>
                        </div>
                    </div>
                </div>

                <div className="ai-prediction-message">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "#8B5CF6" }}>
                        <Sparkles size={18} />
                        <span style={{ fontSize: "11.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Prescriptive AI Advisory
                        </span>
                    </div>

                    <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6, color: "#E2E8F0" }}>
                        {recommendation}
                    </p>

                    <div style={{ marginTop: "14px", fontSize: "11px", color: "#64748B" }}>
                        Inference Engine: {aiPrediction.model_version || "ESA-EdgeAI-v1.2"} • Continuous Telemetry Sampling
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AIPrediction;
