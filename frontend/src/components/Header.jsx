import { Bell, UserCircle } from "lucide-react";

function Header() {
    return (
        <header className="header">

            <div>
                <h1>Machine Monitoring Dashboard</h1>
                <p>Edge AI Based Predictive Maintenance System</p>
            </div>

            <div className="header-right">

                <div className="system-status">
                    <span className="status-dot"></span>
                    System Online
                </div>

                <Bell size={22} />

                <UserCircle size={30} />

            </div>

        </header>
    );
}

export default Header;