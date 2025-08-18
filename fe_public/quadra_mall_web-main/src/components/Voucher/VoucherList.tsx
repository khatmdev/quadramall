import React, { useMemo } from 'react';
import VoucherCard from './VoucherCard';

export interface Voucher {
  id: number;
  name: string;
  code: string;
  discount: string;
  condition: string;
  expiry: string;
  status: 'used' | 'unused' | 'expired';
  type: string;
}

interface VoucherListProps {
  search: string;
  filters: { type: string; status: string; expiry: string };
}

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

const VoucherList: React.FC<VoucherListProps> = ({ search, filters }) => {
  const filteredVouchers = useMemo(() => {
    return mockVouchers.filter(v => {
      const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.code.toLowerCase().includes(search.toLowerCase());
      const matchType = !filters.type || v.type === filters.type;
      const matchStatus = !filters.status || v.status === filters.status;
      const matchExpiry = !filters.expiry || v.expiry === filters.expiry;
      return matchSearch && matchType && matchStatus && matchExpiry;
    });
  }, [search, filters]);

  const handleAction = () => {
    // Đã loại bỏ alert và không cần logic ở đây
  };

  return (
    <div className="w-full p-0">
      <div>
        {filteredVouchers.length === 0 && <div className="text-center text-gray-400 py-8">Không có voucher phù hợp</div>}
        {filteredVouchers.map(voucher => (
          <VoucherCard key={voucher.id} voucher={voucher} onAction={handleAction} />
        ))}
      </div>
    </div>
  );
};

export default VoucherList;
