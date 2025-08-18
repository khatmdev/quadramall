import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
    id: string;
    type: 'new_order' | 'status_update';
    orderId: number;
    message: string;
    timestamp: Date;
    read: boolean;
}

interface NotificationSlice {
    notifications: Notification[];
}

const initialState: NotificationSlice = {
    notifications: [],
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
            const newNotification: Notification = {
                ...action.payload,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                timestamp: new Date(),
                read: false,
            };
            state.notifications.unshift(newNotification);
            if (state.notifications.length > 50) {
                state.notifications = state.notifications.slice(0, 50);
            }
        },
        markAsRead: (state, action: PayloadAction<string>) => {
            const notification = state.notifications.find((n) => n.id === action.payload);
            if (notification) {
                notification.read = true;
            }
        },
        markAllAsRead: (state) => {
            state.notifications.forEach((notification) => {
                notification.read = true;
            });
        },
        clearAllNotifications: (state) => {
            state.notifications = [];
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter((n) => n.id !== action.payload);
        },
    },
});

export const { addNotification, markAsRead, markAllAsRead, clearAllNotifications, removeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;