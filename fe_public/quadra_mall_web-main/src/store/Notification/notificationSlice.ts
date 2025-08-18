// src/store/Notification/notificationSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/main';
import { Notification } from '@/types/Notification/notification';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async ({ page = 1 }: { page?: number }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/notifications?page=${page - 1}&size=20`);
      const content = response.data.content.map((item: any) => ({
        ...item,
        isRead: item.read || false, // Ánh xạ read sang isRead
      }));
      return { content, totalPages: response.data.totalPages, page };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi tải thông báo');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: number, { rejectWithValue, dispatch }) => {
    try {
      await api.post(`/notifications/read/${notificationId}`);
      return notificationId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi đánh dấu đã đọc');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_v, { rejectWithValue, dispatch }) => {
    try {
      await api.post(`/notifications/read-all`);
      dispatch(fetchNotifications({ page: 1 })); // Fetch lại dữ liệu
      return null;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi đánh dấu tất cả đã đọc');
    }
  }
);

export const deleteNotifications = createAsyncThunk(
  'notifications/delete',
  async (notificationIds: number[], { rejectWithValue }) => {
    try {
      await api.delete('/notifications/delete', { data: notificationIds });
      return notificationIds;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi xóa thông báo');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      const noti = action.payload;
      const existingIndex = state.notifications.findIndex((n) => n.id === noti.id);
      if (existingIndex === -1) {
        state.notifications.unshift(noti);
        if (!noti.isRead) state.unreadCount += 1;
      } else {
        // Cập nhật thông báo hiện có từ WebSocket
        const prevIsRead = state.notifications[existingIndex].isRead;
        state.notifications[existingIndex] = {
          ...noti,
          isRead: noti.read !== undefined ? noti.read : noti.isRead, // Ưu tiên read từ WebSocket
        };
        if (prevIsRead && !noti.isRead) state.unreadCount += 1;
        else if (!prevIsRead && noti.isRead) state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.unreadCount = state.notifications.filter((n) => !n.isRead).length; // Tính lại chính xác
    },
    markAsRead: (state, action: PayloadAction<number>) => {
      const noti = state.notifications.find((n) => n.id === action.payload);
      if (noti && !noti.isRead) {
        noti.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      let changed = false;
      state.notifications.forEach((n) => {
        if (!n.isRead) {
          n.isRead = true;
          changed = true;
        }
      });
      if (changed) state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const { content, totalPages, page } = action.payload;
        state.notifications = page === 1 ? content : [...state.notifications, ...content];
        state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
        state.hasMore = page < totalPages;
        state.page = page + 1;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const noti = state.notifications.find((n) => n.id === action.payload);
        if (noti && !noti.isRead) {
          noti.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      })
      .addCase(deleteNotifications.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter((n) => !action.payload.includes(n.id));
        state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
      });
  },
});

export const { addNotification, markAsRead, markAllAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;