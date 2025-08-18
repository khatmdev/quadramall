import React from 'react';
import { XCircle } from 'lucide-react';
import type { Shop, ViolationReport } from '@/types/shop';

interface ViolationResponseModalProps {
  show: boolean;
  violation: ViolationReport | null;
  shop: Shop | null;
  violationResponse: string;
  setViolationResponse: (response: string) => void;
  adminNote: string;
  setAdminNote: (note: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const ViolationResponseModal: React.FC<ViolationResponseModalProps> = ({
  show,
  violation,
  shop,
  violationResponse,
  setViolationResponse,
  adminNote,
  setAdminNote,
  onSubmit,
  onClose
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!show || !violation || !shop) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Phản hồi báo cáo vi phạm</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Thông tin báo cáo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Shop bị báo cáo</p>
                  <p className="font-medium">{shop.shopName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Người báo cáo</p>
                  <p className="font-medium">{violation.reporterName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lý do</p>
                  <p className="font-medium">{violation.reason}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mức độ</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(violation.severity)}`}>
                    {violation.severity === 'high' ? 'Nghiêm trọng' : violation.severity === 'medium' ? 'Trung bình' : 'Nhẹ'}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Mô tả chi tiết</p>
                  <p className="font-medium">{violation.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày báo cáo</p>
                  <p className="font-medium">{new Date(violation.reportedAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    violation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    violation.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {violation.status === 'pending' ? 'Chờ xử lý' : violation.status === 'resolved' ? 'Đã giải quyết' : 'Đã bỏ qua'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phản hồi cho người báo cáo <span className="text-red-500">*</span>
              </label>
              <textarea
                value={violationResponse}
                onChange={(e) => setViolationResponse(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Nhập phản hồi để gửi cho người báo cáo..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú nội bộ (tùy chọn)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Ghi chú nội bộ cho quản trị viên..."
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={onSubmit}
              disabled={!violationResponse.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Gửi phản hồi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViolationResponseModal;