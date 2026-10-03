import { api } from "./client";

export function startVf(level: string, micro: number, user_id: string, is_review = false) {
    return api(`/game/${level}/${micro}/start`, { method: "POST", json: { user_id, is_review } });
}

export function answerVf(level: string, micro: number, session_id: string, lesson_item_id: string, answer: boolean) {
    return api(`/game/${level}/${micro}/answer`, {
        method: "POST",
        json: { session_id, lesson_item_id, answer },
    });
}

export function startOm(level: string, micro: number, user_id: string, is_review = false) {
    return api(`/game/om/${level}/${micro}/start`, { method: "POST", json: { user_id, is_review } });
}

export function answerOm(level: string, micro: number, session_id: string, lesson_item_id: string, option_id: string) {
    return api(`/game/om/${level}/${micro}/answer`, {
        method: "POST",
        json: { session_id, lesson_item_id, option_id },
    });
}

export function getAllOmQuestions(level: string, micro: number) {
    return api<{ items: Array<{ lesson_item_id: string; label: string; position: number; options: Array<{ option_id: string; text: string; key: string }> }> }>(
        `/game/om/${level}/${micro}/all-questions`,
        { method: "GET" },
    );
}

export function startCalc(level: string, micro: number, user_id: string, is_review = false) {
    return api(`/game/calc/${level}/${micro}/start`, { method: "POST", json: { user_id, is_review } });
}

export function answerCalc(level: string, micro: number, session_id: string, lesson_item_id: string, user_answer: string) {
    return api(`/game/calc/${level}/${micro}/answer`, {
        method: "POST",
        json: { session_id, lesson_item_id, user_answer },
    });
}

export function startOrdena(level: string, micro: number, user_id: string, is_review = false) {
    return api(`/game/ordena/${level}/${micro}/start`, { method: "POST", json: { user_id, is_review } });
}

export function submitOrdenaBatch(
    level: string,
    micro: number,
    session_id: string,
    placements: Array<{ lesson_item_id: string; option_id: string }>,
) {
    return api(`/game/ordena/${level}/${micro}/submit`, {
        method: "POST",
        json: { session_id, placements },
    });
}

export function answerOrdena(
    level: string,
    micro: number,
    session_id: string,
    ordered_items: string[],
) {
    return api(`/game/ordena/${level}/${micro}/answer`, {
        method: "POST",
        json: { session_id, ordered_items },
    });
}

export function startDetecta(level: string, micro: number, user_id: string, is_review = false) {
    return api(`/game/detecta/${level}/${micro}/start`, { method: "POST", json: { user_id, is_review } });
}

export function answerDetecta(
    level: string,
    micro: number,
    session_id: string,
    selected_item_id: string,
) {
    return api(`/game/detecta/${level}/${micro}/answer`, {
        method: "POST",
        json: { session_id, selected_item_id },
    });
}

export function startDecision(level: string, micro: number, user_id: string, is_review = false) {
    return api(`/game/decision/${level}/${micro}/start`, { method: "POST", json: { user_id, is_review } });
}

export function answerDecision(level: string, micro: number, session_id: string, lesson_item_id: string, option_id: string) {
    return api(`/game/decision/${level}/${micro}/answer`, {
        method: "POST",
        json: { session_id, lesson_item_id, option_id },
    });
}

export function startClassify(level: string, micro: number, user_id: string, is_review = false) {
    return api(`/game/classify/${level}/${micro}/start`, { method: "POST", json: { user_id, is_review } });
}

export function answerClassify(
    level: string,
    micro: number,
    session_id: string,
    user_id: string,
    lesson_item_id: string,
    item_id: string,
    category_id: string,
) {
    return api(`/game/classify/${level}/${micro}/answer`, {
        method: "POST",
        json: { session_id, user_id, lesson_item_id, item_id, category_id },
    });
}

export function startCompar(level: string, micro: number, user_id: string, is_review = false) {
    return api(`/game/comparar/${level}/${micro}/start`, { method: "POST", json: { user_id, is_review } });
}

export function answerCompar(level: string, micro: number, session_id: string, lesson_item_id: string, answer: string) {
    return api(`/game/comparar/${level}/${micro}/answer`, {
        method: "POST",
        json: { session_id, lesson_item_id, answer },
    });
}

export function startRepaso(level: string, micro: number, user_id: string, original_session_id: string) {
    return api(`/game/repaso/${level}/${micro}/start`, {
        method: "POST",
        json: { user_id, original_session_id },
    });
}
