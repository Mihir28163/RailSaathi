const API_BASE = "http://localhost:8000/api";

export async function fetchCrowdPrediction(station: string, train_type: string) {
    try {
        const now = new Date();
        const dateStr = now.toISOString().split("T")[0];
        const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        const res = await fetch(`${API_BASE}/predict-crowd`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
            headers: { "Content-Type": "application/json" },
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
            headers: { "Content-Type": "application/json" },
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
            headers: { "Content-Type": "application/json" },
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
            headers: { "Content-Type": "application/json" },
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
            headers: { "Content-Type": "application/json" },
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
