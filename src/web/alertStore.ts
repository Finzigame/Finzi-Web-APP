import type { AlertButton } from 'react-native';

export type WebAlert = {
    id: number;
    title: string;
    message?: string;
    buttons: AlertButton[];
};

type Listener = (queue: WebAlert[]) => void;

let nextId = 1;
let queue: WebAlert[] = [];
const listeners = new Set<Listener>();

const emit = () => listeners.forEach((l) => l(queue));

export function pushAlert(title: string, message?: string, buttons?: AlertButton[]) {
    const safeButtons = buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }];
    queue = [...queue, { id: nextId++, title, message, buttons: safeButtons }];
    emit();
}

export function dismissAlert(id: number) {
    queue = queue.filter((a) => a.id !== id);
    emit();
}

export function subscribeAlerts(listener: Listener) {
    listeners.add(listener);
    listener(queue);
    return () => {
        listeners.delete(listener);
    };
}
