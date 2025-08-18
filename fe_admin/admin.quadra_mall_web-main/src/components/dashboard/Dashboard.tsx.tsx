// src/components/dashboard/Dashboard.tsx
import React from 'react';
import { Calendar, DollarSign, Store, Users, ShoppingBag } from 'lucide-react';
import StatsCard from './StatsCard';
import RevenueChart from './RevenueChart';
import ShopStatusChart from './ShopStatusChart';
import ShopUserChart from './ShopUserChart';
import { revenueData, shopStatusData } from '../../data/mockData';
import type { StatsCardProps } from '@/types/dashboard';

const Dashboard: React.FC = () => {
  const statsData: StatsCardProps[] = [
    {
      title: 'Doanh thu tháng',
      value: '72M VNĐ',
      change: '+12% so với tháng trước',
      icon: DollarSign,
      gradient: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      title: 'Shop hoạt động',
      value: '175',
      change: '+8 shop mới',
      icon: Store,
      gradient: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      title: 'Người dùng',
      value: '12,000',
      change: '+800 người dùng mới',
      icon: Users,
      gradient: 'bg-gradient-to-r from-purple-500 to-purple-600'
    },
    {
      title: 'Đơn hàng',
      value: '2,150',
      change: '+15% so với tuần trước',
      icon: ShoppingBag,
      gradient: 'bg-gradient-to-r from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Tổng quan</h1>
        <div className="flex items-center space-x-2">
          <Calendar size={20} className="text-gray-500" />
          <span className="text-gray-600">Tháng 6, 2024</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueData} />
        <ShopStatusChart data={shopStatusData} />
      </div>

      <ShopUserChart data={revenueData} />
    </div>
  );
};

export default Dashboard;