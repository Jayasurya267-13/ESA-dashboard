import { Bell, UserCircle, Cpu, Wifi, WifiOff } from "lucide-react";

function Header({ connectionStatus, activeMachineName = "Motor Pump 01" }) {
    const isConnected = connectionStatus === "Connected";

    return (
        <header className="header">
            <div>
                <h1>Machine Monitoring Dashboard</h1>
                <p>Edge AI Based Predictive Maintenance System</p>
            </div>

            <div className="header-right">
                <div className="header-machine-badge" style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(0, 201, 167, 0.12)",
                    border: "1px solid rgba(0, 201, 167, 0.25)",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#00C9A7"
                }}>
                    <Cpu size={15} />
                    <span>{activeMachineName}</span>
                </div>

                <div className={`system-status ${isConnected ? "normal" : "critical"}`}>
                    <span
                        className={`status-dot ${isConnected ? "online" : "offline"}`}
                    ></span>
                    <span>{connectionStatus}</span>
                    {isConnected ? <Wifi size={13} style={{ marginLeft: 3 }} /> : <WifiOff size={13} style={{ marginLeft: 3 }} />}
                </div>

                <div style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }} title="System Notifications">
                    <Bell size={22} color="#94A3B8" />
                    <span style={{
                        position: "absolute",
                        top: "-2px",
                        right: "-2px",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#00C9A7"
                    }}></span>
                </div>

                <UserCircle size={30} color="#94A3B8" style={{ cursor: "pointer" }} title="Operator: Admin" />
            </div>
        </header>
    );
}

export default Header;