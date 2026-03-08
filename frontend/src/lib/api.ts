const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://railsaathi.onrender.com/api";

// Authentication utilities
export const setAuthToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
    }
};

export const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth_token');
    }
    return null;
};

export const removeAuthToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
    }
};

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = getAuthToken();
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
};

// Authentication API calls
export async function registerUser(email: string, password: string) {
    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error("Registration failed");
        return await res.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function loginUser(email: string, password: string) {
    try {
        const res = await fetch('https://railsaathi.onrender.com/api/auth/login', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error("Login failed");
        const data = await res.json();
        setAuthToken(data.access_token);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getCurrentUser() {
    try {
        const res = await fetch(`${API_BASE}/auth/me`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error("Failed to get user");
        return await res.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function fetchCrowdPrediction(station: string, train_type: string) {
    try {
        const now = new Date();
        const dateStr = now.toISOString().split("T")[0];
        const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        const res = await fetch(`${API_BASE}/predict-crowd`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                station,
                date: dateStr,
                time: timeStr,
                train_type
            })
        });
        if (!res.ok) throw new Error("API Error");
        return await res.json();
    } catch (error) {
        console.error(error);
        return null; // Fallback handled by component
    }
}

export async function fetchDelayPrediction(station: string, train_type: string) {
    try {
        const now = new Date();
        const dateStr = now.toISOString().split("T")[0];
        const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        const res = await fetch(`${API_BASE}/predict-delay`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                station,
                date: dateStr,
                time: timeStr,
                train_type
            })
        });
        if (!res.ok) throw new Error("API Error");
        return await res.json();
        // Removed console.error to keep frontend terminal clean when ML backend is offline
    } catch (error) {
        return null;
    }
}

export async function fetchBestTime(station: string, train_type: string) {
    try {
        const now = new Date();
        // Round to next hour for best commute suggestion basis
        now.setHours(now.getHours() + 1);
        now.setMinutes(0);
        const dateStr = now.toISOString().split("T")[0];
        const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        const res = await fetch(`${API_BASE}/best-travel-time`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                station,
                date: dateStr,
                time: timeStr,
                train_type
            })
        });
        if (!res.ok) throw new Error("API Error");
        return await res.json();
        // Removed console.error to keep frontend terminal clean when ML backend is offline
    } catch (error) {
        return null;
    }
}

// --- LAYER 2 API CALLS ---

export async function fetchSeatPrediction(station: string, train_type: string) {
    try {
        const now = new Date();
        const dateStr = now.toISOString().split("T")[0];
        const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        const res = await fetch(`${API_BASE}/predict-seat`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                station,
                date: dateStr,
                time: timeStr,
                train_type
            })
        });
        if (!res.ok) throw new Error("API Error");
        return await res.json();
        // Removed console.error to keep frontend terminal clean when ML backend is offline
    } catch (error) {
        return null;
    }
}

export async function fetchStressIndex(station: string, train_type: string) {
    try {
        const now = new Date();
        const dateStr = now.toISOString().split("T")[0];
        const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        const res = await fetch(`${API_BASE}/analyze-stress`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                station,
                date: dateStr,
                time: timeStr,
                train_type
            })
        });
        if (!res.ok) throw new Error("API Error");
        return await res.json();
        // Removed console.error to keep frontend terminal clean when ML backend is offline
    } catch (error) {
        return null;
    }
}

export async function fetchRouteOptimization(source: string, destination: string, preference: string = "balanced") {
    try {
        const now = new Date();
        const dateStr = now.toISOString().split("T")[0];
        const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        const res = await fetch(`${API_BASE}/route-optimize`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                source,
                destination,
                date: dateStr,
                time: timeStr,
                preference
            })
        });
        if (!res.ok) throw new Error("API Error");
        return await res.json();
    } catch (error) {
        return null;
    }
}

// --- NEW API CALLS ---

export async function fetchMobilityOptimalRoute(source: string, destination: string, time: string, preference: string = "balanced") {
    try {
        const res = await fetch(`${API_BASE}/route-optimize`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                source,
                destination,
                time,
                preference
            })
        });
        if (!res.ok) throw new Error("API Error");
        return await res.json();
    } catch (error) {
        return null;
    }
}

export async function fetchComfortPrediction(station: string, time: string, train_type: string = "fast") {
    try {

        const crowdRes = await fetch(`${API_BASE}/predict-crowd`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ station, time, train_type })
        });

        const seatRes = await fetch(`${API_BASE}/predict-seat`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ station, time, train_type })
        });

        const stressRes = await fetch(`${API_BASE}/analyze-stress`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ station, time, train_type })
        });

        if (!crowdRes.ok || !seatRes.ok || !stressRes.ok) throw new Error("API Error");

        const crowd = await crowdRes.json();
        const seat = await seatRes.json();
        const stress = await stressRes.json();

        return {
            crowd,
            seat,
            stress
        };

    } catch (error) {
        return null;
    }
}