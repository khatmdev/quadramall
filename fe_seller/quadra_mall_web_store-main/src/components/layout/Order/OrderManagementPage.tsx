import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchOrderStats,
  fetchOrders,
  setFilters,
  clearFilters,
  toggleOrderSelection,
  selectAllOrders,
  clearSelection,
  updateMultipleOrderStatus,
  clearError
} from '@/store/OrderManagement/orderManagementSlice';
import {
  OrderStatus,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
  SHIPPING_METHOD_LABELS
} from '@/types/OrderManagement';
import {
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiCheckSquare,
  FiSquare,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiDollarSign,
  FiTruck,
  FiX,
  FiCheck,
  FiChevronDown
} from 'react-icons/fi';
import { RiStore3Fill as FiStore} from "react-icons/ri";

import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import {AppDispatch, RootState} from "@/store";

const statusTabs = [
  { label: 'Tất cả', value: undefined, icon: FiPackage },
  { label: 'Chờ xử lý', value: OrderStatus.PENDING, icon: FiPackage },
  { label: 'Đang xử lý', value: OrderStatus.PROCESSING, icon: FiRefreshCw },
  { label: 'Chuẩn bị hàng', value: OrderStatus.CONFIRMED_PREPARING, icon: FiPackage },
  { label: 'Đã giao shipper', value: OrderStatus.ASSIGNED_TO_SHIPPER, icon: FiTruck },
  { label: 'Đã giao hàng', value: OrderStatus.DELIVERED, icon: FiCheck },
  { label: 'Đã hủy', value: OrderStatus.CANCELLED, icon: FiX }
];

const OrderManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    stats,
    statsLoading,
    orders,
    orderListLoading,
    pagination,
    filters,
    selectedOrderIds,
    error,
    updating
  } = useSelector((state: RootState) => state.orders);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(undefined);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const selectedStoreId = useSelector((state:RootState) =>state.auth.storeId);



  // Load stats and orders when store changes
  useEffect(() => {
    console.log('Selected Store ID:', selectedStoreId);
    if (selectedStoreId) {
      dispatch(fetchOrderStats({ storeId: selectedStoreId }));
      dispatch(fetchOrders({ storeId: selectedStoreId }));
    }
  }, [dispatch, selectedStoreId]);

  // Handle filter changes
  useEffect(() => {
    if (!selectedStoreId) return;

    const filterTimeout = setTimeout(() => {
      dispatch(setFilters({
        status: selectedStatus,
        customerName: searchQuery,
        ...dateRange
      }));

      dispatch(fetchOrders({
        page: 0,
        storeId: selectedStoreId,
        filters: {
          status: selectedStatus,
          customerName: searchQuery,
          ...dateRange
        }
      }));
    }, 500);

    return () => clearTimeout(filterTimeout);
  }, [dispatch, searchQuery, selectedStatus, dateRange, selectedStoreId]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Memoized values
  const selectedOrdersWithSameStatus = useMemo(() => {
    if (selectedOrderIds.length === 0) return null;

    const selectedOrders = orders.filter(order => selectedOrderIds.includes(order.id));
    const firstStatus = selectedOrders[0]?.status;

    if (selectedOrders.every(order => order.status === firstStatus)) {
      return { status: firstStatus, count: selectedOrders.length };
    }

    return null;
  }, [selectedOrderIds, orders]);



  const handlePageChange = (page: number) => {
    if (!selectedStoreId) return;

    dispatch(fetchOrders({
      page,
      size: pagination.pageSize,
      storeId: selectedStoreId,
      filters
    }));
  };

  const handleSelectAll = () => {
    if (selectedOrderIds.length === orders.length) {
      dispatch(clearSelection());
    } else {
      const orderIds = orders.map(order => order.id);
      dispatch(selectAllOrders({ orderIds }));
    }
  };

  const handleBatchStatusUpdate = async (newStatus: OrderStatus) => {
    if (!selectedOrdersWithSameStatus) {
      toast.error('Vui lòng chọn các đơn hàng có cùng trạng thái');
      return;
    }

    const result = await Swal.fire({
      title: 'Xác nhận cập nhật',
      text: `Bạn có chắc muốn cập nhật ${selectedOrdersWithSameStatus.count} đơn hàng thành "${ORDER_STATUS_LABELS[newStatus]}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await dispatch(updateMultipleOrderStatus({
          orderIds: selectedOrderIds,
          status: newStatus
        })).unwrap();

        toast.success(`Đã cập nhật ${selectedOrdersWithSameStatus.count} đơn hàng thành công`);

        // Refresh data
        if (selectedStoreId) {
          dispatch(fetchOrders({ storeId: selectedStoreId, filters }));
          dispatch(fetchOrderStats({ storeId: selectedStoreId }));
        }
      } catch (error) {
        // Error handled by Redux
      }
    }
  };

  const getAvailableBatchActions = () => {
    if (!selectedOrdersWithSameStatus) return [];

    const { status } = selectedOrdersWithSameStatus;
    switch (status) {
      case OrderStatus.PENDING:
        return [
          { label: 'Xử lý', status: OrderStatus.PROCESSING, color: 'bg-blue-500 hover:bg-blue-600' },
          { label: 'Hủy', status: OrderStatus.CANCELLED, color: 'bg-red-500 hover:bg-red-600' }
        ];
      case OrderStatus.PROCESSING:
        return [
          { label: 'Xác nhận', status: OrderStatus.CONFIRMED_PREPARING, color: 'bg-purple-500 hover:bg-purple-600' },
          { label: 'Hủy', status: OrderStatus.CANCELLED, color: 'bg-red-500 hover:bg-red-600' }
        ];
      case OrderStatus.CONFIRMED_PREPARING:
        return [
          { label: 'Giao shipper', status: OrderStatus.ASSIGNED_TO_SHIPPER, color: 'bg-green-500 hover:bg-green-600' }
        ];
      default:
        return [];
    }
  };

  const handleRefresh = () => {
    if (selectedStoreId) {
      dispatch(fetchOrderStats({ storeId: selectedStoreId }));
      dispatch(fetchOrders({ storeId: selectedStoreId, filters }));
    }
  };

  const renderStatsCards = () => {
    if (!stats) return null;

    const statsCards = [
      { label: 'Tổng đơn hàng', value: stats.totalOrders, icon: FiPackage, color: 'bg-blue-500' },
      { label: 'Chờ xử lý', value: stats.pendingOrders, icon: FiPackage, color: 'bg-yellow-500' },
      { label: 'Đang xử lý', value: stats.processingOrders, icon: FiRefreshCw, color: 'bg-blue-500' },
      { label: 'Chuẩn bị hàng', value: stats.confirmedPreparingOrders, icon: FiPackage, color: 'bg-purple-500' },
      { label: 'Doanh thu tháng', value: `${(stats.monthlyRevenue / 1000000).toFixed(1)}M`, icon: FiDollarSign, color: 'bg-green-500' }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {statsCards.map((card, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <card.icon className="text-white text-xl" />
                  </div>
                </div>
              </div>
          ))}
        </div>
    );
  };

  

  return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Quản lý đơn hàng
            </h1>
          </div>
          <button
              onClick={handleRefresh}
              disabled={statsLoading || orderListLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            <FiRefreshCw className={`text-sm ${(statsLoading || orderListLoading) ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        {/* Store Selector */}

        {/* Statistics Cards */}
        {renderStatsCards()}

        {/* Status Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
                <button
                    key={tab.label}
                    onClick={() => setSelectedStatus(tab.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedStatus === tab.value
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <tab.icon className="text-sm" />
                  {tab.label}
                  {stats && tab.value && (
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                          selectedStatus === tab.value ? 'bg-white text-blue-500' : 'bg-gray-200 text-gray-600'
                      }`}>
                  {tab.value === OrderStatus.PENDING && stats.pendingOrders}
                        {tab.value === OrderStatus.PROCESSING && stats.processingOrders}
                        {tab.value === OrderStatus.CONFIRMED_PREPARING && stats.confirmedPreparingOrders}
                        {tab.value === OrderStatus.ASSIGNED_TO_SHIPPER && stats.assignedToShipperOrders}
                        {tab.value === OrderStatus.DELIVERED && stats.deliveredOrders}
                        {tab.value === OrderStatus.CANCELLED && stats.cancelledOrders}
                </span>
                  )}
                </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                  type="text"
                  placeholder="Tìm kiếm theo tên khách hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                    showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <FiFilter className="text-sm" />
              Bộ lọc
            </button>
          </div>

          {/* Extended Filters */}
          {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                    <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                    <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                      onClick={() => {
                        setDateRange({ startDate: '', endDate: '' });
                        setSearchQuery('');
                        setSelectedStatus(undefined);
                        dispatch(clearFilters());
                      }}
                      className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              </div>
          )}
        </div>

        {/* Batch Actions */}
        {selectedOrderIds.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-900">
                Đã chọn {selectedOrderIds.length} đơn hàng
              </span>
                  {selectedOrdersWithSameStatus && (
                      <span className="text-sm text-blue-700">
                  (Trạng thái: {ORDER_STATUS_LABELS[selectedOrdersWithSameStatus.status]})
                </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getAvailableBatchActions().map((action) => (
                      <button
                          key={action.status}
                          onClick={() => handleBatchStatusUpdate(action.status)}
                          disabled={updating}
                          className={`px-3 py-1 text-sm text-white rounded-lg ${action.color} disabled:opacity-50 transition-colors`}
                      >
                        {action.label}
                      </button>
                  ))}
                  <button
                      onClick={() => dispatch(clearSelection())}
                      className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {orderListLoading ? (
              <div className="flex items-center justify-center py-12">
                <FiRefreshCw className="animate-spin text-2xl text-gray-400 mr-3" />
                <span className="text-gray-600">Đang tải...</span>
              </div>
          ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <button
                          onClick={handleSelectAll}
                          className="flex items-center gap-2 text-sm font-medium text-gray-700"
                      >
                        {selectedOrderIds.length === orders.length && orders.length > 0 ? (
                            <FiCheckSquare className="text-blue-500" />
                        ) : (
                            <FiSquare className="text-gray-400" />
                        )}
                        Chọn tất cả
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Mã đơn</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Khách hàng</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Thanh toán</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tổng tiền</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ngày tạo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Thao tác</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <button
                              onClick={() => dispatch(toggleOrderSelection(order.id))}
                              className="text-gray-400 hover:text-blue-500"
                          >
                            {selectedOrderIds.includes(order.id) ? (
                                <FiCheckSquare className="text-blue-500" />
                            ) : (
                                <FiSquare />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button
                              onClick={() => navigate(`/seller/orders/${order.id}`)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            #{order.id}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">{order.customerName}</div>
                            <div className="text-sm text-gray-500">{order.customerPhone}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                        </td>
                        <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                      </span>
                        </td>
                        <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">
                        {order.totalAmount.toLocaleString('vi-VN')} ₫
                      </span>
                        </td>
                        <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                              onClick={() => navigate(`/seller/orders/${order.id}`)}
                              className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <FiEye className="text-sm" />
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
          )}

          {/* Pagination */}
          {orders.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Hiển thị {pagination.currentPage * pagination.pageSize + 1} đến{' '}
                  {Math.min((pagination.currentPage + 1) * pagination.pageSize, pagination.totalElements)} của{' '}
                  {pagination.totalElements} đơn hàng
                </div>
                <div className="flex items-center gap-2">
                  <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevious}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft />
                    Trước
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = pagination.currentPage < 3
                          ? i
                          : pagination.currentPage + i - 2;

                      if (page < 0 || page >= pagination.totalPages) return null;

                      return (
                          <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-1 text-sm rounded-lg ${
                                  page === pagination.currentPage
                                      ? 'bg-blue-500 text-white'
                                      : 'text-gray-600 hover:bg-gray-100'
                              }`}
                          >
                            {page + 1}
                          </button>
                      );
                    })}
                  </div>

                  <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                    <FiChevronRight />
                  </button>
                </div>
              </div>
          )}

          {/* Empty State */}
          {!orderListLoading && orders.length === 0 && (
              <div className="text-center py-12">
                <FiPackage className="mx-auto text-4xl text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không có đơn hàng</h3>
                <p className="text-gray-600">Chưa có đơn hàng nào phù hợp với bộ lọc của bạn.</p>
              </div>
          )}
        </div>
      </div>
  );
};

export default OrderManagementPage;