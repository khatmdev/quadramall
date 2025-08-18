import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiX, FiPackage } from 'react-icons/fi';
import { Transition } from '@headlessui/react';

interface Notification {
    id: string;
    type: 'new_order' | 'status_update';
    orderId: number;
    message: string;
    timestamp: Date;
    read: boolean;
}

interface NotificationProps {
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onClearAll: () => void;
}

const NotificationDropdown: React.FC<NotificationProps> = ({
                                                               notifications,
                                                               onMarkAsRead,
                                                               onClearAll,
                                                           }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const unreadCount = notifications.filter((n) => !n.read).length;

    const handleNotificationClick = (notification: Notification) => {
        onMarkAsRead(notification.id);
        navigate(`/orders/${notification.orderId}`);
        setIsOpen(false);
    };

    const formatTime = (timestamp: Date) => {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        return `${days} ngày trước`;
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <FiBell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
                )}
            </button>
            <Transition
                show={isOpen}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-500">
                                <FiBell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>Không có thông báo nào</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                                        !notification.read ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div
                                            className={`p-2 rounded-lg ${
                                                notification.type === 'new_order'
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-blue-100 text-blue-600'
                                            }`}
                                        >
                                            <FiPackage className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={`text-sm ${
                                                    !notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'
                                                }`}
                                            >
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">{formatTime(notification.timestamp)}</p>
                                        </div>
                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    onClearAll();
                                    setIsOpen(false);
                                }}
                                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Xóa tất cả thông báo
                            </button>
                        </div>
                    )}
                </div>
            </Transition>
            {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
        </div>
    );
};

export default NotificationDropdown;