// src/components/dashboard/ShopUserChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { RevenueData } from '@/types/dashboard';

interface ShopUserChartProps {
  data: RevenueData[];
}

const ShopUserChart: React.FC<ShopUserChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Số lượng Shop & Người dùng theo tháng</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="shops" fill="#10b981" name="Số shop" />
          <Bar dataKey="users" fill="#3b82f6" name="Người dùng" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ShopUserChart;