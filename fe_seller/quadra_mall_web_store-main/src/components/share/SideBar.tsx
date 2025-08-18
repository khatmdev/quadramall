import React from 'react';
import {
  FiHome,
  FiList,
  FiTag,
  FiFolder,
  FiUsers,
  FiStar,
  FiMessageSquare,
  FiMapPin,
  FiBell,
  FiUser,
  FiSettings,
  FiMenu,
  FiX,
  FiLogOut,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/Auth/authSlice';
import type { AppDispatch } from '@/store';
import { Flame } from 'lucide-react';

interface SidebarAdminProps {
  onItemClick: () => void;
  selectedId?: string;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const mainItems = [
  { id: 'dashboard', name: 'Dashboard', icon: <FiHome />, path: '/' },
  { id: 'orders', name: 'Orders', icon: <FiList />, badge: 10, path: '/seller/orders' },
  { id: 'products', name: 'Products', icon: <FiTag />, path: '/products' },
  { id: 'categories', name: 'Categories', icon: <FiFolder />, path: '/categories' },
  { id: 'customers', name: 'Customers', icon: <FiUsers />, path: '/customers' },
  { id: 'coupons', name: 'Coupons', icon: <FiStar />, path: '/coupons' },
  { id: 'chat', name: 'Chat', icon: <FiMessageSquare />, path: '/chat' },
  { id: 'reviews', name: 'Review Management', icon: <FiStar />, path: '/reviews' },
  { id: 'flashsale', name: 'Flash Sale', icon: <Flame />, path: '/flashsale' },
];

const otherItems = [
  { id: 'knowledge-base', name: 'Knowledge Base', icon: <FiMapPin />, path: '/knowledge-base' },
  { id: 'product-updates', name: 'Product Updates', icon: <FiBell />, path: '/product-updates' },
];

const settingsItems = [
  { id: 'personal-settings', name: 'Personal Settings', icon: <FiUser />, path: '/personal-settings' },
  { id: 'global-settings', name: 'Global Settings', icon: <FiSettings />, path: '/global-settings' },
  { id: 'change-store', name: 'Change Store', icon: <FiSettings />, path: '/select-store' },
];

const SidebarAdmin: React.FC<SidebarAdminProps> = ({ onItemClick, selectedId, isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  console.log('[SidebarAdmin] Component rendered, isOpen:', isOpen);

  const handleItemClick = (id: string, path: string) => {
    console.log('[SidebarAdmin] Item clicked:', { id, path });
    navigate(path);
    onItemClick();
  };

  const handleLogout = () => {
    console.log('[SidebarAdmin] handleLogout called');
    try {
      dispatch(logout());
      console.log('[SidebarAdmin] Logout action dispatched');
      navigate('/login', { replace: true });
      console.log('[SidebarAdmin] Navigated to /login');
      onItemClick();
    } catch (error) {
      console.error('[SidebarAdmin] Error during logout:', error);
    }
  };

  return (
      <>
        <button
            className="md:hidden fixed top-4 left-4 z-50 text-white bg-navy p-2 rounded-md"
            onClick={() => {
              console.log('[SidebarAdmin] Toggle sidebar clicked, current isOpen:', isOpen);
              toggleSidebar();
            }}
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        <div
            className={`fixed md:static inset-y-0 left-0 w-64 bg-navy text-white px-4 py-6 space-y-6 font-medium text-sm transform ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0 transition-transform duration-300 z-40 min-h-screen overflow-y-auto flex flex-col`}
        >
          <div className="space-y-1">
            {mainItems.map((item) => (
                <div
                    key={item.id}
                    onClick={() => handleItemClick(item.id, item.path)}
                    className={`flex items-center justify-between px-3 py-2 rounded-md hover:bg-green-700 transition cursor-pointer ${
                        selectedId === item.id ? 'bg-green-800' : ''
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                      <span className="text-xs bg-white text-green-800 font-bold rounded-full px-2 py-0.5">
                        {item.badge}
                      </span>
                  )}
                </div>
            ))}
          </div>

          <div className="space-y-1">
            <div className="uppercase text-green-200 text-xs px-3">Other Information</div>
            {otherItems.map((item) => (
                <div
                    key={item.id}
                    onClick={() => handleItemClick(item.id, item.path)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-green-700 transition cursor-pointer ${
                        selectedId === item.id ? 'bg-green-800' : ''
                    }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
            ))}
          </div>

          <div className="space-y-1">
            <div className="uppercase text-green-200 text-xs px-3">Settings</div>
            {settingsItems.map((item) => (
                <div
                    key={item.id}
                    onClick={() => handleItemClick(item.id, item.path)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-green-700 transition cursor-pointer ${
                        selectedId === item.id ? 'bg-green-800' : ''
                    }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
            ))}
          </div>

          {/* Logout Button */}
          <div className="mt-auto pt-6 border-t border-green-700">
            <div
                data-testid="logout-button"
                onClick={() => {
                  console.log('[SidebarAdmin] Logout button clicked');
                  handleLogout();
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 transition cursor-pointer"
            >
              <span className="text-lg"><FiLogOut /></span>
              <span>Đăng xuất</span>
            </div>
          </div>
        </div>

        {isOpen && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
                onClick={() => {
                  console.log('[SidebarAdmin] Overlay clicked, closing sidebar');
                  toggleSidebar();
                }}
            ></div>
        )}
      </>
  );
};

export default SidebarAdmin;