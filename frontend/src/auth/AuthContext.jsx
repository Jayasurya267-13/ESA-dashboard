import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = [
    {
        email: "sit24ec101@sairamtap.edu.in",
        password: "engineer123",
        name: "Jayasurya R",
        role: "Senior Maintenance Engineer",
        department: "Mechanical Reliability",
        badgeId: "ESA-ENG-402",
        avatar: "JR"
    },
    {
        email: "sit24ec105@sairamtap.edu.in",
        password: "operator123",
        name: "Harish kumar A",
        role: "Plant Operations Lead",
        department: "Production Floor A",
        badgeId: "ESA-OPS-109",
        avatar: "HA"
    },
    {
        email: "sit24ec086@sairamtap.edu.in",
        password: "admin123",
        name: "Umesh Madhu P",
        role: "Industrial Systems Architect",
        department: "Edge AI & IoT Systems",
        badgeId: "ESA-ADM-001",
        avatar: "UM"
    }
];

const STORAGE_KEY = "esa_auth_user";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Automatically migrate previously stored demo identity to project team identity
                if (parsed.email === "engineer@esa.io" || parsed.name === "Alex Morgan") {
                    return { ...DEMO_ACCOUNTS[0], loginTime: parsed.loginTime || new Date().toISOString() };
                }
                if (parsed.email === "operator@esa.io" || parsed.name === "David Chen") {
                    return { ...DEMO_ACCOUNTS[1], loginTime: parsed.loginTime || new Date().toISOString() };
                }
                if (parsed.email === "admin@esa.io" || parsed.name === "Elena Rostova") {
                    return { ...DEMO_ACCOUNTS[2], loginTime: parsed.loginTime || new Date().toISOString() };
                }
                return parsed;
            }
            return null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(false);

    const login = async (email, password, rememberMe = true) => {
        setLoading(true);
        // Simulate network latency
        await new Promise((resolve) => setTimeout(resolve, 400));

        const matched = DEMO_ACCOUNTS.find(
            (acc) =>
                acc.email.toLowerCase() === email.trim().toLowerCase() &&
                acc.password === password
        );

        if (!matched) {
            setLoading(false);
            throw new Error("Invalid email or password. You may use a demo account below.");
        }

        const sessionUser = {
            ...matched,
            loginTime: new Date().toISOString()
        };

        setUser(sessionUser);
        if (rememberMe) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
        } else {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
        }

        setLoading(false);
        return sessionUser;
    };

    const demoLogin = async (role = "engineer") => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
        let matched = DEMO_ACCOUNTS[0];
        if (role === "operator") matched = DEMO_ACCOUNTS[1];
        if (role === "admin") matched = DEMO_ACCOUNTS[2];

        const sessionUser = {
            ...matched,
            loginTime: new Date().toISOString()
        };
        setUser(sessionUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
        setLoading(false);
        return sessionUser;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
    };

    const updateProfile = (updates) => {
        setUser((prev) => {
            const updated = { ...prev, ...updates };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                loading,
                login,
                demoLogin,
                logout,
                updateProfile
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
