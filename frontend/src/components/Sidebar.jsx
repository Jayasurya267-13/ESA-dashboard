import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Cpu,
    Activity,
    AlertTriangle,
    Brain,
    MessageCircle,
    Settings,
    Bell,
    Wrench,
    Layers
} from "lucide-react";

export default function Sidebar({ activeSection, onNavigate }) {
    const navigate = useNavigate();
    const location = useLocation();

    const currentPath = location.pathname;

    const handleItemClick = (item) => {
        if (item.path) {
            navigate(item.path);
        } else if (item.section) {
            if (currentPath === "/dashboard" || currentPath === "/") {
                if (onNavigate) {
                    onNavigate(item.section);
                } else {
                    const el = document.getElementById(item.section);
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                }
            } else {
                navigate("/dashboard");
                setTimeout(() => {
                    const el = document.getElementById(item.section);
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 150);
            }
        }
    };

    const mainMenuItems = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            path: "/dashboard"
        },
        {
            id: "machines",
            label: "Machinery Fleet",
            icon: Cpu,
            path: "/machines",
            isPathMatch: (p) => p.startsWith("/machines")
        },
        {
            id: "alerts",
            label: "Active Alarms",
            icon: Bell,
            path: "/alerts"
        },
        {
            id: "maintenance",
            label: "Maintenance Logs",
            icon: Wrench,
            path: "/maintenance"
        },
        {
            id: "sensors",
            label: "Sensor Stream",
            icon: Activity,
            section: "sensors"
        },
        {
            id: "faults",
            label: "Fault Diagnostics",
            icon: AlertTriangle,
            section: "faults"
        },
        {
            id: "predictions",
            label: "AI Prognostics",
            icon: Brain,
            section: "predictions"
        },
        {
            id: "assistant",
            label: "AI Copilot",
            icon: MessageCircle,
            section: "assistant"
        }
    ];

    const isItemActive = (item) => {
        if (item.isPathMatch) {
            return item.isPathMatch(currentPath);
        }
        if (item.path) {
            return currentPath === item.path || (item.path === "/dashboard" && currentPath === "/");
        }
        if (item.section && (currentPath === "/dashboard" || currentPath === "/")) {
            return activeSection === item.section;
        }
        return false;
    };

    return (
        <aside className="sidebar">
            {/* LOGO */}
            <div className="logo-section" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
                <div className="logo-icon">
                    <Cpu size={24} />
                </div>
                <div className="logo-text">
                    <h2>ESA</h2>
                    <span>Predictive Maintenance</span>
                </div>
            </div>

            {/* NAVIGATION */}
            <nav className="sidebar-nav">
                {mainMenuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(item);

                    return (
                        <div
                            key={item.id}
                            className={`nav-item ${active ? "active" : ""}`}
                            onClick={() => handleItemClick(item)}
                        >
                            <Icon size={19} />
                            <span>{item.label}</span>
                        </div>
                    );
                })}
            </nav>

            {/* BOTTOM / SETTINGS */}
            <div className="sidebar-bottom">
                <div
                    className={`nav-item ${currentPath === "/settings" ? "active" : ""}`}
                    onClick={() => navigate("/settings")}
                >
                    <Settings size={19} />
                    <span>Settings &amp; Gateway</span>
                </div>
            </div>
        </aside>
    );
}