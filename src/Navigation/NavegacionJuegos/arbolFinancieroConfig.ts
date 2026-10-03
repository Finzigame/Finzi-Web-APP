import type { GameType } from './levelConfig';
import type { BellotaSublevel, BellotaUnit } from './bellotaConfig';

export type { BellotaSublevel, BellotaUnit };

// Lecciones del Nivel 4 — Árbol Financiero.
// Solo Lección 17 tiene contenido en el piloto; las demás se muestran bloqueadas.
export const ARBOL_FINANCIERO_UNITS: Record<number, BellotaUnit> = {
    15: {
        title: 'Lección 15',
        testUnlocked: false,
        testGame: 'none' as GameType,
        sublevels: [] as BellotaSublevel[],
    },
    16: {
        title: 'Lección 16',
        testUnlocked: false,
        testGame: 'none' as GameType,
        sublevels: [] as BellotaSublevel[],
    },
    17: {
        title: 'Impuestos',
        testUnlocked: true,
        testGame: 'quizMultiple' as GameType,
        sublevels: [
            { id: '4.17.1', game: 'quizBellota',  unlocked: true },
            { id: '4.17.2', game: 'classify',     unlocked: true },
            { id: '4.17.3', game: 'detectaError', unlocked: true },
            { id: '4.17.4', game: 'decision',     unlocked: true },
            { id: '4.17.5', game: 'detectaError', unlocked: true },
        ] as BellotaSublevel[],
    },
    18: {
        title: 'Lección 18',
        testUnlocked: false,
        testGame: 'none' as GameType,
        sublevels: [] as BellotaSublevel[],
    },
    19: {
        title: 'Lección 19',
        testUnlocked: false,
        testGame: 'none' as GameType,
        sublevels: [] as BellotaSublevel[],
    },
    20: {
        title: 'Lección 20',
        testUnlocked: false,
        testGame: 'none' as GameType,
        sublevels: [] as BellotaSublevel[],
    },
    21: {
        title: 'Lección 21',
        testUnlocked: false,
        testGame: 'none' as GameType,
        sublevels: [] as BellotaSublevel[],
    },
};

export function ARBOL_FINANCIERO_UNIT_LIST(visibleLevels: string[]) {
    const visibleSet = new Set(visibleLevels);
    return Object.entries(ARBOL_FINANCIERO_UNITS)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([key, value]) => ({ unitKey: Number(key), ...value }))
        .filter(unit => unit.sublevels.some(sl => visibleSet.has(sl.id)));
}
