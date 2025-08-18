import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { getMyOrders, updateOrderStatus, clearError } from '@/store/Shipper/orderSlice';
import { ShipperOrderCard } from './ShipperOrderCard';
import { 
  Truck, 
  Filter, 
  Search, 
  RefreshCw,
  Package,
  AlertCircle,
  CheckCircle2, 
  XCircle
} from 'lucide-react';
import { DeliveryStatus, ShipperOrder } from '@/types/Shipper/order';
import Swal from 'sweetalert2';

export const ShipperMyOrders: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error, pagination } = useSelector((state: RootState) => state.shipperOrder);
  const { user } = useSelector((state: RootState) => state.auth);

  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'ALL'>('ALL');

  useEffect(() => {
    loadOrders();
  }, [currentPage]);

  const loadOrders = () => {
    dispatch(getMyOrders({ page: currentPage, size: 10 }));
  };

  const handleRefresh = () => {
    setCurrentPage(0);
    dispatch(getMyOrders({ page: 0, size: 10 }));
  };

  const handlePickup = async (orderId: number) => {
    try {
      await dispatch(updateOrderStatus({ orderId, action: 'pickup' })).unwrap();
      
      Swal.fire({
        icon: 'success',
        title: 'Đã xác nhận lấy hàng!',
        text: 'Bạn đã xác nhận lấy hàng thành công.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error || 'Không thể xác nhận lấy hàng.',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleStartDelivery = async (orderId: number) => {
    try {
      await dispatch(updateOrderStatus({ orderId, action: 'start_delivery' })).unwrap();
      
      Swal.fire({
        icon: 'success',
        title: 'Đã bắt đầu giao hàng!',
        text: 'Trạng thái đơn hàng đã được cập nhật.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error || 'Không thể bắt đầu giao hàng.',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleComplete = async (orderId: number) => {
    const { value: confirmationCode } = await Swal.fire({
      title: 'Hoàn thành giao hàng',
      text: 'Nhập mã xác nhận từ khách hàng:',
      input: 'text',
      inputPlaceholder: 'Mã xác nhận 6 chữ số',
      showCancelButton: true,
      confirmButtonText: 'Hoàn thành',
      cancelButtonText: 'Hủy',
      inputValidator: (value) => {
        if (!value || value.length !== 6) {
          return 'Vui lòng nhập mã xác nhận 6 chữ số';
        }
      }
    });

    if (confirmationCode) {
      try {
        await dispatch(updateOrderStatus({ 
          orderId, 
          action: 'complete',
          data: { confirmationCode }
        })).unwrap();
        
        Swal.fire({
          icon: 'success',
          title: 'Hoàn thành giao hàng!',
          text: 'Đơn hàng đã được giao thành công.',
          confirmButtonText: 'OK'
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: error || 'Mã xác nhận không đúng hoặc có lỗi xảy ra.',
          confirmButtonText: 'Thử lại'
        });
      }
    }
  };

  const handleCancel = async (orderId: number) => {
    const { value: reason } = await Swal.fire({
      title: 'Hủy giao hàng',
      text: 'Vui lòng nhập lý do hủy:',
      input: 'textarea',
      inputPlaceholder: 'Nhập lý do hủy giao hàng...',
      showCancelButton: true,
      confirmButtonText: 'Hủy đơn hàng',
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Đóng',
      inputValidator: (value) => {
        if (!value || value.trim().length < 10) {
          return 'Vui lòng nhập lý do hủy ít nhất 10 ký tự';
        }
      }
    });

    if (reason) {
      try {
        await dispatch(updateOrderStatus({ 
          orderId, 
          action: 'cancel',
          data: { cancellationReason: reason }
        })).unwrap();
        
        Swal.fire({
          icon: 'success',
          title: 'Đã hủy đơn hàng!',
          text: 'Đơn hàng đã được hủy thành công.',
          confirmButtonText: 'OK'
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: error || 'Không thể hủy đơn hàng.',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const filteredOrders = orders.filter((order: ShipperOrder) => {
    const matchesSearch = order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.assignmentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusCounts = () => {
    const counts = {
      ALL: orders.length,
      ASSIGNED: 0,
      PICKED_UP: 0,
      IN_TRANSIT: 0,
      DELIVERED: 0,
      CONFIRMED: 0,
      CANCELLED: 0
    };

    orders.forEach((order: ShipperOrder) => {
      if (counts.hasOwnProperty(order.assignmentStatus)) {
        counts[order.assignmentStatus as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đơn hàng của tôi</h1>
            <p className="text-gray-600">
              Xin chào, {user?.fullName} - Quản lý các đơn hàng đã nhận
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Tổng đơn</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.ALL}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Đang xử lý</p>
              <p className="text-2xl font-bold text-gray-900">
                {statusCounts.ASSIGNED + statusCounts.PICKED_UP + statusCounts.IN_TRANSIT}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <CheckCircle2 className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.CONFIRMED}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Đã hủy</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.CANCELLED}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Tìm theo mã đơn hàng hoặc tên khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DeliveryStatus | 'ALL')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ASSIGNED">Đã nhận</option>
              <option value="PICKED_UP">Đã lấy hàng</option>
              <option value="IN_TRANSIT">Đang vận chuyển</option>
              <option value="DELIVERED">Đã giao hàng</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && orders.length === 0 && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'ALL' ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng nào'}
          </h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'ALL' 
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Các đơn hàng bạn nhận sẽ hiển thị tại đây'
            }
          </p>
        </div>
      )}

      {/* Orders Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        {filteredOrders.map((order: ShipperOrder) => (
          <ShipperOrderCard
            key={order.id}
            order={order}
            onPickup={handlePickup}
            onStartDelivery={handleStartDelivery}
            onComplete={handleComplete}
            onCancel={handleCancel}
            loading={loading}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0 || loading}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = currentPage <= 2 ? i : currentPage - 2 + i;
              if (pageNum >= pagination.totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  disabled={loading}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    pageNum === currentPage
                      ? 'text-blue-600 bg-blue-50 border border-blue-300'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(Math.min(pagination.totalPages - 1, currentPage + 1))}
              disabled={currentPage >= pagination.totalPages - 1 || loading}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};