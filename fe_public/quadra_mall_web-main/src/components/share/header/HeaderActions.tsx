// src/components/share/HeaderActions.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchNotifications } from '@/store/Notification/notificationSlice';
import NotificationDropdown from './NotificationDropdown';
import UserDropdown from './UserDropdown';

const HeaderActions: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications({page:1}));
    }
  }, [dispatch, user]);

  const toggleNotifications = useCallback(() => {
    setShowNotifications((prev) => !prev);
    setShowUserDropdown(false);
  }, []);

  const toggleUserDropdown = useCallback(() => {
    setShowUserDropdown((prev) => !prev);
    setShowNotifications(false);
  }, []);

  const closeAllDropdowns = useCallback(() => {
    setShowNotifications(false);
    setShowUserDropdown(false);
  }, []);

  return (
    <div className="flex items-center space-x-3 md:space-x-5">
      {/* Cart */}
      <Link to="/cart" className="text-white/90 hover:text-gray-800" aria-label="Cart">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.98-1.75L23 6H6" />
        </svg>
      </Link>

      {/* Email */}
      <Link to="/messages" className="text-white/90 hover:text-gray-800" aria-label="Email">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </Link>

      {/* Notification Dropdown */}
      <NotificationDropdown
        show={showNotifications}
        toggleNotifications={toggleNotifications}
        closeAllDropdowns={closeAllDropdowns}
      />

      {/* User Dropdown */}
      <UserDropdown
        user={user}
        showUserDropdown={showUserDropdown}
        toggleUserDropdown={toggleUserDropdown}
        closeAllDropdowns={closeAllDropdowns}
      />
    </div>
  );
};

export default HeaderActions;