import { API_URL } from "./config/env";

type ApiOptions = RequestInit & { json?: any };

let _token: string | null = null;

export function setAuthToken(token: string | null) {
    _token = token;
}

export async function api<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as any),
    };

    if (_token) {
        headers["Authorization"] = `Bearer ${_token}`;
    }

    const cleanUrl = API_URL.replace(/\/$/, "");
    const cleanPath = path.replace(/^\//, "");

    let res: Response;
    try {
        res = await fetch(`${cleanUrl}/${cleanPath}`, {
            ...options,
            headers,
            body: options.json ? JSON.stringify(options.json) : options.body,
        });
    } catch (err) {
        console.error("Fetch error:", err);
        throw new Error("Error de conexión: No se pudo contactar con el servidor. Revisa tu internet o la URL de la API.");
    }

    const text = await res.text();
    const data = text ? safeJson(text) : null;

    if (!res.ok) {
        const message = (data && (data.detail || data.message)) || text || `HTTP ${res.status}`;
        throw new Error(message);
    }

    return data as T;
}

function safeJson(s: string) {
    try { return JSON.parse(s); } catch { return null; }
}
