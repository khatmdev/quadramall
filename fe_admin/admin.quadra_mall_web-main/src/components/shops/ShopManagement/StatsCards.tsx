import React from 'react';
import { ShoppingBag, CheckCircle, DollarSign, Star } from 'lucide-react';

interface Stats {
  totalShops: number;
  activeShops: number;
  totalRevenue: number;
  averageRating: number;
}

interface StatsCardsProps {
  stats: Stats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Tổng số shop</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalShops}</p>
            <p className="text-sm text-green-600 mt-1">+12% so với tháng trước</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <ShoppingBag className="text-blue-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Shop hoạt động</p>
            <p className="text-3xl font-bold text-green-600">{stats.activeShops}</p>
            <p className="text-sm text-gray-600 mt-1">{((stats.activeShops / stats.totalShops) * 100).toFixed(1)}% tổng số</p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <CheckCircle className="text-green-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalRevenue.toFixed(0)}M</p>
            <p className="text-sm text-green-600 mt-1">+8.2% so với tháng trước</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <DollarSign className="text-blue-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Đánh giá trung bình</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</p>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < Math.floor(stats.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                />
              ))}
            </div>
          </div>
          <div className="bg-yellow-100 p-3 rounded-lg">
            <Star className="text-yellow-600" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;