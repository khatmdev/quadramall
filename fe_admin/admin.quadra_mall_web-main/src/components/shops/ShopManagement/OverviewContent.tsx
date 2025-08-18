import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, CheckCircle, BarChart2 } from 'lucide-react';
import type { Shop } from '@/types/shop';

interface OverviewContentProps {
  shops: Shop[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const OverviewContent: React.FC<OverviewContentProps> = ({ shops }) => {
  const [sortCriteria, setSortCriteria] = useState<'revenue' | 'orders' | 'rating'>('revenue');

  // Sắp xếp và lấy top 10 shop theo tiêu chí
  const getTopShops = () => {
    return shops
      .sort((a, b) => {
        switch (sortCriteria) {
          case 'revenue':
            return b.totalRevenue - a.totalRevenue;
          case 'orders':
            return b.orderCount - a.orderCount;
          case 'rating':
            return b.rating - a.rating;
          default:
            return b.totalRevenue - a.totalRevenue;
        }
      })
      .slice(0, 10)
      .map(shop => ({
        name: shop.shopName.length > 15 ? shop.shopName.substring(0, 15) + '...' : shop.shopName,
        revenue: shop.totalRevenue,
        orders: shop.orderCount,
        rating: shop.rating
      }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <TrendingUp size={20} className="mr-2 text-blue-600" />
            Top 10 shop theo {sortCriteria === 'revenue' ? 'doanh thu' : sortCriteria === 'orders' ? 'đơn hàng' : 'đánh giá'}
          </h3>
          <select
            value={sortCriteria}
            onChange={(e) => setSortCriteria(e.target.value as 'revenue' | 'orders' | 'rating')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="revenue">Doanh thu</option>
            <option value="orders">Đơn hàng</option>
            <option value="rating">Đánh giá</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getTopShops()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#3B82F6"
              label={{
                value: sortCriteria === 'revenue' ? 'Doanh thu (triệu)' : sortCriteria === 'orders' ? 'Số đơn hàng' : 'Đánh giá',
                angle: -90,
                position: 'insideLeft'
              }}
            />
            <Tooltip formatter={(value, name) => [value, sortCriteria === 'revenue' ? 'Doanh thu (triệu)' : sortCriteria === 'orders' ? 'Đơn hàng' : 'Đánh giá']} />
            <Legend />
            <Bar yAxisId="left" dataKey={sortCriteria} fill="#3B82F6" name={sortCriteria === 'revenue' ? 'Doanh thu (triệu)' : sortCriteria === 'orders' ? 'Đơn hàng' : 'Đánh giá'} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CheckCircle size={20} className="mr-2 text-green-600" />
            Phân bố trạng thái shop
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Hoạt động', value: shops.filter(s => s.status === 'active' && !s.isLocked).length },
                  { name: 'Tạm dừng', value: shops.filter(s => s.status === 'suspended').length },
                  { name: 'Chờ xác minh', value: shops.filter(s => s.status === 'pending_verification').length },
                  { name: 'Bị khóa', value: shops.filter(s => s.isLocked).length }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {[0, 1, 2, 3].map((index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart2 size={20} className="mr-2 text-green-600" />
            Top 5 shop theo đơn hàng
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={shops.sort((a, b) => b.orderCount - a.orderCount).slice(0, 5).map(shop => ({
              name: shop.shopName.length > 10 ? shop.shopName.substring(0, 10) + '...' : shop.shopName,
              orders: shop.orderCount,
              completion: shop.completionRate
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#10B981" name="Đơn hàng" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default OverviewContent;