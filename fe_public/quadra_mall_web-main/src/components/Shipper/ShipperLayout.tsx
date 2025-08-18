import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { AppDispatch, RootState } from '@/store';
import { hasRole } from '@/utils/roleHelper';
import { getShipperStats } from '@/store/Shipper/shipperSlice';
import {
  Truck,
  Package,
  PlusCircle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Home
} from 'lucide-react';
import { logout, refreshMe } from '@/store/Auth/authSlice';
import Swal from 'sweetalert2';

export const ShipperLayout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { stats } = useSelector((state: RootState) => state.shipper);

  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Kiểm tra authentication và quyền
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    // Refresh user info để đảm bảo có roles mới nhất
    dispatch(refreshMe());

    // Kiểm tra quyền SHIPPER
    if (!hasRole(user, 'SHIPPER')) {
      navigate('/shipper/registration-status');
      return;
    }

    // Load stats
    dispatch(getShipperStats());
  }, [isAuthenticated, user, navigate, dispatch]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Đăng xuất',
      text: 'Bạn có chắc chắn muốn đăng xuất?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      dispatch(logout());
      navigate('/');
    }
  };

  const navigation = [
    {
      name: 'Tổng quan',
      href: '/shipper/dashboard',
      icon: Home,
      current: location.pathname === '/shipper/dashboard'
    },
    {
      name: 'Đơn hàng của tôi',
      href: '/shipper/my-orders',
      icon: Package,
      current: location.pathname === '/shipper/my-orders',
      badge: stats?.pendingDeliveries || 0
    },
    {
      name: 'Nhận đơn hàng',
      href: '/shipper/available-orders',
      icon: PlusCircle,
      current: location.pathname === '/shipper/available-orders'
    },
    {
      name: 'Thống kê',
      href: '/shipper/stats',
      icon: BarChart3,
      current: location.pathname === '/shipper/stats'
    },
    {
      name: 'Cài đặt',
      href: '/shipper/settings',
      icon: Settings,
      current: location.pathname === '/shipper/settings'
    }
  ];

  // Kiểm tra quyền truy cập
  if (!isAuthenticated || !hasRole(user, 'SHIPPER')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Không có quyền truy cập
          </h1>
          <p className="text-gray-600 mb-4">
            Bạn cần có quyền Shipper để truy cập trang này
          </p>
          <Link
            to="/shipper/registration-status"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Kiểm tra trạng thái đăng ký
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Logo/Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-blue-600">
          <div className="flex items-center space-x-2">
            <Truck className="h-8 w-8 text-white" />
            <span className="text-white font-bold text-lg">Shipper Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.fullName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {stats?.shipperCode || 'Shipper'}
              </p>
            </div>
          </div>
          
          {/* Stats Summary */}
          {stats && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-green-50 p-2 rounded">
                <div className="text-green-600 font-medium">Hoàn thành</div>
                <div className="text-green-800">{stats.successfulDeliveries || 0}</div>
              </div>
              <div className="bg-yellow-50 p-2 rounded">
                <div className="text-yellow-600 font-medium">Đang giao</div>
                <div className="text-yellow-800">{stats.pendingDeliveries || 0}</div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center justify-between px-3 py-2 text-sm font-medium border-l-4 transition-colors`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className={`${
                      item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 h-5 w-5`} />
                    {item.name}
                  </div>
                  {item.badge && item.badge > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="ml-2 text-lg font-semibold text-gray-900 lg:ml-0">
                {navigation.find(item => item.current)?.name || 'Shipper Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
                {stats?.pendingDeliveries && stats.pendingDeliveries > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.pendingDeliveries > 9 ? '9+' : stats.pendingDeliveries}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-1 rounded-full">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user?.fullName}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};