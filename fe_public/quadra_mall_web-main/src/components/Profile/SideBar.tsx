// SidebarCategories.tsx
import React from 'react';
import {
  FiChevronRight,
  FiUser,
  FiCreditCard,
  FiShoppingBag,
  FiMapPin,
  FiLock,
  FiHeart,
  FiHelpCircle,
  FiBell,
  FiLogOut,
} from 'react-icons/fi';

interface SidebarCategoriesProps {
  onSelect: (id: string) => void;
}

const accountItems = [
  { id: 'profile', name: 'Thông tin cá nhân', icon: <FiUser className="text-gray-500 mr-2" /> },
  { id: 'security', name: 'Bảo mật tài khoản', icon: <FiLock className="text-gray-500 mr-2" /> },
  { id: 'address', name: 'Địa chỉ giao hàng', icon: <FiMapPin className="text-gray-500 mr-2" /> },
];

const orderItems = [
  { id: 'order', name: 'Đơn hàng', icon: <FiShoppingBag className="text-gray-500 mr-2" /> },
  { id: 'payment', name: 'Thanh toán ngân hàng', icon: <FiCreditCard className="text-gray-500 mr-2" /> },
  { id: 'favorites', name: 'Sản phẩm yêu thích', icon: <FiHeart className="text-gray-500 mr-2" /> },
];

const settingItems = [
  { id: 'notifications', name: 'Cài đặt', icon: <FiBell className="text-gray-500 mr-2" /> },
  { id: 'support', name: 'Trung tâm hỗ trợ', icon: <FiHelpCircle className="text-gray-500 mr-2" /> },
];

const SidebarCategories: React.FC<SidebarCategoriesProps> = ({ onSelect }) => {
  return (
    <div className="w-64 bg-white p-4 rounded-lg shadow-sm flex flex-col justify-between h-full">
      <div className="space-y-4">
        {/* Tài khoản */}
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase mb-1 pl-1">Tài khoản</div>
          <div className="space-y-1">
            {accountItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="w-full flex justify-between items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <span className="flex items-center">
                  {item.icon}
                  {item.name}
                </span>
                <FiChevronRight size={16} className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Đơn hàng & Thanh toán */}
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase mb-1 pl-1">Mua sắm</div>
          <div className="space-y-1">
            {orderItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="w-full flex justify-between items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <span className="flex items-center">
                  {item.icon}
                  {item.name}
                </span>
                <FiChevronRight size={16} className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Cài đặt & Hỗ trợ */}
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase mb-1 pl-1">Khác</div>
          <div className="space-y-1">
            {settingItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="w-full flex justify-between items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <span className="flex items-center">
                  {item.icon}
                  {item.name}
                </span>
                <FiChevronRight size={16} className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-gray-200">
        <button
          onClick={() => onSelect('logout')}
          className="w-full flex justify-between items-center px-3 py-2 text-sm text-red-600 hover:bg-red-100 rounded-md"
        >
          <span className="flex items-center">
            <FiLogOut className="text-red-500 mr-2" />
            Đăng xuất
          </span>
        </button>
      </div>
    </div>
  );
};

export default SidebarCategories;
