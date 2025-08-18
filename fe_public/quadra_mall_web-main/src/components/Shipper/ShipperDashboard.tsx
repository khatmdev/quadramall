import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { getShipperStats } from '@/store/Shipper/shipperSlice';
import { getMyOrders } from '@/store/Shipper/orderSlice';
import { Link } from 'react-router-dom';
import {
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  DollarSign,
  Star,
  Truck,
  AlertCircle,
  PlusCircle,
  Calendar,
  BarChart3
} from 'lucide-react';
import { formatCurrency } from '@/utils/utils';

export const ShipperDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading: statsLoading } = useSelector((state: RootState) => state.shipper);
  const { orders, loading: ordersLoading } = useSelector((state: RootState) => state.shipperOrder);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(getShipperStats());
    dispatch(getMyOrders({ page: 0, size: 5 })); // Load recent orders
  }, [dispatch]);

  const loading = statsLoading || ordersLoading;

  // Mock earnings data for chart
  const dailyEarnings = [
    { day: 'T2', amount: 150000 },
    { day: 'T3', amount: 200000 },
    { day: 'T4', amount: 180000 },
    { day: 'T5', amount: 250000 },
    { day: 'T6', amount: 300000 },
    { day: 'T7', amount: 280000 },
    { day: 'CN', amount: 220000 }
  ];

  const maxEarning = Math.max(...dailyEarnings.map(d => d.amount));

  const recentOrders = orders.slice(0, 5);

  const statsCards = [
    {
      title: 'Tổng đơn hàng',
      value: stats?.totalDeliveries || 0,
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Thành công',
      value: stats?.successfulDeliveries || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Đang giao',
      value: stats?.pendingDeliveries || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Đánh giá',
      value: stats?.rating ? `${stats.rating}/5` : '5.0/5',
      icon: Star,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'PICKED_UP': return 'bg-yellow-100 text-yellow-800';
      case 'IN_TRANSIT': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CONFIRMED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Xin chào, {user?.fullName}! 👋
            </h1>
            <p className="text-blue-100">
              Mã Shipper: {stats?.shipperCode || 'SHIP001'} • 
              Tỉ lệ thành công: {stats?.successRate || 100}%
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {formatCurrency(300000)}
            </div>
            <div className="text-blue-100 text-sm">Thu nhập hôm nay</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/shipper/available-orders"
              className="flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <PlusCircle className="h-8 w-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Nhận đơn mới</span>
            </Link>
            
            <Link
              to="/shipper/my-orders"
              className="flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <Truck className="h-8 w-8 text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Đơn của tôi</span>
            </Link>
            
            <Link
              to="/shipper/stats"
              className="flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <BarChart3 className="h-8 w-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Thống kê</span>
            </Link>
            
            <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors cursor-pointer">
              <Calendar className="h-8 w-8 text-yellow-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Lịch làm việc</span>
            </div>
          </div>
        </div>

        {/* Weekly Earnings Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Thu nhập 7 ngày</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-3">
            {dailyEarnings.map((earning, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 w-8">
                  {earning.day}
                </span>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(earning.amount / maxEarning) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900 text-right w-20">
                  {formatCurrency(earning.amount)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tổng tuần:</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(dailyEarnings.reduce((sum, d) => sum + d.amount, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Đơn hàng gần đây</h3>
            <Link
              to="/shipper/my-orders"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Xem tất cả →
            </Link>
          </div>
        </div>
        <div className="p-6">
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có đơn hàng nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">#{order.orderCode}</p>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.assignmentStatus)}`}>
                      {order.assignmentStatus}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch trình hôm nay</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <Clock className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">10:00 - 11:30</p>
              <p className="text-sm text-gray-600">Lấy và giao đơn #12345</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="font-medium text-gray-900">14:00 - 15:30</p>
              <p className="text-sm text-gray-600">Lấy và giao đơn #12346</p>
            </div>
          </div>
          <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-lg">
            <Link
              to="/shipper/available-orders"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Nhận thêm đơn hàng</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};