import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Store, Users, ShoppingBag, Settings, LogOut,
  Package, Check, TrendingUp, BadgeDollarSign, SliceIcon, ChartBarBigIcon, ShipIcon,
  Bell
} from 'lucide-react';
import type { MenuItem } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'shops', label: 'Quản lý Shop', icon: Store },
  { id: 'categories', label: 'Ngành hàng', icon: Package },
  { id: 'shop-approval', label: 'Phê duyệt Shop', icon: Check },
  { id: 'users', label: 'Người dùng', icon: Users },
  { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag },
  { id: 'reports', label: 'Báo cáo', icon: TrendingUp },
  { id: 'transaction', label: 'Giao dịch', icon: BadgeDollarSign },
  { id: 'banner', label: 'Banner', icon: SliceIcon },
  { id: 'commission-revenue', label: 'Quản lý Hoa hồng & Doanh thu', icon: ChartBarBigIcon },
  { id: 'shipper', label: 'Quản lý Shipper/Giao hàng', icon: ShipIcon },
  { id: 'notification', label: 'Thông báo', icon: Bell },
  { id: 'settings', label: 'Cài đặt', icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeTab, onTabChange }) => {
  const location = useLocation();

  // Đồng bộ activeTab với URL chỉ khi cần thiết, tránh vòng lặp
  React.useEffect(() => {
    const currentPath = location.pathname.replace(/^\/+/, '') || 'dashboard'; // Loại bỏ tất cả '/' đầu
    if (currentPath !== activeTab && menuItems.some(item => item.id === currentPath)) {
      onTabChange(currentPath);
    }
  }, [location.pathname, activeTab, onTabChange]);

  return (
      <div className={`${isOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white shadow-lg border-r border-gray-200 sidebar`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Store size={20} className="text-white" />
            </div>
            {isOpen && (
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-green-600">Quadra Admin</h1>
                  <p className="text-sm text-gray-500">Quản trị hệ thống</p>
                </div>
            )}
          </div>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
                <Link
                    key={item.id}
                    to={`/${item.id}`} // Sử dụng đường dẫn tuyệt đối với '/'
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-left hover:bg-green-50 transition-colors ${
                        isActive ? 'bg-green-100 border-r-4 border-green-600 text-green-700' : 'text-gray-600'
                    }`}
                    title={!isOpen ? item.label : undefined}
                >
                  <Icon size={20} />
                  {isOpen && <span className="ml-3 font-medium">{item.label}</span>}
                </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
            <LogOut size={20} />
            {isOpen && <span className="ml-3">Đăng xuất</span>}
          </button>
        </div>
      </div>
  );
};

export default Sidebar;