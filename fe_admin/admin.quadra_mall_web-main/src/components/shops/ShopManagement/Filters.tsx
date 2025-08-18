import React from 'react';

interface FiltersProps {
  filters: {
    status: string;
    verificationStatus: string;
    sortBy: string;
    sortOrder: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    status: string;
    verificationStatus: string;
    sortBy: string;
    sortOrder: string;
  }>>;
}

const Filters: React.FC<FiltersProps> = ({ filters, setFilters }) => {
  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex flex-wrap gap-4">
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="suspended">Tạm dừng</option>
          <option value="pending_verification">Chờ xác minh</option>
        </select>

        <select
          value={filters.verificationStatus}
          onChange={(e) => setFilters(prev => ({ ...prev, verificationStatus: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả trạng thái xác minh</option>
          <option value="verified">Đã xác minh</option>
          <option value="pending">Chờ xác minh</option>
          <option value="rejected">Bị từ chối</option>
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="revenue">Sắp xếp theo doanh thu</option>
          <option value="rating">Sắp xếp theo đánh giá</option>
          <option value="orders">Sắp xếp theo đơn hàng</option>
          <option value="joinDate">Sắp xếp theo ngày tham gia</option>
        </select>

        <button
          onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc' }))}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
        >
          {filters.sortOrder === 'desc' ? '↓' : '↑'} {filters.sortOrder === 'desc' ? 'Giảm dần' : 'Tăng dần'}
        </button>
      </div>
    </div>
  );
};

export default Filters;