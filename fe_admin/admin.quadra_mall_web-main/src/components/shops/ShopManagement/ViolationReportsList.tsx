import React from 'react';
import type { Shop, ViolationReport } from '@/types/shop';
import { Eye, Lock, Unlock, Mail, AlertTriangle } from 'lucide-react';

interface ViolationReportsListProps {
  reports: Array<ViolationReport & { shop: Shop }>;
  handleLockShop: (shop: Shop) => void;
  handleViolationResponse: (violation: ViolationReport, shop: Shop) => void;
  setSelectedShop: (shop: Shop | null) => void;
  setShowShopDetails: (show: boolean) => void;
}

const ViolationReportsList: React.FC<ViolationReportsListProps> = ({
  reports,
  handleLockShop,
  handleViolationResponse,
  setSelectedShop,
  setShowShopDetails
}) => {
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shop
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Báo cáo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mức độ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày báo cáo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <AlertTriangle size={48} className="text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">Không tìm thấy báo cáo vi phạm nào</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Thử thay đổi từ khóa tìm kiếm
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={report.shop.avatar}
                        alt={report.shop.shopName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{report.shop.shopName}</div>
                        <div className="text-sm text-gray-500">{report.shop.ownerName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">{report.reason}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{report.description}</div>
                      {report.evidence && (
                        <a
                          href={report.evidence}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Xem bằng chứng
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(report.severity)}`}>
                      {report.severity === 'high' ? 'Nghiêm trọng' : report.severity === 'medium' ? 'Trung bình' : 'Nhẹ'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                      {report.status === 'pending' ? 'Chờ xử lý' : report.status === 'resolved' ? 'Đã xử lý' : 'Bị từ chối'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {new Date(report.reportedAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedShop(report.shop);
                          setShowShopDetails(true);
                        }}
                        className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                        title="Xem chi tiết shop"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleViolationResponse(report, report.shop)}
                        className="p-2 bg-yellow-100 text-yellow-600 hover:bg-yellow-200 rounded-lg transition-colors"
                        title="Phản hồi báo cáo"
                      >
                        <AlertTriangle size={16} />
                      </button>
                      <button
                        onClick={() => handleLockShop(report.shop)}
                        className={`p-2 rounded-lg transition-colors ${
                          report.shop.isLocked
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                        title={report.shop.isLocked ? 'Mở khóa' : 'Khóa shop'}
                      >
                        {report.shop.isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                      </button>
                      <button
                        onClick={() => window.open(`mailto:${report.shop.email}`)}
                        className="p-2 bg-purple-100 text-purple-600 hover:bg-purple-200 rounded-lg transition-colors"
                        title="Gửi email"
                      >
                        <Mail size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViolationReportsList;