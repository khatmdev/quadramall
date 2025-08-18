import React, { useMemo } from 'react';
import VoucherCard from '../Voucher/VoucherCard';
import { Voucher } from '../Voucher/VoucherList';

const mockVouchers: Voucher[] = [
  {
    id: 1,
    name: 'Voucher Freeship 30K',
    code: 'FREESHIP30',
    discount: 'Miễn phí vận chuyển 30K',
    condition: 'Đơn từ 199K',
    expiry: '2025-07-01',
    status: 'unused',
    type: 'freeship',
  },
  {
    id: 2,
    name: 'Voucher Giảm 50K',
    code: 'SALE50',
    discount: 'Giảm 50K',
    condition: 'Đơn từ 500K',
    expiry: '2025-06-25',
    status: 'used',
    type: 'discount',
  },
  {
    id: 3,
    name: 'Voucher Hoàn xu 10%',
    code: 'COIN10',
    discount: 'Hoàn xu 10%',
    condition: 'Đơn từ 100K',
    expiry: '2025-06-20',
    status: 'expired',
    type: 'coin',
  },
  {
    id: 4,
    name: 'Voucher Giảm 20%',
    code: 'SALE20',
    discount: 'Giảm 20%',
    condition: 'Đơn từ 200K',
    expiry: '2025-07-10',
    status: 'unused',
    type: 'discount',
  },
];

const VoucherHistoryPage: React.FC = () => {
  // Chỉ lấy voucher đã dùng hoặc hết hạn
  const historyVouchers = useMemo(() =>
    mockVouchers.filter(v => v.status === 'used' || v.status === 'expired'),
    []
  );

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lịch sử Voucher</h1>
      </div>
      <div>
        {historyVouchers.length === 0 && <div className="text-center text-gray-400 py-8">Không có voucher đã dùng hoặc hết hạn</div>}
        {historyVouchers.map(voucher => (
          <VoucherCard key={voucher.id} voucher={voucher} />
        ))}
      </div>
    </div>
  );
};

export default VoucherHistoryPage;
