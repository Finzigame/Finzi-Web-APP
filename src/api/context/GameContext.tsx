import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { getBellotas, getLives, getProgress } from '../users';
import { DEV_USER_ID, UNLOCK_ALL_LEVELS_FOR_TESTING, USE_DEV_USER } from '../config/env';
import { LEVELS_CONFIG, MICRO_TO_LEVEL_ID } from '../../Navigation/NavegacionJuegos/levelConfig';

const ALL_LEVEL_IDS: string[] = LEVELS_CONFIG.map(l => l.id);

export type RepasoStartData = {
    session_id: string;
    lives_left: number;
    total_items: number;
    game_type: string;
    question: Record<string, unknown>;
};

type GameContextType = {
    score: number;
    streak: number;
    lives: number;
    maxLives: number;
    secondsUntilNextLife: number | null;
    livesLoading: boolean;
    completedLevelIds: Set<string>;
    failedLevelIds: Set<string>;
    visibleLevelIds: Set<string>;
    isReviewMode: boolean;
    repasoStartData: RepasoStartData | null;
    setScore: (score: number) => void;
    setLives: (lives: number) => void;
    setIsReviewMode: (v: boolean) => void;
    setRepasoStartData: (d: RepasoStartData | null) => void;
    refreshScore: () => Promise<void>;
    refreshLives: () => Promise<void>;
    refreshProgress: () => Promise<void>;
    isLevelCompleted: (levelId: string) => boolean;
    isLevelUnlocked: (levelId: string) => boolean;
    isLevelFailed: (levelId: string) => boolean;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [lives, setLives] = useState(4);
    const [maxLives, setMaxLives] = useState(4);
    const [secondsUntilNextLife, setSecondsUntilNextLife] = useState<number | null>(null);
    const [livesLoading, setLivesLoading] = useState(false);
    const [completedLevelIds, setCompletedLevelIds] = useState<Set<string>>(new Set());
    const [unlockedLevelIds, setUnlockedLevelIds] = useState<Set<string>>(
        new Set(UNLOCK_ALL_LEVELS_FOR_TESTING ? ALL_LEVEL_IDS : ['1.1'])
    );
    const [failedLevelIds, setFailedLevelIds] = useState<Set<string>>(new Set());
    const [visibleLevelIds, setVisibleLevelIds] = useState<Set<string>>(
        new Set(UNLOCK_ALL_LEVELS_FOR_TESTING ? ALL_LEVEL_IDS : [])
    );
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [repasoStartData, setRepasoStartData] = useState<RepasoStartData | null>(null);
    const { session, initializing } = useContext(AuthContext);

    const receivedAtRef = useRef<number>(Date.now());
    const baseSecondsRef = useRef<number | null>(null);

    const getUserId = () => USE_DEV_USER ? DEV_USER_ID : session?.user_id;

    const refreshScore = async () => {
        const userId = getUserId();
        if (!userId) { setScore(0); return; }
        try {
            const res = await getBellotas(userId);
            setScore(typeof res.bellotas_balance === 'number' ? res.bellotas_balance : 0);
            setStreak(typeof res.streak_days === 'number' ? res.streak_days : 0);
        } catch {
            setScore(0);
        }
    };

    const refreshLives = async () => {
        const userId = getUserId();
        if (!userId) return;
        setLivesLoading(true);
        try {
            const res = await getLives(userId);
            setLives(res.current_lives ?? 4);
            setMaxLives(res.max_lives ?? 4);
            const secs = res.seconds_until_next_life ?? null;
            setSecondsUntilNextLife(secs);
            receivedAtRef.current = Date.now();
            baseSecondsRef.current = secs;
        } catch {
            // silently keep last state
        } finally {
            setLivesLoading(false);
        }
    };

    const refreshProgress = async () => {
        const userId = getUserId();
        if (!userId) return;
        try {
            const res = await getProgress(userId);
            const compIds = new Set<string>(res.completedLevels ?? []);
            const unlIds = new Set<string>(UNLOCK_ALL_LEVELS_FOR_TESTING ? ALL_LEVEL_IDS : (res.unlockedLevels ?? []));
            const failIds = new Set<string>(res.failedLevels ?? []);
            const visIds = new Set<string>(UNLOCK_ALL_LEVELS_FOR_TESTING ? ALL_LEVEL_IDS : (res.visibleLevels ?? []));
            setCompletedLevelIds(compIds);
            setUnlockedLevelIds(unlIds);
            setFailedLevelIds(failIds);
            setVisibleLevelIds(visIds);
        } catch {
            // silently keep last state
        }
    };

    const isLevelCompleted = (levelId: string) => completedLevelIds.has(levelId);

    const isLevelUnlocked = (levelId: string): boolean => {
        return unlockedLevelIds.has(levelId);
    };

    const isLevelFailed = (levelId: string): boolean => failedLevelIds.has(levelId);

    // Local countdown — ticks each second, re-syncs when countdown hits 0
    useEffect(() => {
        const interval = setInterval(() => {
            if (baseSecondsRef.current === null) return;
            const elapsed = Math.floor((Date.now() - receivedAtRef.current) / 1000);
            const remaining = baseSecondsRef.current - elapsed;
            if (remaining <= 0) {
                void refreshLives();
            } else {
                setSecondsUntilNextLife(remaining);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [session?.user_id]);

    useEffect(() => {
        if (!initializing) {
            void refreshScore();
            void refreshLives();
            void refreshProgress();
        }
    }, [initializing, session?.user_id]);

    return (
        <GameContext.Provider value={{
            score, streak, lives, maxLives, secondsUntilNextLife, livesLoading,
            completedLevelIds, failedLevelIds, visibleLevelIds, isReviewMode, repasoStartData,
            setScore, setLives, setIsReviewMode, setRepasoStartData,
            refreshScore, refreshLives, refreshProgress,
            isLevelCompleted, isLevelUnlocked, isLevelFailed,
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
