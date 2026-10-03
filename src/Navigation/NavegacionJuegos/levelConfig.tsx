export type GameType = 'quizBellota' | 'quizMultiple' | 'juegocalc' | 'completaFrase' | 'detectaError' | 'compara' | 'decision' | 'classify' | 'none';

export type LevelType = 'level' | 'test';

export type LevelConfig = {
    id: string;
    unit: number;
    order: number;
    title: string;
    type: LevelType;
    game: GameType;
    unlocked: boolean;
    // Mapeo al backend: levelSlug/micro
    levelSlug: string;
    micro: number;
};

export const LEVELS_CONFIG: LevelConfig[] = [
    // Unidad 1: Fundamentos (Micros 1-8)
    { id: '1.1', unit: 1, order: 1, title: 'Nivel 1',          type: 'level', game: 'quizBellota',   unlocked: true, levelSlug: 'bellota', micro: 1 },
    { id: '1.2', unit: 1, order: 2, title: 'Nivel 2',          type: 'level', game: 'quizMultiple',  unlocked: true, levelSlug: 'bellota', micro: 2 },
    { id: '1.3', unit: 1, order: 3, title: 'Nivel 3',          type: 'level', game: 'juegocalc',     unlocked: true, levelSlug: 'bellota', micro: 3 },
    { id: '1.4',   unit: 1, order: 4, title: 'Ordena el Bosque',   type: 'level', game: 'classify',      unlocked: true, levelSlug: 'bellota', micro: 4 },
    { id: '1.5',   unit: 1, order: 5, title: 'Completa la Frase', type: 'level', game: 'completaFrase', unlocked: true, levelSlug: 'bellota', micro: 5 },
    { id: '1.test', unit: 1, order: 6, title: 'Test Unidad 1',    type: 'test',  game: 'quizMultiple',  unlocked: true, levelSlug: 'bellota', micro: 6 },
    { id: '1.6',   unit: 1, order: 7, title: '¿Qué Harías Tú?',  type: 'level', game: 'decision',      unlocked: true, levelSlug: 'bellota', micro: 7 },
    { id: '1.7',   unit: 1, order: 8, title: 'Compara y Decide',  type: 'level', game: 'compara',       unlocked: true, levelSlug: 'bellota', micro: 8 },

    // Unidad 2: Ahorro e Inversión (Micros 9-14)
    { id: '2.1',   unit: 2, order: 1, title: 'El Totalero',              type: 'level', game: 'quizBellota',  unlocked: true, levelSlug: 'bellota', micro: 9  },
    { id: '2.2',   unit: 2, order: 2, title: 'Historial Crediticio',     type: 'level', game: 'classify',     unlocked: true, levelSlug: 'bellota', micro: 10 },
    { id: '2.3',   unit: 2, order: 3, title: 'Completa la Frase: Seguros', type: 'level', game: 'completaFrase', unlocked: true, levelSlug: 'bellota', micro: 11 },
    { id: '2.4',   unit: 2, order: 4, title: 'Tipos de Seguros',         type: 'level', game: 'classify',     unlocked: true, levelSlug: 'bellota', micro: 12 },
    { id: '2.5',   unit: 2, order: 5, title: 'El Dilema del Seguro',     type: 'level', game: 'decision',     unlocked: true, levelSlug: 'bellota', micro: 13 },
    { id: '2.test', unit: 2, order: 6, title: 'Mitos de Seguros',        type: 'test',  game: 'detectaError', unlocked: true, levelSlug: 'bellota', micro: 14 },

    // Unidad 3: Crédito y Buró (Micros 15-17)
    { id: '3.1',   unit: 3, order: 1, title: 'Ladrones Invisibles',      type: 'level', game: 'quizBellota',  unlocked: true, levelSlug: 'bellota', micro: 15 },
    { id: '3.2',   unit: 3, order: 2, title: 'Tipos de Impuestos',       type: 'level', game: 'classify',     unlocked: true, levelSlug: 'bellota', micro: 16 },
    { id: '3.test', unit: 3, order: 3, title: 'RFC y Freelance',         type: 'test',  game: 'detectaError', unlocked: true, levelSlug: 'bellota', micro: 17 },

    // Unidad 4: Seguros e Impuestos (Micros 18-19)
    { id: '4.1',   unit: 4, order: 1, title: 'Hábitos Fiscales',         type: 'level', game: 'decision',     unlocked: true, levelSlug: 'bellota', micro: 18 },
    { id: '4.2',   unit: 4, order: 2, title: 'RESICO',                   type: 'level', game: 'detectaError', unlocked: true, levelSlug: 'bellota', micro: 19 },

    // Árbol Financiero — Nivel 4, Lección 17: Impuestos (única lección activa en el piloto)
    { id: '4.17.1', unit: 17, order: 1, title: 'Impuestos: V o F',          type: 'level', game: 'quizBellota',  unlocked: true, levelSlug: 'arbol-financiero', micro: 1 },
    { id: '4.17.2', unit: 17, order: 2, title: 'Clasifica los Impuestos',   type: 'level', game: 'classify',     unlocked: true, levelSlug: 'arbol-financiero', micro: 2 },
    { id: '4.17.3', unit: 17, order: 3, title: 'RFC y Freelance',           type: 'level', game: 'detectaError', unlocked: true, levelSlug: 'arbol-financiero', micro: 3 },
    { id: '4.17.4', unit: 17, order: 4, title: 'Hábitos Fiscales',          type: 'level', game: 'decision',     unlocked: true, levelSlug: 'arbol-financiero', micro: 4 },
    { id: '4.17.5', unit: 17, order: 5, title: 'RESICO',                    type: 'level', game: 'detectaError', unlocked: true, levelSlug: 'arbol-financiero', micro: 5 },
    { id: '17.test', unit: 17, order: 6, title: 'Test Impuestos y SAT',    type: 'test',  game: 'quizMultiple',  unlocked: true, levelSlug: 'arbol-financiero', micro: 6 },
];

// Mapa de (levelSlug, micro) → levelId para lookup rápido desde el backend
export const MICRO_TO_LEVEL_ID: Record<string, string> = Object.fromEntries(
    LEVELS_CONFIG.map(l => [`${l.levelSlug}/${l.micro}`, l.id])
);
