import React, { createContext, useEffect, useMemo, useState } from "react";
import * as AuthAPI from "../auth";
import { clearSession, loadSession, saveSession, Session } from "../storage/session";
import { setAuthToken } from "../client";

type AuthState = {
    session: Session | null;
    initializing: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, display_name?: string) => Promise<void>;
    logout: () => Promise<void>;
    updateLocalSession: (data: Partial<Session>) => Promise<void>;
};

export const AuthContext = createContext<AuthState>(null as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        (async () => {
            const s = await loadSession();
            if (s?.access_token) {
                setAuthToken(s.access_token);
            }
            setSession(s);
            setInitializing(false);
        })();
    }, []);

    const value = useMemo<AuthState>(() => ({
        session,
        initializing,
        login: async (email, password) => {
            const res = await AuthAPI.login(email, password);
            const s: Session = {
                user_id: res.user_id,
                email: res.email,
                display_name: res.display_name,
                access_token: res.access_token,
            };
            setAuthToken(res.access_token);
            await saveSession(s);
            setSession(s);
        },
        register: async (email, password, display_name) => {
            const res = await AuthAPI.register(email, password, display_name);
            const loginRes = await AuthAPI.login(email, password);
            const s: Session = {
                user_id: loginRes.user_id,
                email: loginRes.email,
                display_name: loginRes.display_name,
                access_token: loginRes.access_token,
            };
            setAuthToken(loginRes.access_token);
            await saveSession(s);
            setSession(s);
        },
        logout: async () => {
            const userId = session?.user_id;
            
            // 1. Limpiar estado local inmediatamente
            setAuthToken(null);
            setSession(null);
            await clearSession();

            // 2. Intentar llamar a la API de logout en segundo plano
            if (userId) {
                try {
                    await AuthAPI.logout(userId);
                } catch (e) {
                    console.error("Logout API error (non-blocking):", e);
                }
            }
        },
        updateLocalSession: async (data) => {
            if (session) {
                const newSession = { ...session, ...data };
                await saveSession(newSession);
                setSession(newSession);
            }
        }
    }), [session, initializing]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
