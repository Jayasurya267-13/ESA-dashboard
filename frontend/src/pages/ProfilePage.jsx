import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
    User,
    Shield,
    Mail,
    Briefcase,
    Clock,
    MapPin,
    CheckCircle2,
    Save,
    LogOut,
    Activity,
    Layers,
    Users
} from "lucide-react";

export default function ProfilePage() {
    const { user, updateProfile, logout } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState(user?.name || "Jayasurya R");
    const [department, setDepartment] = useState(user?.department || "Mechanical Reliability");
    const [email, setEmail] = useState(user?.email || "sit24ec101@sairamtap.edu.in");
    const [shift, setShift] = useState("Shift A (07:00 - 15:30)");
    const [saveMsg, setSaveMsg] = useState("");

    const handleSave = (e) => {
        e.preventDefault();
        updateProfile({ name, department, email });
        setSaveMsg("Profile details updated successfully!");
        setTimeout(() => setSaveMsg(""), 3500);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="dashboard-content profile-page">
            {/* PAGE HEADER */}
            <div className="fleet-header-block">
                <div>
                    <div className="section-kicker">
                        <User size={13} /> OPERATOR IDENTITY &amp; RBAC
                    </div>
                    <h1>Engineer Profile &amp; Credentials</h1>
                    <p>
                        Authorized operator credentials, assigned factory bays, active shift schedule, and role-based access control.
                    </p>
                </div>
            </div>

            <div className="profile-grid">
                {/* LEFT: IDENTITY CARD */}
                <div className="dashboard-section profile-identity-card">
                    <div className="profile-avatar-large">
                        {user?.avatar || "JR"}
                    </div>

                    <h2>{user?.name || "Jayasurya R"}</h2>
                    <span className="profile-badge-pill">{user?.role || "Senior Maintenance Engineer"}</span>

                    <div className="profile-meta-list">
                        <div className="pml-item">
                            <Mail size={15} color="#00E5BF" />
                            <span>{user?.email || "sit24ec101@sairamtap.edu.in"}</span>
                        </div>
                        <div className="pml-item">
                            <Briefcase size={15} color="#8B5CF6" />
                            <span>{user?.department || "Mechanical Reliability"}</span>
                        </div>
                        <div className="pml-item">
                            <Clock size={15} color="#F59E0B" />
                            <span>{shift}</span>
                        </div>
                        <div className="pml-item">
                            <MapPin size={15} color="#10B981" />
                            <span>Bays A, B, C &amp; D (All 8 Units)</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="profile-logout-btn"
                    >
                        <LogOut size={16} />
                        <span>Sign Out of Platform</span>
                    </button>
                </div>

                {/* RIGHT: EDIT DETAILS & PERMISSIONS */}
                <div className="profile-details-col">
                    {/* EDIT FORM */}
                    <div className="dashboard-section">
                        <div className="section-header">
                            <div>
                                <div className="section-kicker">
                                    <Shield size={13} /> ACCOUNT INFORMATION
                                </div>
                                <h3>Edit Operator Details</h3>
                            </div>
                        </div>

                        {saveMsg && (
                            <div className="profile-success-banner">
                                <CheckCircle2 size={16} />
                                <span>{saveMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleSave} className="profile-form">
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Engineering Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Department / Plant Division</label>
                                    <input
                                        type="text"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Assigned Plant Shift</label>
                                    <select
                                        value={shift}
                                        onChange={(e) => setShift(e.target.value)}
                                    >
                                        <option value="Shift A (07:00 - 15:30)">Shift A (07:00 - 15:30)</option>
                                        <option value="Shift B (15:00 - 23:30)">Shift B (15:00 - 23:30)</option>
                                        <option value="Shift C (23:00 - 07:30)">Shift C (23:00 - 07:30)</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="login-submit-btn" style={{ width: "auto", minWidth: "180px", alignSelf: "flex-start" }}>
                                <Save size={15} />
                                <span>Save Changes</span>
                            </button>
                        </form>
                    </div>

                    {/* RBAC PERMISSIONS & RECENT ACTIONS */}
                    <div className="dashboard-section">
                        <div className="section-header">
                            <div>
                                <div className="section-kicker">
                                    <Shield size={13} /> SECURITY &amp; AUTHORIZATION
                                </div>
                                <h3>Role-Based Access Control (RBAC)</h3>
                            </div>
                        </div>

                        <div className="rbac-table-wrapper">
                            <table className="rbac-table">
                                <thead>
                                    <tr>
                                        <th>Platform Capability</th>
                                        <th>Scope</th>
                                        <th>Permission State</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Real-time Telemetry Polling</td>
                                        <td>All 8 Monitored Assets</td>
                                        <td><span className="rbac-granted">✓ Granted</span></td>
                                    </tr>
                                    <tr>
                                        <td>Diagnostic Anomaly Acknowledgment</td>
                                        <td>Alarm Console</td>
                                        <td><span className="rbac-granted">✓ Granted</span></td>
                                    </tr>
                                    <tr>
                                        <td>Work Order Dispatch</td>
                                        <td>Maintenance Module</td>
                                        <td><span className="rbac-granted">✓ Granted</span></td>
                                    </tr>
                                    <tr>
                                        <td>Fault Injection Simulation</td>
                                        <td>Academic Demo System</td>
                                        <td><span className="rbac-granted">✓ Granted</span></td>
                                    </tr>
                                    <tr>
                                        <td>Gateway Firmware Flashing (OTA)</td>
                                        <td>Hardware Level</td>
                                        <td><span className="rbac-admin">Admin Only</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* PROJECT TEAM PERSONNEL LIST */}
                    <div className="dashboard-section">
                        <div className="section-header">
                            <div>
                                <div className="section-kicker">
                                    <Users size={13} /> PROJECT TEAM ROSTER
                                </div>
                                <h3>Predictive Maintenance Project Team</h3>
                            </div>
                        </div>

                        <div className="team-members-grid">
                            <div className="team-member-card">
                                <div className="team-avatar-pill avatar-teal">JR</div>
                                <div className="team-meta">
                                    <strong>Jayasurya R</strong>
                                    <span className="team-role-tag">Senior Maintenance Engineer</span>
                                    <span className="team-email-tag">sit24ec101@sairamtap.edu.in</span>
                                </div>
                            </div>

                            <div className="team-member-card">
                                <div className="team-avatar-pill avatar-emerald">HA</div>
                                <div className="team-meta">
                                    <strong>Harish kumar A</strong>
                                    <span className="team-role-tag">Plant Operations Lead</span>
                                    <span className="team-email-tag">sit24ec105@sairamtap.edu.in</span>
                                </div>
                            </div>

                            <div className="team-member-card">
                                <div className="team-avatar-pill avatar-violet">UM</div>
                                <div className="team-meta">
                                    <strong>Umesh Madhu P</strong>
                                    <span className="team-role-tag">Industrial Systems Architect</span>
                                    <span className="team-email-tag">sit24ec086@sairamtap.edu.in</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
