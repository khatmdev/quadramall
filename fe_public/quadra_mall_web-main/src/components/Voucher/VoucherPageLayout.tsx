import React, { useState } from 'react';
import VoucherList from './VoucherList';
import VoucherFilter from './VoucherFilter';
import VoucherSearch from './VoucherSearch';
import Pagination from '../../model/Pagination';

const VoucherPageLayout: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ type: '', status: '', expiry: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5; 

  return (
    <div className="max-w-3xl mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kho Voucher</h1>
        <span className="text-emerald-500 font-semibold cursor-pointer hover:underline text-base md:text-lg" tabIndex={0} role="button">
          Lịch sử
        </span>
      </div>
      <VoucherSearch value={search} onChange={setSearch} />
      <VoucherFilter {...filters} onChange={setFilters} />
      <VoucherList search={search} filters={filters} />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default VoucherPageLayout;
