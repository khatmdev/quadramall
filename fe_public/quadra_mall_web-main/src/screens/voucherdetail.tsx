import React from 'react';
import VoucherDetailList from '@/components/VoucherDetail/VoucherDetailList';

interface VoucherDetailLayoutProps {
  search: string;
  filters: { type: string; status: string; expiry: string };
}

const VoucherDetailLayout: React.FC<VoucherDetailLayoutProps> = ({ search, filters }) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-4 mt-6 mb-20">
      <h2 className="text-2xl font-bold text-emerald-600 mb-4 text-center">Chi tiết Voucher</h2>
      {/* Có thể bổ sung thêm các thành phần header, filter, breadcrumb... tại đây */}
      <VoucherDetailList search={search} filters={filters} />
    </div>
  );
};

export default VoucherDetailLayout;
