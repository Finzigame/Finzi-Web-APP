import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "finzi_session";

export type Session = { user_id: string; email: string; display_name?: string | null; access_token: string };

export async function saveSession(s: Session) {
    await AsyncStorage.setItem(KEY, JSON.stringify(s));
}
export async function loadSession(): Promise<Session | null> {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
}
export async function clearSession() {
    await AsyncStorage.removeItem(KEY);
}
