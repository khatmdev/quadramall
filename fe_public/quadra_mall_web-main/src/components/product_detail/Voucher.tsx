import React, { useState, useEffect, memo } from 'react';
import { DiscountCodeDTO } from '@/types/product/product_Detail';
import { FaTag } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { api } from '@/main';

interface VoucherProps {
  discountCodes: DiscountCodeDTO[] | null;
  onSaveVoucher: (voucherId: number) => Promise<void>; // Cập nhật type để hỗ trợ async
}

const Voucher: React.FC<VoucherProps> = ({ discountCodes, onSaveVoucher }) => {
  const [usedVouchers, setUsedVouchers] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState<number | null>(null);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const activeVouchers = discountCodes ?? [];

  // Lấy danh sách voucher đã lưu từ API nếu đã đăng nhập
  useEffect(() => {
    const fetchUsedVouchers = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await api.get('/voucher/saved');
        const savedVoucherIds = response.data.map((voucher: DiscountCodeDTO) => voucher.id);
        setUsedVouchers(savedVoucherIds);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách voucher đã lưu:', error);
      }
    };

    fetchUsedVouchers();
  }, [isAuthenticated]);

  const handleToggle = async (voucherId: number) => {
    if (!usedVouchers.includes(voucherId)) {
      setIsSaving(voucherId);
      try {
        await onSaveVoucher(voucherId); // Gọi API lưu voucher
        setUsedVouchers((prev) => [...prev, voucherId]);
      } finally {
        setIsSaving(null);
      }
    }
  };

  return (
    <div className="p-4 bg-gray-50 shadow rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Voucher cửa hàng</h3>
      {activeVouchers.length > 0 ? (
        activeVouchers.map((voucher) => {
          if (!voucher) return null;
          const isUsed = usedVouchers.includes(voucher.id);
          return (
            <div
              key={voucher.id}
              className="flex items-center justify-between rounded-lg p-2 mb-2 border border-green-300"
            >
              <div className="flex items-center">
                <FaTag className="w-6 h-6 text-green-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-700">{voucher.code}</p>
                  <p className="text-xs text-gray-600">{voucher.description ?? 'Không có mô tả'}</p>
                  <p className="text-xs text-gray-500">HSD: {voucher.endDate}</p>
                </div>
              </div>
              <button
                className={`rounded-full px-3 py-1 text-sm border border-green-600 ${
                  isUsed
                    ? 'text-green-600 bg-white hover:bg-gray-50'
                    : 'text-white bg-green-600 hover:bg-green-700'
                }`}
                onClick={() => handleToggle(voucher.id)}
                disabled={isUsed || isSaving === voucher.id}
              >
                {isSaving === voucher.id ? 'Đang lưu...' : isUsed ? 'Đã lưu' : 'Lưu'}
              </button>
            </div>
          );
        })
      ) : (
        <p className="text-gray-500 text-sm">Không có voucher nào hiện tại.</p>
      )}
    </div>
  );
};

export default memo(Voucher);
