import React from 'react';
import { BellDot, Menu, Search } from 'lucide-react';
import { useSidebar } from '@/hooks/useSidebar';
import { useNotifications } from '@/hooks/useNotifications';
import Sidebar from '../Slidebar/Sidebar';
import { Outlet } from 'react-router-dom';

interface AdminLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NotificationBell: React.FC = () => {
  const {
    notifications,
    isOpen,
    unreadCount,
    toggleOpen,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  return (
      <div className="relative notification-dropdown">
        <button
            onClick={toggleOpen}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <BellDot size={20} className="text-gray-600" />
          {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
          )}
        </button>

        {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Thông báo</h3>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="text-sm text-green-600 hover:text-green-700"
                    >
                      Đánh dấu tất cả đã đọc
                    </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Không có thông báo nào
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                                notification.unread ? 'bg-green-50' : ''
                            }`}
                            onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-gray-800">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {notification.time}
                              </p>
                            </div>
                            {notification.unread && (
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-1"></div>
                            )}
                          </div>
                        </div>
                    ))
                )}
              </div>
              <div className="p-3 border-t">
                <button className="text-green-600 text-sm font-medium hover:text-green-700">
                  Xem tất cả thông báo
                </button>
              </div>
            </div>
        )}
      </div>
  );
};

const AdminLayout: React.FC<AdminLayoutProps> = ({
                                                   activeTab,
                                                   onTabChange,
                                                 }) => {
  const { isOpen: sidebarOpen, toggle: toggleSidebar } = useSidebar();

  return (
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} activeTab={activeTab} onTabChange={onTabChange} />

        {/* Mobile Overlay */}
        {sidebarOpen && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={toggleSidebar}
            />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-gray-100 mr-4 sidebar-toggle"
                >
                  <Menu size={20} />
                </button>
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                      type="text"
                      placeholder="Tìm kiếm..."
                      className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <NotificationBell />
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">A</span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-800">Admin User</p>
                    <p className="text-xs text-gray-500">admin@ecomart.com</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
  );
};

export default AdminLayout;