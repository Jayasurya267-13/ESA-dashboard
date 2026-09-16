import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
    Bell,
    UserCircle,
    Cpu,
    Wifi,
    WifiOff,
    LogOut,
    User,
    Shield,
    ChevronDown,
    Menu
} from "lucide-react";

function Header({
    connectionStatus,
    activeMachineName = "Motor Pump 01",
    onToggleMobileMenu,
    alertCount = 2
}) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const isConnected = connectionStatus === "Connected";

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        setDropdownOpen(false);
        logout();
        navigate("/login");
    };

    return (
        <header className="header">
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                {onToggleMobileMenu && (
                    <button
                        className="mobile-menu-btn"
                        onClick={onToggleMobileMenu}
                        aria-label="Toggle navigation menu"
                    >
                        <Menu size={20} />
                    </button>
                )}

                <div>
                    <h1>Machine Monitoring Dashboard</h1>
                    <p>Edge AI Based Predictive Maintenance System</p>
                </div>
            </div>

            <div className="header-right">
                {/* ACTIVE ASSET BADGE */}
                <div className="header-machine-badge">
                    <Cpu size={14} color="#00E5BF" />
                    <span>{activeMachineName}</span>
                </div>

                {/* CONNECTION PILL */}
                <div className={`system-status ${isConnected ? "normal" : "critical"}`}>
                    <span
                        className={`status-dot ${isConnected ? "online" : "offline"}`}
                    ></span>
                    <span>{connectionStatus}</span>
                    {isConnected ? <Wifi size={13} style={{ marginLeft: 3 }} /> : <WifiOff size={13} style={{ marginLeft: 3 }} />}
                </div>

                {/* NOTIFICATIONS BELL */}
                <Link
                    to="/alerts"
                    className="header-icon-btn"
                    title={`${alertCount} Active Alerts`}
                    aria-label="Alerts"
                >
                    <Bell size={20} color="#94A3B8" />
                    {alertCount > 0 && (
                        <span className="header-notification-badge">
                            {alertCount}
                        </span>
                    )}
                </Link>

                {/* USER PROFILE DROPDOWN */}
                <div className="user-profile-wrapper" ref={dropdownRef}>
                    <button
                        className="user-profile-trigger"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        aria-expanded={dropdownOpen}
                        aria-haspopup="true"
                    >
                        <div className="user-avatar-pill">
                            {user?.avatar || "JR"}
                        </div>
                        <div className="user-text-meta">
                            <span className="user-display-name">{user?.name || "Jayasurya R"}</span>
                            <span className="user-display-role">{user?.role || "Senior Maintenance Engineer"}</span>
                        </div>
                        <ChevronDown size={14} color="#94A3B8" />
                    </button>

                    {dropdownOpen && (
                        <div className="user-profile-menu">
                            <div className="profile-menu-header">
                                <div className="profile-menu-avatar">{user?.avatar || "JR"}</div>
                                <div>
                                    <h4>{user?.name || "Jayasurya R"}</h4>
                                    <span className="profile-role-badge">{user?.role || "Senior Maintenance Engineer"}</span>
                                    <p className="profile-email-sub">{user?.email || "sit24ec101@sairamtap.edu.in"}</p>
                                </div>
                            </div>

                            <div className="profile-menu-divider" />

                            <div className="profile-menu-body">
                                <Link
                                    to="/profile"
                                    className="profile-menu-item"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    <User size={15} color="#00E5BF" />
                                    <span>Account & Credentials</span>
                                </Link>

                                <div className="profile-menu-item-static">
                                    <Shield size={14} color="#8B5CF6" />
                                    <span>Dept: {user?.department || "Mechanical Reliability"}</span>
                                </div>
                            </div>

                            <div className="profile-menu-divider" />

                            <button
                                className="profile-logout-btn"
                                onClick={handleLogout}
                            >
                                <LogOut size={15} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;