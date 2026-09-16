import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
    Cpu,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    AlertCircle,
    CheckCircle2,
    Shield,
    Activity,
    Brain,
    HelpCircle
} from "lucide-react";

export default function LoginPage() {
    const { login, demoLogin, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/dashboard";

    const [email, setEmail] = useState("engineer@esa.io");
    const [password, setPassword] = useState("engineer123");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState("");
    const [showForgotModal, setShowForgotModal] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await login(email, password, rememberMe);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || "Failed to sign in. Please verify credentials.");
        }
    };

    const handleDemo = async (role) => {
        setError("");
        try {
            await demoLogin(role);
            navigate(from, { replace: true });
        } catch (err) {
            setError("Demo sign-in failed.");
        }
    };

    return (
        <div className="login-page">
            {/* LEFT SIDE: INDUSTRIAL VISUAL HERO */}
            <div className="login-hero-side">
                <div className="login-hero-bg"></div>
                <div className="login-hero-overlay"></div>

                <div className="login-hero-content">
                    <div className="login-brand">
                        <div className="login-logo-icon">
                            <Cpu size={26} />
                        </div>
                        <div className="login-brand-text">
                            <h2>ESA DASHBOARD</h2>
                            <span>Edge AI Based Predictive Maintenance</span>
                        </div>
                    </div>

                    <div className="login-hero-middle">
                        <div className="login-hero-pill">
                            <Activity size={14} />
                            <span>INDUSTRY 4.0 DIAGNOSTICS</span>
                        </div>
                        <h1>Intelligent Industrial Machinery Monitoring</h1>
                        <p>
                            Continuous multi-sensor telemetry, Edge AI degradation forecasting,
                            and prescriptive maintenance intervention for high-reliability factory assets.
                        </p>

                        <div className="login-feature-list">
                            <div className="login-feature-item">
                                <CheckCircle2 size={16} color="#00E5BF" />
                                <span>Sub-second vibration, temperature & electrical load telemetry</span>
                            </div>
                            <div className="login-feature-item">
                                <CheckCircle2 size={16} color="#00E5BF" />
                                <span>Automated root cause classification & Remaining Useful Life (RUL)</span>
                            </div>
                            <div className="login-feature-item">
                                <CheckCircle2 size={16} color="#00E5BF" />
                                <span>Context-aware AI Maintenance Copilot for floor engineers</span>
                            </div>
                        </div>
                    </div>

                    <div className="login-hero-footer">
                        <span>Ready for hardware gateway integration (ESP32, RTD, MPU6050, CT sensors)</span>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: AUTHENTICATION CARD */}
            <div className="login-form-side">
                <div className="login-card">
                    <div className="login-card-header">
                        <div className="login-mobile-brand">
                            <Cpu size={22} color="#00E5BF" />
                            <span>ESA DASHBOARD</span>
                        </div>
                        <h2>Welcome back</h2>
                        <p>Sign in to monitor and diagnose your industrial assets.</p>
                    </div>

                    {error && (
                        <div className="login-error-banner" role="alert">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="login-field-group">
                            <label htmlFor="login-email">Email Address or Username</label>
                            <div className="login-input-wrapper">
                                <Mail size={16} className="input-icon" />
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="e.g. engineer@esa.io"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="login-field-group">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <label htmlFor="login-password">Password</label>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(true)}
                                    className="login-forgot-link"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="login-input-wrapper">
                                <Lock size={16} className="input-icon" />
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="password-toggle-btn"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="login-options-row">
                            <label className="remember-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>Remember this session</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="login-submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <span>Authenticating credentials...</span>
                            ) : (
                                <>
                                    <span>Sign In to Dashboard</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* DEMO / QUICK ACCESS TILES */}
                    <div className="login-demo-section">
                        <div className="login-divider">
                            <span>OR 1-CLICK DEMO ACCESS</span>
                        </div>

                        <div className="demo-accounts-grid">
                            <button
                                type="button"
                                onClick={() => handleDemo("engineer")}
                                className="demo-account-chip"
                                disabled={loading}
                            >
                                <span className="demo-chip-role">Maintenance Engineer</span>
                                <span className="demo-chip-email">engineer@esa.io</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleDemo("operator")}
                                className="demo-account-chip"
                                disabled={loading}
                            >
                                <span className="demo-chip-role">Plant Operator</span>
                                <span className="demo-chip-email">operator@esa.io</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleDemo("admin")}
                                className="demo-account-chip"
                                disabled={loading}
                            >
                                <span className="demo-chip-role">System Admin</span>
                                <span className="demo-chip-email">admin@esa.io</span>
                            </button>
                        </div>

                        <p className="demo-security-disclaimer">
                            <Shield size={12} style={{ display: "inline", marginRight: "4px" }} />
                            Academic Demo Mode • Ready for Enterprise JWT / OAuth2 integration.
                        </p>
                    </div>
                </div>
            </div>

            {/* FORGOT PASSWORD MODAL */}
            {showForgotModal && (
                <div className="modal-backdrop" onClick={() => setShowForgotModal(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                            <HelpCircle size={22} color="#00E5BF" />
                            <h3 style={{ margin: 0, color: "#F8FAFC" }}>Password Reset</h3>
                        </div>
                        <p style={{ fontSize: "13px", color: "#94A3B8", lineHeight: 1.5, margin: "0 0 16px" }}>
                            In demo/academic mode, you can sign in instantly using any of the three pre-configured accounts:
                        </p>
                        <ul style={{ fontSize: "12px", color: "#CBD5E1", margin: "0 0 18px", paddingLeft: "20px", lineHeight: 1.8 }}>
                            <li><code>engineer@esa.io</code> / <code>engineer123</code> (Engineer)</li>
                            <li><code>operator@esa.io</code> / <code>operator123</code> (Operator)</li>
                            <li><code>admin@esa.io</code> / <code>admin123</code> (Admin)</li>
                        </ul>
                        <button
                            type="button"
                            className="login-submit-btn"
                            onClick={() => setShowForgotModal(false)}
                        >
                            Close & Return to Login
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
