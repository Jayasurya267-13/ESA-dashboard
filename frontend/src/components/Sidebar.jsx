import {
    LayoutDashboard,
    Cpu,
    Activity,
    AlertTriangle,
    Brain,
    Settings
} from "lucide-react";

function Sidebar() {
    return (
        <aside className="sidebar">

            <div className="logo-section">
                <div className="logo-icon">
                    <Cpu size={24} />
                </div>

                <div>
                    <h2>ESA</h2>
                    <span>Predictive Maintenance</span>
                </div>
            </div>

            <nav className="sidebar-nav">

                <div className="nav-item active">
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </div>

                <div className="nav-item">
                    <Cpu size={20} />
                    <span>Machines</span>
                </div>

                <div className="nav-item">
                    <Activity size={20} />
                    <span>Sensors</span>
                </div>

                <div className="nav-item">
                    <AlertTriangle size={20} />
                    <span>Faults</span>
                </div>

                <div className="nav-item">
                    <Brain size={20} />
                    <span>AI Predictions</span>
                </div>

            </nav>

            <div className="sidebar-bottom">
                <div className="nav-item">
                    <Settings size={20} />
                    <span>Settings</span>
                </div>
            </div>

        </aside>
    );
}

export default Sidebar;