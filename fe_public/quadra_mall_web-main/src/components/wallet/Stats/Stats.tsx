import React from 'react';
import { TrendingUp } from 'lucide-react';

export function Stats() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-green-100/50">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Thống kê</h2>
              <p className="text-gray-500">Tổng quan về hoạt động tài chính của bạn</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center">
            <p className="text-lg text-gray-600">Chưa có dữ liệu thống kê</p>
            <p className="text-sm text-gray-500 mt-2">Trang này sẽ hiển thị các biểu đồ và số liệu phân tích trong tương lai.</p>
          </div>
        </div>
      </div>
    </div>
  );
}