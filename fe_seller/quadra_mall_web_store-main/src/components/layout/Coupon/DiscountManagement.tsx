// components/layout/Coupon/DiscountManagement.tsx - OPTIMIZED VERSION
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store';
import {
  setFilters,
  deleteDiscountCode,
  toggleDiscountStatus,
  setSelectedDiscount,
  setModalOpen,
  fetchDiscountCodes,
  fetchProducts,
  searchDiscountCodes,
  clearError,
  DiscountCodeDTO
} from '@/store/Discount/discountSlice';
import { 
  formatDateOnly, 
  formatDateTimeDisplay,
  getDiscountStatus
} from '@/services/discountService';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  ShoppingBag,
  Tag,
  Calendar,
  Users,
  Percent,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import DiscountModal from './DiscountModal';

const DiscountManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    discounts, 
    filters, 
    isLoading, 
    error, 
    pagination 
  } = useSelector((state: RootState) => state.discounts);
  
  const { storeId } = useSelector((state: RootState) => state.auth);
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Get storeId from localStorage or auth state
  const currentStoreId = storeId || parseInt(localStorage.getItem('selectedStoreId') || '1');

  // Initial data fetch
  useEffect(() => {
    console.log('Initial fetch with storeId:', currentStoreId);
    if (currentStoreId) {
      dispatch(fetchDiscountCodes({ 
        storeId: currentStoreId, 
        page: currentPage, 
        size: pageSize,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection
      }));
      dispatch(fetchProducts(currentStoreId));
    }
  }, [dispatch, currentStoreId]);

  // Fetch data when page changes
  useEffect(() => {
    if (currentStoreId) {
      dispatch(fetchDiscountCodes({ 
        storeId: currentStoreId, 
        page: currentPage, 
        size: pageSize,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection
      }));
    }
  }, [dispatch, currentStoreId, currentPage, pageSize, filters.sortBy, filters.sortDirection]);

  // Debounced search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (filters.search.trim()) {
      const timeout = setTimeout(() => {
        console.log('Searching with keyword:', filters.search);
        dispatch(searchDiscountCodes({
          storeId: currentStoreId,
          keyword: filters.search,
          page: currentPage,
          size: pageSize
        }));
      }, 500);
      setSearchTimeout(timeout);
    } else {
      dispatch(fetchDiscountCodes({ 
        storeId: currentStoreId, 
        page: currentPage, 
        size: pageSize,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection
      }));
    }

    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [filters.search]);

  // Filtered discounts based on client-side filters
  const filteredDiscounts = useMemo(() => {
    console.log('Filtering discounts:', discounts);
    return discounts.filter((discount: DiscountCodeDTO) => {
      const matchesAppliesTo = filters.appliesTo === 'all' || 
        (filters.appliesTo === 'SHOP' && discount.appliesTo === 'SHOP') ||
        (filters.appliesTo === 'PRODUCTS' && discount.appliesTo === 'PRODUCTS');
      
      const matchesStatus = filters.isActive === 'all' || 
        (filters.isActive === 'active' && discount.isActive) ||
        (filters.isActive === 'inactive' && !discount.isActive);

      return matchesAppliesTo && matchesStatus;
    });
  }, [discounts, filters.appliesTo, filters.isActive]);

  const handleCreateDiscount = () => {
    dispatch(setSelectedDiscount(null));
    dispatch(setModalOpen(true));
  };

  const handleEditDiscount = (discount: DiscountCodeDTO) => {
    console.log('Editing discount:', discount);
    dispatch(setSelectedDiscount(discount));
    dispatch(setModalOpen(true));
  };

  const handleDeleteDiscount = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
      await dispatch(deleteDiscountCode(id));
      // Refresh data after delete
      dispatch(fetchDiscountCodes({ 
        storeId: currentStoreId, 
        page: currentPage, 
        size: pageSize 
      }));
    }
  };

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    await dispatch(toggleDiscountStatus({ id, isActive: !isActive }));
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // You can add toast notification here
    console.log('Copied code:', code);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0); // Reset to first page
  };

  const handleRefresh = () => {
    dispatch(fetchDiscountCodes({ 
      storeId: currentStoreId, 
      page: currentPage, 
      size: pageSize,
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} />;
      case 'expired':
        return <XCircle size={16} />;
      case 'paused':
      case 'scheduled':
        return <AlertCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  console.log('Render - discounts:', discounts, 'filteredDiscounts:', filteredDiscounts);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Mã Giảm Giá</h1>
          <p className="text-gray-600">Tạo và quản lý các mã giảm giá cho cửa hàng của bạn</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Làm mới
          </button>
          <button
            onClick={handleCreateDiscount}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={20} />
            Tạo Mã Giảm Giá
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <XCircle className="text-red-600" size={20} />
            <div>
              <h3 className="text-red-800 font-medium">Có lỗi xảy ra</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={() => dispatch(clearError())}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <XCircle size={16} />
            </button>
          </div>
        </div>
      )}


      {/* Quick Create Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border-2 border-dashed border-green-200 hover:border-green-400 transition-colors cursor-pointer"
             onClick={handleCreateDiscount}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <ShoppingBag className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Mã Giảm Giá Toàn Shop</h3>
              <p className="text-sm text-gray-600">Áp dụng cho tất cả sản phẩm trong shop</p>
            </div>
          </div>
          <button className="w-full bg-green-50 text-green-600 py-2 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
            Tạo ngay
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg border-2 border-dashed border-orange-200 hover:border-orange-400 transition-colors cursor-pointer"
             onClick={handleCreateDiscount}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Tag className="text-orange-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Mã Giảm Giá Sản Phẩm</h3>
              <p className="text-sm text-gray-600">Chỉ áp dụng cho những sản phẩm nhất định</p>
            </div>
          </div>
          <button className="w-full bg-orange-50 text-orange-600 py-2 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
            Tạo ngay
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã giảm giá..."
              value={filters.search}
              onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter size={20} />
            Bộ lọc
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phạm vi áp dụng</label>
                <select
                  value={filters.appliesTo}
                  onChange={(e) => dispatch(setFilters({ appliesTo: e.target.value as 'all' | 'SHOP' | 'PRODUCTS' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">Tất cả</option>
                  <option value="SHOP">Toàn shop</option>
                  <option value="PRODUCTS">Sản phẩm cụ thể</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={filters.isActive}
                  onChange={(e) => dispatch(setFilters({ isActive: e.target.value as 'all' | 'active' | 'inactive' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">Tất cả</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Tạm dừng</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp theo</label>
                <div className="flex gap-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => dispatch(setFilters({ sortBy: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="createdAt">Ngày tạo</option>
                    <option value="startDate">Ngày bắt đầu</option>
                    <option value="endDate">Ngày kết thúc</option>
                    <option value="code">Mã giảm giá</option>
                  </select>
                  <select
                    value={filters.sortDirection}
                    onChange={(e) => dispatch(setFilters({ sortDirection: e.target.value as 'asc' | 'desc' }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="desc">Giảm dần</option>
                    <option value="asc">Tăng dần</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Discounts List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Đang tải dữ liệu...</h3>
            <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
          </div>
        ) : filteredDiscounts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Tag className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filters.search || filters.appliesTo !== 'all' || filters.isActive !== 'all' 
                ? 'Không tìm thấy mã giảm giá nào' 
                : 'Chưa có mã giảm giá nào'}
            </h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.appliesTo !== 'all' || filters.isActive !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác'
                : 'Tạo mã giảm giá đầu tiên để thu hút khách hàng'}
            </p>
            {(!filters.search && filters.appliesTo === 'all' && filters.isActive === 'all') && (
              <button
                onClick={handleCreateDiscount}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Tạo Mã Giảm Giá
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã Giảm Giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại & Giảm giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sử dụng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDiscounts.map((discount: DiscountCodeDTO) => {
                    const statusInfo = getDiscountStatus(discount);
                    
                    return (
                      <tr key={discount.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {discount.description || 'Mã giảm giá không có tên'}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                                {discount.code}
                              </code>
                              <button
                                onClick={() => handleCopyCode(discount.code)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                title="Copy mã giảm giá"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Bởi {discount.createdByName || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 mb-1">
                            {discount.appliesTo === 'SHOP' ? (
                              <>
                                <ShoppingBag className="text-green-600" size={16} />
                                <span className="text-sm text-green-600 font-medium">Toàn shop</span>
                              </>
                            ) : (
                              <>
                                <Tag className="text-orange-600" size={16} />
                                <span className="text-sm text-orange-600 font-medium">Sản phẩm</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            {discount.discountType === 'PERCENTAGE' ? (
                              <>
                                <Percent size={14} />
                                <span className="font-medium">{discount.discountValue}%</span>
                                {discount.maxDiscountValue && (
                                  <span className="text-xs text-gray-500">
                                    (tối đa {formatCurrency(discount.maxDiscountValue)})
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
                                <DollarSign size={14} />
                                <span className="font-medium">{formatCurrency(discount.discountValue)}</span>
                              </>
                            )}
                          </div>
                          {discount.minOrderAmount > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              Đơn tối thiểu: {formatCurrency(discount.minOrderAmount)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar size={14} />
                            <div>
                              <div className="font-medium">{formatDateOnly(discount.startDate)}</div>
                              <div className="text-xs text-gray-500">đến {formatDateOnly(discount.endDate)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm mb-1">
                            <Users size={14} className="text-gray-400" />
                            <span className="font-medium">{discount.usedCount}</span>
                            <span className="text-gray-500">/ {discount.maxUses}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${Math.min((discount.usedCount / discount.maxUses) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {discount.maxUses - discount.usedCount} lượt còn lại
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                            {getStatusIcon(statusInfo.status)}
                            {statusInfo.text}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleStatus(discount.id, discount.isActive)}
                              className={`transition-colors ${
                                discount.isActive 
                                  ? 'text-green-600 hover:text-green-800' 
                                  : 'text-gray-400 hover:text-gray-600'
                              }`}
                              title={discount.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                            >
                              {discount.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            </button>
                            <button
                              onClick={() => handleEditDiscount(discount)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteDiscount(discount.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Hiển thị</span>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span>trên {pagination.totalElements} kết quả</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={pagination.isFirst}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNumber;
                        if (pagination.totalPages <= 5) {
                          pageNumber = i;
                        } else if (currentPage < 3) {
                          pageNumber = i;
                        } else if (currentPage > pagination.totalPages - 3) {
                          pageNumber = pagination.totalPages - 5 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-3 py-1 rounded-lg text-sm ${
                              currentPage === pageNumber
                                ? 'bg-green-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber + 1}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={pagination.isLast}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <DiscountModal />
    </div>
  );
};

export default DiscountManagement;