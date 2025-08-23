// hooks/useWebSocket.tsx - Fixed Authentication Issues
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
  const { user, token, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const clientRef = useRef<Client | null>(null);
  const reconnectAttempts = useRef<number>(0);
  const maxReconnectAttempts = 5;
  const isConnecting = useRef<boolean>(false);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ FIX 1: Ensure correct URL format
  const socketUrl = import.meta.env.VITE_API_WS_URL || 'http://localhost:8080';
  const wsEndpoint = `${socketUrl}/ws`;

  // ✅ FIX 2: Get token from multiple sources
  const getAuthToken = useCallback(() => {
    return token ||
           localStorage.getItem('token') ||
           localStorage.getItem('access_token') ||
           localStorage.getItem('authToken');
  }, [token]);

  const disconnect = useCallback(() => {
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }

    if (clientRef.current) {
      console.log('WebSocket deactivating...');
      clientRef.current.deactivate();
      clientRef.current = null;
      isConnecting.current = false;
    }
  }, []);

  const connect = useCallback(() => {
    // ✅ FIX 3: Enhanced connection checks
    if (isConnecting.current || clientRef.current?.connected) {
      console.log('WebSocket already connecting or connected, skipping...');
      return;
    }

    const authToken = getAuthToken();
    if (!isAuthenticated || !user?.email || !authToken) {
      console.warn('Cannot connect WebSocket: missing authentication data', {
        isAuthenticated,
        hasUser: !!user?.email,
        hasToken: !!authToken
      });
      return;
    }

    isConnecting.current = true;
    console.log('Connecting to WebSocket at:', wsEndpoint, 'for user:', user.email);

    try {
      const client = new Client({
        // ✅ FIX 4: Enhanced WebSocket factory with auth
        webSocketFactory: () => {
          // Create SockJS with authentication in URL params as fallback
          const sockUrl = `${wsEndpoint}?token=${encodeURIComponent(authToken)}`;
          const sock = new SockJS(sockUrl);

          sock.onopen = () => {
            console.log('SockJS connection opened successfully');
            reconnectAttempts.current = 0;
          };

          sock.onclose = (event) => {
            console.log('SockJS connection closed:', event);
            isConnecting.current = false;
          };

          sock.onerror = (error) => {
            console.error('SockJS error:', error);
            isConnecting.current = false;
          };

          return sock;
        },

        // ✅ FIX 5: Enhanced connect headers
        connectHeaders: {
          'Authorization': `Bearer ${authToken}`,
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
        },

        // ✅ FIX 6: Optimized connection settings
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,

        // ✅ FIX 7: Add connection timeout
        connectionTimeout: 10000,

        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
      });

      // ✅ FIX 8: Enhanced connection timeout handling
      connectionTimeoutRef.current = setTimeout(() => {
        if (isConnecting.current && !clientRef.current?.connected) {
          console.warn('WebSocket connection timeout, force disconnect');
          isConnecting.current = false;
          client.deactivate();
        }
      }, 15000); // 15 second timeout

      client.onConnect = (frame) => {
        console.log('✅ WebSocket Connected successfully for user:', user.email);
        console.log('Connection frame headers:', frame.headers);

        reconnectAttempts.current = 0;
        isConnecting.current = false;

        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }

        try {
          // ✅ FIX 9: Enhanced subscription with error handling
          const subscription = client.subscribe(
            `/user/${user.email}/queue/notifications`,
            (message) => {
              try {
                console.log('📨 Received notification message:', message.body);
                const rawNoti: any = JSON.parse(message.body);
                const noti: Notification = {
                  ...rawNoti,
                  isRead: rawNoti.read || false,
                };

                console.log('📨 Processed notification:', noti);
                dispatch(addNotification(noti));

                if (!noti.isRead) {
                  toast(
                    <ToastNotification
                      noti={noti}
                      onMarkAsRead={() => {
                        if (client.connected) {
                          client.publish({
                            destination: '/app/notifications/read',
                            body: JSON.stringify({ id: noti.id }),
                          });
                          dispatch(markAsRead(noti.id));
                          setTimeout(() => dispatch(fetchNotifications({ page: 1 })), 500);
                        }
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

                // ✅ Play notification sound (optional)
                try {
                  const audio = new Audio('/sounds/notification.mp3');
                  audio.play().catch((err) =>
                    console.warn('Browser blocked auto-play audio:', err)
                  );
                } catch (e) {
                  // Audio file not found, skip
                }
              } catch (error) {
                console.error('❌ Failed to parse notification:', error, 'Raw message:', message.body);
              }
            },
            {
              // ✅ FIX 10: Add subscription headers
              'Authorization': `Bearer ${authToken}`
            }
          );

          console.log('✅ Subscribed to notifications successfully:', subscription.id);

          // ✅ FIX 11: Test connection by sending a ping
          setTimeout(() => {
            if (client.connected) {
              client.publish({
                destination: '/app/notifications/ping',
                body: JSON.stringify({
                  userId: user.email,
                  timestamp: new Date().toISOString()
                }),
              });
              console.log('📡 Sent WebSocket ping');
            }
          }, 1000);

        } catch (subscriptionError) {
          console.error('❌ Failed to subscribe to notifications:', subscriptionError);
        }
      };

      client.onStompError = (frame) => {
        console.error('❌ STOMP Error:', frame.headers.message);
        console.error('Error details:', frame.body);
        isConnecting.current = false;

        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }

        reconnectAttempts.current += 1;
        if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.error('❌ Reached max reconnect attempts. Stopping reconnection.');
          client.deactivate();
        }
      };

      client.onWebSocketError = (error) => {
        console.error('❌ WebSocket Error:', error);
        isConnecting.current = false;

        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
      };

      client.onDisconnect = (frame) => {
        console.log('🔌 WebSocket Disconnected:', frame);
        isConnecting.current = false;

        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
      };

      client.onWebSocketClose = (event) => {
        console.log('🔌 WebSocket connection closed:', event);
        isConnecting.current = false;

        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
      };

      // ✅ FIX 12: Start connection with error handling
      try {
        client.activate();
        clientRef.current = client;
        console.log('🚀 WebSocket client activated');
      } catch (activationError) {
        console.error('❌ Failed to activate WebSocket client:', activationError);
        isConnecting.current = false;
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
      }

    } catch (error) {
      console.error('❌ Error creating WebSocket client:', error);
      isConnecting.current = false;
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
    }
  }, [dispatch, user?.email, wsEndpoint, isAuthenticated, getAuthToken]);

  // ✅ FIX 13: Enhanced effect for connection management
  useEffect(() => {
    if (isAuthenticated && user?.email && getAuthToken()) {
      console.log('🔄 Authentication state changed, attempting WebSocket connection...');

      // Small delay to ensure proper initialization
      const timer = setTimeout(() => {
        connect();
      }, 2000); // Increased delay

      return () => {
        clearTimeout(timer);
        disconnect();
      };
    } else {
      console.log('❌ Authentication requirements not met, disconnecting WebSocket');
      disconnect();
    }
  }, [isAuthenticated, user?.email, connect, disconnect, getAuthToken]);

  // ✅ FIX 14: Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up WebSocket on unmount');
      disconnect();
    };
  }, [disconnect]);

  const sendReadReceipt = useCallback((notiId: number) => {
    if (clientRef.current?.connected) {
      try {
        clientRef.current.publish({
          destination: '/app/notifications/read',
          body: JSON.stringify({ id: notiId }),
        });
        dispatch(markAsRead(notiId));
        console.log('📧 Sent read receipt for notification:', notiId);
      } catch (error) {
        console.error('❌ Failed to send read receipt:', error);
      }
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send read receipt for:', notiId);
    }
  }, [dispatch]);

  // ✅ FIX 15: Enhanced return object with connection status
  return {
    sendReadReceipt,
    isConnected: clientRef.current?.connected || false,
    disconnect,
    reconnectAttempts: reconnectAttempts.current,
    forceReconnect: () => {
      disconnect();
      setTimeout(connect, 1000);
    }
  };
};
