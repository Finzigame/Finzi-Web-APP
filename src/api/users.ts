import { api } from "./client";

export type UserProfile = {
    user_id: string;
    email: string;
    display_name: string | null;
};

export type UserUpdatePayload = {
    email?: string;
    display_name?: string;
    password?: string;
};

export function getBellotas(user_id: string) {
    return api(`users/${user_id}/bellotas`, { method: "GET" });
}

export function getLives(user_id: string) {
    return api(`users/${user_id}/lives`, { method: "GET" });
}

export function purchaseLives(user_id: string, quantity: 1 | 4) {
    return api(`users/${user_id}/lives/purchase`, {
        method: "POST",
        json: { quantity },
    });
}

export function getProgress(user_id: string) {
    return api<{ completedLevels: string[]; unlockedLevels: string[]; failedLevels: string[]; visibleLevels: string[] }>(
        `users/${user_id}/progress`,
        { method: "GET" },
    );
}

export function getProfile(user_id: string) {
    return api<UserProfile>(`users/${user_id}/profile`, { method: "GET" });
}

export function updateProfile(user_id: string, payload: UserUpdatePayload) {
    return api<UserProfile>(`users/${user_id}/profile`, {
        method: "PATCH",
        json: payload,
    });
}
