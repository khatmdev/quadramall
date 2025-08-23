// src/hook/useWebSocket.tsx
import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'react-toastify';
import { AppDispatch, RootState } from '@/store';
import { addNotification, markAsRead } from '@/store/Notification/notificationSlice';
import { Notification } from '@/types/Notification/notification';
import { Link } from 'react-router-dom';
import { fetchNotifications } from '@/store/Notification/notificationSlice';

// Component ToastNotification
const ToastNotification: React.FC<{
  noti: Notification;
  onMarkAsRead: () => void;
  onClose: () => void;
}> = ({ noti, onMarkAsRead, onClose }) => {
  if (!noti || !noti.title || !noti.message || !noti.id) {
    console.error('Invalid notification data for toast:', noti);
    return null;
  }

  return (
    <div className="flex items-start space-x-3 p-2">
      <span className="text-lg">{noti.icon || '🔔'}</span>
      <div>
        <p className="text-sm font-medium text-gray-900">{noti.title}</p>
        <p className="text-xs text-gray-600">{noti.message}</p>
        <div className="flex space-x-2 mt-1">
          <button
            onClick={() => {
              onMarkAsRead();
              onClose();
            }}
            className="text-xs text-blue-600 hover:underline"
          >
            Đánh dấu đã đọc
          </button>
          <Link
            to={`/notifications/${noti.id}`}
            className="text-xs text-blue-600 hover:underline"
            onClick={onClose}
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
};

export const useWebSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const clientRef = useRef<Client | null>(null);
  const reconnectAttempts = useRef<number>(0);
  const maxReconnectAttempts = 5;

  const socketUrl = import.meta.env.VITE_API_WS_URL || 'http://localhost:8080/ws';

  useEffect(() => {
    if (!user?.email || !token) {
      console.warn('User email or token missing, skipping WebSocket connection');
      return;
    }

    reconnectAttempts.current = 0;

    const connect = () => {
      const client = new Client({
        webSocketFactory: () => new SockJS(socketUrl),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => console.log('STOMP Debug:', str),
      });

      client.onConnect = () => {
        console.log('WebSocket Connected for user:', user.email);
        reconnectAttempts.current = 0;

        client.subscribe(`/user/${user.email}/queue/notifications`, (msg) => {
          try {
            const rawNoti: any = JSON.parse(msg.body);
            const noti: Notification = {
              ...rawNoti,
              isRead: rawNoti.read || false,
            };
            console.log('Received notification:', noti);
            dispatch(addNotification(noti));

            if (!noti.isRead) {
              toast(
                <ToastNotification
                  noti={noti}
                  onMarkAsRead={() => {
                    client.publish({
                      destination: '/app/notifications/read',
                      body: JSON.stringify({ id: noti.id }),
                    });
                    dispatch(markAsRead(noti.id));
                    setTimeout(() => dispatch(fetchNotifications({ page: 1 })), 500);
                  }}
                  onClose={() => toast.dismiss(noti.id.toString())}
                />,
                {
                  toastId: noti.id.toString(),
                  position: 'top-right',
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  theme: 'light',
                }
              );
            }

            const audio = new Audio('/sounds/notification.mp3');
            void audio.play().catch((err) =>
              console.warn('Trình duyệt chặn âm thanh tự động:', err)
            );
          } catch (error) {
            console.error('Failed to parse notification:', error);
          }
        });
      };

      client.onStompError = (frame) => {
        console.error('STOMP Error:', frame.headers.message);
        reconnectAttempts.current += 1;
        if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.error('Reached max reconnect attempts. Deactivating WebSocket.');
          client.deactivate();
        }
      };

      client.onWebSocketError = (error) => {
        console.error('WebSocket Error:', error);
      };

      client.onDisconnect = () => {
        console.log('WebSocket Disconnected');
      };

      client.activate();
      clientRef.current = client;
    };

    connect();

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        console.log('WebSocket deactivated');
      }
    };
  }, [dispatch, user?.email, token, socketUrl]);

  const sendReadReceipt = useCallback((notiId: number) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: '/app/notifications/read',
        body: JSON.stringify({ id: notiId }),
      });
      dispatch(markAsRead(notiId));
    } else {
      console.warn('WebSocket not connected, queuing read receipt');
    }
  }, [dispatch, clientRef]);

  return { sendReadReceipt };
};
