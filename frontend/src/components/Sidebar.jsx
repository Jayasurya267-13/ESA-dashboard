import {
    LayoutDashboard,
    Cpu,
    Activity,
    AlertTriangle,
    Brain,
    MessageCircle,
    Settings
} from "lucide-react";

function Sidebar({ activeSection, onNavigate }) {

    const menuItems = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutDashboard
        },
        {
            id: "machines",
            label: "Machines",
            icon: Cpu
        },
        {
            id: "sensors",
            label: "Sensors",
            icon: Activity
        },
        {
            id: "faults",
            label: "Fault Detection",
            icon: AlertTriangle
        },
        {
            id: "predictions",
            label: "AI Predictions",
            icon: Brain
        },
        {
            id: "assistant",
            label: "Maintenance Assistant",
            icon: MessageCircle
        }
    ];

    return (
        <aside className="sidebar">

            {/* LOGO */}
            <div className="logo-section">

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

                {menuItems.map((item) => {

                    const Icon = item.icon;

                    return (
                        <div
                            key={item.id}
                            className={`nav-item ${
                                activeSection === item.id ? "active" : ""
                            }`}
                            onClick={() => onNavigate(item.id)}
                        >

                            <Icon size={20} />

                            <span>{item.label}</span>

                        </div>
                    );

                })}

            </nav>

            {/* SETTINGS */}
            <div className="sidebar-bottom">

                <div
                    className={`nav-item ${
                        activeSection === "settings" ? "active" : ""
                    }`}
                    onClick={() => onNavigate("settings")}
                >

                    <Settings size={20} />

                    <span>Settings</span>

                </div>

            </div>

        </aside>
    );
}

export default Sidebar;