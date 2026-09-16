import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import "./App.css";

import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import MachinesPage from "./pages/MachinesPage";
import MachineDetailsPage from "./pages/MachineDetailsPage";
import AlertsPage from "./pages/AlertsPage";
import MaintenancePage from "./pages/MaintenancePage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

/**
 * Main application layout for authenticated routes.
 * Houses the sticky Sidebar, Top Header, and active Page View.
 */
function AppLayout() {
    const [headerMeta, setHeaderMeta] = useState({
        activeMachineName: "Motor Pump 01",
        connectionStatus: "Connected",
        alertCount: 2
    });

    const handleTelemetrySync = (syncData) => {
        if (!syncData) return;
        setHeaderMeta((prev) => ({
            ...prev,
            activeMachineName: syncData.machineName || prev.activeMachineName,
            connectionStatus: syncData.connectionStatus || prev.connectionStatus,
        }));
    };

    return (
        <div className="app">
            <Sidebar />
            <main className="main-content">
                <Header
                    connectionStatus={headerMeta.connectionStatus}
                    activeMachineName={headerMeta.activeMachineName}
                    alertCount={headerMeta.alertCount}
                />
                <Outlet context={{ handleTelemetrySync }} />
            </main>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* PUBLIC ROUTE: SPLIT-SCREEN AUTHENTICATION */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* PROTECTED ROUTES: REQUIRING ACTIVE OPERATOR SESSION */}
                    <Route
                        element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/machines" element={<MachinesPage />} />
                        <Route path="/machines/:machineId" element={<MachineDetailsPage />} />
                        <Route path="/alerts" element={<AlertsPage />} />
                        <Route path="/maintenance" element={<MaintenancePage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />

                        {/* CATCH-ALL REDIRECT */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;