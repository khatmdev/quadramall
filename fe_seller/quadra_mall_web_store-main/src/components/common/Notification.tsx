import React, { useEffect } from 'react';

interface NotificationProps {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const typeStyles = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-black',
        info: 'bg-blue-500 text-white',
    };

    return (
        <div
            className={`fixed top-4 right-4 p-4 rounded-md shadow-lg ${typeStyles[type]} max-w-sm animate-slide-in`}
        >
            <div className="flex items-center justify-between">
                <span>{message}</span>
                <button
                    className="ml-4 text-white hover:text-gray-200"
                    onClick={onClose}
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default Notification;

const styles = `
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
`;