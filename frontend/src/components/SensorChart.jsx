import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                backgroundColor: "#151F27",
                border: "1px solid rgba(0, 201, 167, 0.25)",
                borderRadius: "8px",
                padding: "10px 14px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                fontSize: "12px",
                color: "#F1F5F9"
            }}>
                <div style={{ fontWeight: "700", marginBottom: "6px", color: "#94A3B8" }}>
                    Time: {label}
                </div>
                {payload.map((entry, index) => (
                    <div key={`item-${index}`} style={{ color: entry.color, margin: "3px 0", fontWeight: "600" }}>
                        {entry.name}: {entry.value}
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

function SensorChart({ data }) {
    const [filter, setFilter] = useState("all");

    return (
        <div className="sensor-chart-container" style={{ width: "100%" }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
                flexWrap: "wrap",
                gap: "8px"
            }}>
                <span style={{ fontSize: "12px", color: "#94A3B8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Telemetry Stream (Last 20 Samples)
                </span>
                <div style={{ display: "flex", gap: "6px" }}>
                    {[
                        { id: "all", label: "All Sensors" },
                        { id: "temp", label: "Temperature" },
                        { id: "vib", label: "Vibration" },
                        { id: "curr", label: "Current" }
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => setFilter(btn.id)}
                            style={{
                                background: filter === btn.id ? "#00C9A7" : "#111A21",
                                color: filter === btn.id ? "#0B1117" : "#94A3B8",
                                border: "1px solid " + (filter === btn.id ? "#00C9A7" : "rgba(0, 201, 167, 0.2)"),
                                borderRadius: "6px",
                                padding: "4px 10px",
                                fontSize: "11px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.15s ease"
                            }}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ width: "100%", height: 340 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />

                        <XAxis
                            dataKey="time"
                            stroke="#64748B"
                            tick={{ fontSize: 11, fill: "#94A3B8" }}
                        />

                        {/* Left axis for Temperature (40-100 °C) */}
                        <YAxis
                            yAxisId="left"
                            domain={[40, 100]}
                            stroke="#64748B"
                            tick={{ fontSize: 11, fill: "#94A3B8" }}
                            label={{ value: "°C", angle: -90, position: "insideLeft", fill: "#64748B", fontSize: 10 }}
                        />

                        {/* Right axis for Vibration (0-10 mm/s) and Current (0-15 A) */}
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            domain={[0, 15]}
                            stroke="#64748B"
                            tick={{ fontSize: 11, fill: "#94A3B8" }}
                            label={{ value: "mm/s | A", angle: 90, position: "insideRight", fill: "#64748B", fontSize: 10 }}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        <Legend
                            wrapperStyle={{ paddingTop: "10px", fontSize: "12px", color: "#94A3B8" }}
                        />

                        {(filter === "all" || filter === "temp") && (
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="temperature"
                                stroke="#EF4444"
                                strokeWidth={2.2}
                                name="Temperature (°C)"
                                dot={false}
                                activeDot={{ r: 5, fill: "#EF4444" }}
                            />
                        )}

                        {(filter === "all" || filter === "vib") && (
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="vibration"
                                stroke="#7C5CFC"
                                strokeWidth={2.2}
                                name="Vibration (mm/s)"
                                dot={false}
                                activeDot={{ r: 5, fill: "#7C5CFC" }}
                            />
                        )}

                        {(filter === "all" || filter === "curr") && (
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="current"
                                stroke="#00C9A7"
                                strokeWidth={2.2}
                                name="Current (A)"
                                dot={false}
                                activeDot={{ r: 5, fill: "#00C9A7" }}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default SensorChart;