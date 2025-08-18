import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Lock, Unlock, AlertTriangle, Mail, TrendingUp } from 'lucide-react';
import type { Shop, ViolationReport } from '@/types/shop';

interface AnalyticsContentProps {
  shops: Shop[];
  handleLockShop?: (shop: Shop) => void;
  handleViolationResponse?: (violation: ViolationReport, shop: Shop) => void;
}

const AnalyticsContent: React.FC<AnalyticsContentProps> = ({ shops, handleLockShop, handleViolationResponse }) => {
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-300';
      case 'pending_verification': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  // Giả lập dữ liệu doanh thu theo tháng
  const monthlyRevenueData = [
    { month: 'Jan', revenue: shops.reduce((sum, s) => sum + s.totalRevenue * 0.08, 0) },
    { month: 'Feb', revenue: shops.reduce((sum, s) => sum + s.totalRevenue * 0.09, 0) },
    { month: 'Mar', revenue: shops.reduce((sum, s) => sum + s.totalRevenue * 0.1, 0) },
    { month: 'Apr', revenue: shops.reduce((sum, s) => sum + s.totalRevenue * 0.11, 0) },
    { month: 'May', revenue: shops.reduce((sum, s) => sum + s.totalRevenue * 0.12, 0) },
    { month: 'Jun', revenue: shops.reduce((sum, s) => sum + s.totalRevenue * 0.13, 0) },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-6">Phân tích chi tiết</h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hiệu suất theo trạng thái */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Hiệu suất theo trạng thái</h4>
          {['active', 'suspended', 'pending_verification'].map(status => {
            const statusShops = shops.filter(s => s.status === status && !s.isLocked);
            const avgRating = statusShops.reduce((sum, s) => sum + s.rating, 0) / statusShops.length || 0;
            const avgCompletion = statusShops.reduce((sum, s) => sum + s.completionRate, 0) / statusShops.length || 0;

            return (
              <div key={status} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
                    {status === 'active' ? 'Hoạt động' : status === 'suspended' ? 'Tạm dừng' : 'Chờ xác minh'}
                  </span>
                  <span className="text-sm text-gray-600">{statusShops.length} shop</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Đánh giá TB:</span>
                    <span className="font-medium">{avgRating.toFixed(1)}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hoàn thành TB:</span>
                    <span className="font-medium">{avgCompletion.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tình trạng vi phạm */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Tình trạng vi phạm</h4>
          <div className="space-y-2">
            {['high', 'medium', 'low'].map(severity => {
              const violations = shops.flatMap(s => s.violationReports).filter(r => r.severity === severity);
              const count = violations.length;

              return (
                <div key={severity} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(severity)}`}>
                      {severity === 'high' ? 'Nghiêm trọng' : severity === 'medium' ? 'Trung bình' : 'Nhẹ'}
                    </span>
                  </div>
                  <span className="font-medium">{count} báo cáo</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Xu hướng tham gia */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Xu hướng tham gia</h4>
          <div className="space-y-2">
            {['2024', '2023'].map(year => {
              const yearShops = shops.filter(s => s.joinedDate.includes(year));
              return (
                <div key={year} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Năm {year}</span>
                  <span className="text-sm text-gray-600">{yearShops.length} shop tham gia</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Xu hướng doanh thu theo tháng */}
        <div className="space-y-4 lg:col-span-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <TrendingUp size={20} className="mr-2 text-blue-600" />
            Xu hướng doanh thu theo tháng
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: 'Doanh thu (triệu)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [value, 'Doanh thu (triệu)']} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Doanh thu trung bình" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Danh sách shop bị báo cáo vi phạm */}
        <div className="space-y-4 lg:col-span-3">
          <h4 className="font-medium text-gray-900">Danh sách shop bị báo cáo vi phạm</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            {shops.filter(s => s.violationReports.length > 0).length === 0 ? (
              <p className="text-gray-500 text-center">Không có shop nào bị báo cáo vi phạm</p>
            ) : (
              <div className="space-y-2">
                {shops.filter(s => s.violationReports.length > 0).map(shop => (
                  <div key={shop.id} className="p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={shop.avatar} alt={shop.shopName} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-medium">{shop.shopName}</p>
                        <p className="text-sm text-gray-600">{shop.violationReports.length} báo cáo</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedShop(shop)}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                      >
                        Xem chi tiết
                      </button>
                      {handleLockShop && (
                        <button
                          onClick={() => handleLockShop(shop)}
                          className={`px-3 py-1 rounded-lg ${
                            shop.isLocked
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                        >
                          {shop.isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                        </button>
                      )}
                      <button
                        onClick={() => window.open(`mailto:${shop.email}`)}
                        className="px-3 py-1 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200"
                      >
                        <Mail size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal chi tiết báo cáo vi phạm */}
      {selectedShop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Báo cáo vi phạm: {selectedShop.shopName}</h3>
            </div>
            <div className="p-6">
              {selectedShop.violationReports.length === 0 ? (
                <p className="text-gray-500">Không có báo cáo nào</p>
              ) : (
                <div className="space-y-4">
                  {selectedShop.violationReports.map(report => (
                    <div key={report.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(report.severity)}`}>
                          {report.severity === 'high' ? 'Nghiêm trọng' : report.severity === 'medium' ? 'Trung bình' : 'Nhẹ'}
                        </span>
                        <span className="text-sm text-gray-600">{new Date(report.reportedAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <p className="font-medium">{report.reason}</p>
                      <p className="text-sm text-gray-600">{report.description}</p>
                      {report.evidence && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Bằng chứng:</p>
                          <img
                            src={report.evidence}
                            alt="Bằng chứng vi phạm"
                            className="mt-2 max-w-full h-auto rounded-lg"
                            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/200?text=Không+tải+được+ảnh')}
                          />
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mt-2">Trạng thái: {report.status === 'pending' ? 'Chờ xử lý' : report.status === 'resolved' ? 'Đã xử lý' : 'Bị từ chối'}</p>
                      {report.response && <p className="text-sm text-gray-600 mt-2">Phản hồi: {report.response}</p>}
                      {report.adminNote && <p className="text-sm text-gray-600 mt-2">Ghi chú admin: {report.adminNote}</p>}
                      {handleViolationResponse && report.status === 'pending' && (
                        <button
                          onClick={() => handleViolationResponse(report, selectedShop)}
                          className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200"
                        >
                          Phản hồi báo cáo
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedShop(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsContent;