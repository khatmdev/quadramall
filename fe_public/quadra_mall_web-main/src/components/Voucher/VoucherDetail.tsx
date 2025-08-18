import React from 'react';
import { FaTimes, FaShoppingBag, FaRegCalendarCheck, FaRegClock, FaRegCheckCircle } from 'react-icons/fa';

interface Voucher {
  code?: string;
  discount?: string;
  description?: string;
  condition?: string;
  expiry?: string;
  startDate?: string;
  productApply?: string;
  payment?: string;
  shipping?: string[] | string;
  status?: string;
  quantity?: number;
}

interface VoucherDetailPopupProps {
  voucher: Voucher;
  open: boolean;
  onClose: () => void;
}

const VoucherDetail: React.FC<VoucherDetailPopupProps> = ({ voucher, open, onClose }) => {
  if (!open || !voucher) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-0 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 focus:outline-none"
          aria-label="Đóng"
        >
          <FaTimes className="text-gray-400 text-xl" />
        </button>
        <div className="flex flex-col items-center p-8 pb-4">
          <div className="bg-emerald-100 rounded-full p-4 mb-3">
            <FaShoppingBag className="text-emerald-500 text-4xl" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mb-1">{voucher?.code || '-'}</div>
          <div className="text-lg font-semibold text-emerald-500 mb-2">{voucher?.discount || '-'}</div>
          <div className="text-base text-gray-700 mb-2 text-center">{voucher?.description || '-'}</div>
          {/* Thêm trạng thái sử dụng và số lượng còn lại nếu có */}
          {voucher?.status && (
            <div className="text-sm text-blue-500 mb-1">Trạng thái: {voucher.status}</div>
          )}
          {voucher?.quantity !== undefined && (
            <div className="text-sm text-orange-500 mb-1">Số lượng còn lại: {voucher.quantity}</div>
          )}
        </div>
        <div className="border-t px-8 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <FaRegCheckCircle className="text-emerald-400" />
            <span className="font-medium">Điều kiện:</span> <span>{voucher?.condition || '-'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <FaRegCalendarCheck className="text-emerald-400" />
            <span className="font-medium">HSD:</span> <span>{voucher?.expiry || '-'}</span>
          </div>
          {voucher?.startDate && (
            <div className="flex items-center gap-2 text-gray-700 col-span-2">
              <FaRegClock className="text-emerald-400" />
              <span className="font-medium">Hiệu lực từ:</span> <span>{voucher.startDate}</span>
            </div>
          )}
          {voucher?.productApply && (
            <div className="flex items-center gap-2 text-gray-700 col-span-2">
              <span className="font-medium">Áp dụng cho:</span> <span>{voucher.productApply}</span>
            </div>
          )}
          {voucher?.payment && (
            <div className="flex items-center gap-2 text-gray-700 col-span-2">
              <span className="font-medium">Thanh toán:</span> <span>{voucher.payment}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-700 col-span-2">
            <span className="font-medium">Vận chuyển:</span> <span>{Array.isArray(voucher?.shipping) ? (voucher.shipping.length > 0 ? voucher.shipping.join(', ') : '-') : (voucher?.shipping || '-')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherDetail;
