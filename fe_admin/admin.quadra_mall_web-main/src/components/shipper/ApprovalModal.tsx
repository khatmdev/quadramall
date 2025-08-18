import React, { useState } from 'react';
import { X, Check, AlertTriangle, MessageCircle } from 'lucide-react';
import { ShipperRegistration } from '@/store/Shipper/shipperSlice';

interface ApprovalModalProps {
  show: boolean;
  action: 'approve' | 'reject';
  registration: ShipperRegistration | null;
  onClose: () => void;
  onApprove: (note?: string) => void;
  onReject: (reason: string) => void;
  loading: boolean;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  show,
  action,
  registration,
  onClose,
  onApprove,
  onReject,
  loading,
}) => {
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  const predefinedReasons = [
    'Hồ sơ không đầy đủ',
    'Giấy tờ không rõ ràng',
    'Thông tin không chính xác',
    'Không đủ điều kiện',
    'Phương tiện không phù hợp',
    'Bằng lái không hợp lệ',
    'Khác'
  ];

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(note.trim() || undefined);
    } else {
      const finalReason = selectedReason === 'Khác' ? reason : selectedReason;
      if (finalReason.trim()) {
        onReject(finalReason.trim());
      }
    }
  };

  const handleClose = () => {
    setNote('');
    setReason('');
    setSelectedReason('');
    onClose();
  };

  const isValid = action === 'approve' || 
    (action === 'reject' && 
     ((selectedReason && selectedReason !== 'Khác') || 
      (selectedReason === 'Khác' && reason.trim())));

  if (!show || !registration) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full">
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b border-gray-200 ${
          action === 'approve' 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50' 
            : 'bg-gradient-to-r from-red-50 to-pink-50'
        } rounded-t-2xl`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              action === 'approve' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {action === 'approve' ? <Check size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {action === 'approve' ? 'Duyệt đăng ký' : 'Từ chối đăng ký'}
              </h2>
              <p className="text-gray-600">
                {registration.userFullName} - {registration.userEmail}
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Registration Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Thông tin đăng ký</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Họ tên:</span> 
                <span className="font-medium ml-2">{registration.userFullName}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span> 
                <span className="font-medium ml-2">{registration.userEmail}</span>
              </div>
              <div>
                <span className="text-gray-600">Phương tiện:</span> 
                <span className="font-medium ml-2">
                  {registration.vehicleType === 'MOTORBIKE' ? 'Xe máy' : 
                   registration.vehicleType === 'CAR' ? 'Ô tô' : 'Xe đạp'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Biển số:</span> 
                <span className="font-medium ml-2">{registration.licensePlate}</span>
              </div>
            </div>
          </div>

          {action === 'approve' ? (
            /* Approval Form */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MessageCircle size={16} />
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Thêm ghi chú nếu cần..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Ghi chú sẽ được gửi đến shipper cùng với thông báo duyệt
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Xác nhận duyệt đăng ký</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Shipper sẽ nhận được thông báo qua email và có thể bắt đầu nhận đơn hàng.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Rejection Form */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Lý do từ chối <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {predefinedReasons.map((reasonOption) => (
                    <label key={reasonOption} className="flex items-center">
                      <input
                        type="radio"
                        name="reason"
                        value={reasonOption}
                        checked={selectedReason === reasonOption}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        disabled={loading}
                      />
                      <span className="ml-3 text-sm text-gray-700">{reasonOption}</span>
                    </label>
                  ))}
                </div>
              </div>

              {selectedReason === 'Khác' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do cụ thể <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Nhập lý do từ chối cụ thể..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    disabled={loading}
                  />
                </div>
              )}

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Xác nhận từ chối đăng ký</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Shipper sẽ nhận được email thông báo từ chối kèm lý do. 
                      Họ có thể đăng ký lại sau khi khắc phục.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className={`px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              action === 'approve'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang xử lý...
              </div>
            ) : (
              <>
                {action === 'approve' ? (
                  <div className="flex items-center gap-2">
                    <Check size={16} />
                    Duyệt đăng ký
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <X size={16} />
                    Từ chối đăng ký
                  </div>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;