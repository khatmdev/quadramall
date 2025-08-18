import { useState } from 'react';

interface Notification {
    id: number;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
}

export const useNotification = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = (message: string, type: Notification['type']) => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, message, type }]);
    };

    const removeNotification = (id: number) => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    };

    return { notifications, addNotification, removeNotification };
};