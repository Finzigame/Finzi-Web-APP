import type { GameType } from './levelConfig';

export type BellotaSublevel = {
    id: string;
    game: GameType;
    unlocked: boolean;
};

export type BellotaUnit = {
    title: string;
    testUnlocked: boolean;
    testGame: GameType;
    sublevels: BellotaSublevel[];
};

/**
 * Config hash map para el mundo Bellota.
 * Cada clave es el número de unidad.
 * Para agregar/quitar subniveles: editar solo la lista `sublevels` de la unidad.
 * El nodo de test se genera automáticamente al final de cada unidad.
 *
 * game  → minijuego que se lanza al presionar el nodo (igual que en levelConfig.tsx)
 * testGame → minijuego del nodo test al final de la unidad
 */
export const BELLOTA_UNITS: Record<number, BellotaUnit> = {
    1: {
        title: 'Fundamentos',
        testUnlocked: true,
        testGame: 'quizMultiple',
        sublevels: [
            { id: '1.1', game: 'quizBellota',   unlocked: true },
            { id: '1.2', game: 'quizMultiple',  unlocked: true },
            { id: '1.3', game: 'juegocalc',     unlocked: true },
            { id: '1.4', game: 'classify',       unlocked: true },
            { id: '1.5', game: 'completaFrase', unlocked: true },
            { id: '1.6', game: 'decision',      unlocked: true },
            { id: '1.7', game: 'compara',       unlocked: true },
        ],
    },
    2: {
        title: 'Ahorro e Inversión',
        testUnlocked: true,
        testGame: 'detectaError',
        sublevels: [
            { id: '2.1', game: 'quizBellota',   unlocked: true },
            { id: '2.2', game: 'classify',      unlocked: true },
            { id: '2.3', game: 'completaFrase', unlocked: true },
            { id: '2.4', game: 'classify',      unlocked: true },
            { id: '2.5', game: 'decision',      unlocked: true },
        ],
    },
    3: {
        title: 'Crédito y Buró',
        testUnlocked: true,
        testGame: 'detectaError',
        sublevels: [
            { id: '3.1', game: 'quizBellota',   unlocked: true },
            { id: '3.2', game: 'classify',      unlocked: true },
        ],
    },
    4: {
        title: 'Seguros e Impuestos',
        testUnlocked: false,
        testGame: 'none',
        sublevels: [
            { id: '4.1', game: 'decision',      unlocked: true },
            { id: '4.2', game: 'detectaError',  unlocked: true },
        ],
    },
};

// ─── Utilidades ───────────────────────────────────────────────────────────────

/** Lista ordenada de unidades como array (para iterar en el render). */
export const BELLOTA_UNIT_LIST = Object.entries(BELLOTA_UNITS)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([key, value]) => ({ unitKey: Number(key), ...value }));

/**
 * Patrón de posiciones X en zigzag (% de ancho de pantalla).
 * Se cicla si hay más nodos que entradas en el array.
 */
export const ZIGZAG_X_PATTERN = [50, 72, 28, 68, 32, 55, 25, 70];

/**
 * Calcula posiciones (bottom %, left %) para todos los nodos de una unidad,
 * incluyendo el test final.
 *
 * `bottom` = % desde el fondo de la sección (igual que responsiveHeight en los componentes).
 * `left`   = % desde el lado izquierdo de la pantalla.
 */
export function computeZigzagPositions(sublevelCount: number): { bottom: number; left: number }[] {
    const total = sublevelCount + 1; // +1 para el test
    const yFirst = 52;  // % del primer subnivel (bajo el header)
    const yTest  = 1;   // % del test (muy al fondo)
    const step   = sublevelCount > 0 ? (yFirst - yTest) / sublevelCount : 0;

    return Array.from({ length: total }, (_, i) => ({
        bottom: i < sublevelCount ? yFirst - i * step : yTest,
        left:   ZIGZAG_X_PATTERN[i % ZIGZAG_X_PATTERN.length],
    }));
}
