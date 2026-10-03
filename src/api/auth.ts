import { api } from "./client";

export function register(email: string, password: string, display_name?: string) {
    return api("/auth/register", { method: "POST", json: { email, password, display_name } });
}

export function login(identifier: string, password: string) {
    return api("/auth/login", { method: "POST", json: { identifier, password } });
}

export function logout(user_id: string) {
    return api("/auth/logout", { method: "POST", json: { user_id } });
}

export function forgotPassword(email: string) {
    return api("/auth/forgot-password", { method: "POST", json: { email } });
}

export function resetPassword(email: string, code: string, new_password: string) {
    return api("/auth/reset-password", { method: "POST", json: { email, code, new_password } });
}
