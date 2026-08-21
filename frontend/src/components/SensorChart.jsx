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

function SensorChart({ data }) {

    return (
        <div style={{ width: "100%", height: 350 }}>

            <ResponsiveContainer width="100%" height="100%">

                <LineChart data={data}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="time" />

                    <YAxis />

                    <Tooltip />

                    <Legend />

                    <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#ef4444"
                        name="Temperature (°C)"
                        dot={false}
                    />

                    <Line
                        type="monotone"
                        dataKey="vibration"
                        stroke="#2563eb"
                        name="Vibration (mm/s)"
                        dot={false}
                    />

                    <Line
                        type="monotone"
                        dataKey="current"
                        stroke="#f59e0b"
                        name="Current (A)"
                        dot={false}
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>
    );
}

export default SensorChart;