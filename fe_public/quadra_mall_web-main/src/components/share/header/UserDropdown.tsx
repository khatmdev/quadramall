import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, type RootState } from '@/store';
import { logout } from '@/store/Auth/authSlice';
import {
  ArrowRightOnRectangleIcon,
  UserIcon,
  ShoppingBagIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';

interface UserDropdownProps {
  user: any;
  showUserDropdown: boolean;
  toggleUserDropdown: () => void;
  closeAllDropdowns: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
  user,
  showUserDropdown,
  toggleUserDropdown,
  closeAllDropdowns,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    dispatch(logout());
    closeAllDropdowns();
    navigate('/login');
  }, [dispatch, navigate, closeAllDropdowns]);

  return (
    <div className="relative">
      <button
        className="flex items-center space-x-2"
        onClick={toggleUserDropdown}
        aria-label="User Menu"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-200">
          <img
            src={
              user?.avatarUrl ||
              '/assets/account-placeholder.png'
            }
            alt="User Avatar"
            className="w-full h-full object-cover"
          />
        </div>
        {user ? (
          <span className="hidden md:block text-sm font-medium text-white/90 truncate max-w-[120px]">
            {user.fullName || user.email}
          </span>
        ) : (
          <span className="hidden md:block text-sm font-medium text-white/90 truncate max-w-[120px]">
            Tài khoản
          </span>
        )}
        <svg
          className="w-3 h-3 text-gray-500 hidden md:block"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M5.5 7l4.5 4.5L14.5 7h-9z" />
        </svg>
      </button>

      {showUserDropdown && (
        <div className="absolute right-0 top-10 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          {user ? (
            <>
              <div className="p-4 border-b border-gray-100 bg-green-50">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {user.fullName || user.email}
                </p>
                <p className="text-xs text-gray-600 truncate">{user.email}</p>
              </div>
              <div className="py-1">
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-100 hover:text-green-800 transition"
                  onClick={closeAllDropdowns}
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Hồ sơ
                </Link>
                <Link
                  to="/wallet"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-100 hover:text-green-800 transition"
                  onClick={closeAllDropdowns}
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Ví của tôi
                </Link>
                <Link
                  to="/orders"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-100 hover:text-green-800 transition"
                  onClick={closeAllDropdowns}
                >
                  <ShoppingBagIcon className="w-4 h-4 mr-2" />
                  Đơn hàng của tôi
                </Link>
                {user.provider === 'local' && (
                  <Link
                    to="/change-password"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-100 hover:text-green-800 transition"
                    onClick={closeAllDropdowns}
                  >
                    <LockClosedIcon className="w-4 h-4 mr-2" />
                    Đổi mật khẩu
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-100 hover:text-green-800 transition text-left"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                  Đăng xuất
                </button>
              </div>
            </>
          ) : (
            <div className="py-1">
              <Link
                to="/login"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-100 hover:text-green-800 transition"
                onClick={closeAllDropdowns}
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-100 hover:text-green-800 transition"
                onClick={closeAllDropdowns}
              >
                <UserIcon className="w-4 h-4 mr-2" />
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDropdown;