import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { getAvailableOrders, acceptOrder, removeAcceptedOrder, clearError } from '@/store/Shipper/availableOrdersSlice';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Package, 
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Navigation,
  Store
} from 'lucide-react';
import { formatCurrency } from '@/utils/utils';
import { formatDisplayDateTime, getTimeUntilPickup } from '@/utils/dateTimeUtils';
import Swal from 'sweetalert2';
import type { AvailableOrder } from '@/store/Shipper/availableOrdersSlice';
import { ShipperOrder } from '@/types/Shipper/order';

export const ShipperAvailableOrders: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error, pagination } = useSelector((state: RootState) => state.availableOrders);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [distanceFilter, setDistanceFilter] = useState<'ALL' | '5' | '10' | '20'>('ALL');
  const [priceFilter, setPriceFilter] = useState<'ALL' | 'LOW' | 'HIGH'>('ALL');
  const [provinceFilter, setProvinceFilter] = useState('ALL');

  useEffect(() => {
    loadOrders();
  }, [currentPage]);

  useEffect(() => {
    // Clear any existing errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  const loadOrders = () => {
    dispatch(getAvailableOrders({ page: currentPage, size: 10 }));
  };

  const handleAcceptOrder = async (orderId: number) => {
    const { value: notes } = await Swal.fire({
      title: 'Nhận đơn hàng',
      text: 'Bạn có chắc chắn muốn nhận đơn hàng này?',
      input: 'textarea',
      inputPlaceholder: 'Ghi chú (tùy chọn)...',
      showCancelButton: true,
      confirmButtonText: 'Nhận đơn',
      confirmButtonColor: '#10b981',
      cancelButtonText: 'Hủy',
      inputValidator: () => {
        return null; // Notes is optional
      }
    });

    if (notes !== undefined) {
      try {
        await dispatch(acceptOrder({ orderId, notes })).unwrap();
        
        Swal.fire({
          icon: 'success',
          title: 'Đã nhận đơn hàng!',
          text: 'Bạn đã nhận đơn hàng thành công. Hãy đến lấy hàng đúng giờ.',
          confirmButtonText: 'OK'
        });

        // Remove order from available list
        dispatch(removeAcceptedOrder(orderId));
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: error as string || 'Không thể nhận đơn hàng. Vui lòng thử lại.',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const handleRefresh = () => {
    setCurrentPage(0);
    dispatch(getAvailableOrders({ page: 0, size: 10 }));
  };

  const filteredOrders = orders.filter((order: AvailableOrder) => {
    const matchesSearch = order.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDistance = distanceFilter === 'ALL' || 
                           (distanceFilter === '5' && order.distanceKm <= 5) ||
                           (distanceFilter === '10' && order.distanceKm <= 10) ||
                           (distanceFilter === '20' && order.distanceKm <= 20);
    
    const matchesPrice = priceFilter === 'ALL' ||
                        (priceFilter === 'LOW' && order.shippingCost <= 30000) ||
                        (priceFilter === 'HIGH' && order.shippingCost > 30000);
    
    const matchesProvince = provinceFilter === 'ALL' || 
                           order.pickupProvince === provinceFilter;
    
    return matchesSearch && matchesDistance && matchesPrice && matchesProvince;
  });

  // Get unique provinces for filter dropdown
  const uniqueProvinces = Array.from(new Set(orders.map((order:ShipperOrder) => order.pickupProvince))).filter(Boolean);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đơn hàng có thể nhận</h1>
            <p className="text-gray-600">
              Có {filteredOrders.length} đơn hàng phù hợp • Chọn đơn hàng để giao
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

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm theo cửa hàng, địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Distance Filter */}
          <select
            value={distanceFilter}
            onChange={(e) => setDistanceFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả khoảng cách</option>
            <option value="5">Dưới 5km</option>
            <option value="10">Dưới 10km</option>
            <option value="20">Dưới 20km</option>
          </select>

          {/* Price Filter */}
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả mức giá</option>
            <option value="LOW">Dưới 30k</option>
            <option value="HIGH">Trên 30k</option>
          </select>

          {/* Province Filter */}
          <select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả tỉnh thành</option>
            {uniqueProvinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && orders.length === 0 && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 && !loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không có đơn hàng nào
            </h3>
            <p className="text-gray-500">
              {searchTerm || distanceFilter !== 'ALL' || priceFilter !== 'ALL' || provinceFilter !== 'ALL'
                ? 'Thử thay đổi bộ lọc để xem thêm đơn hàng'
                : 'Hiện tại không có đơn hàng nào có thể nhận'
              }
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id || order.orderId} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Store className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{order.storeName}</h3>
                    <p className="text-sm text-gray-500">Đơn hàng #{order.orderId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(order.shippingCost)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.distanceKm.toFixed(1)} km
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-red-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Lấy hàng</p>
                    <p className="text-sm text-gray-600">{order.pickupAddress}</p>
                    <p className="text-xs text-gray-500">
                      {order.pickupWard}, {order.pickupDistrict}, {order.pickupProvince}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Navigation className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Giao hàng</p>
                    <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                    <p className="text-xs text-gray-500">
                      {order.deliveryWard}, {order.deliveryDistrict}, {order.deliveryProvince}
                    </p>
                  </div>
                </div>
              </div>

              {/* Time and Value Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-600">Lấy hàng trong</p>
                    <p className="text-sm font-medium">{getTimeUntilPickup(order.estimatedPickupTime)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-600">Giá trị đơn hàng</p>
                    <p className="text-sm font-medium">{formatCurrency(order.totalAmount)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-600">Thời gian giao</p>
                    <p className="text-sm font-medium">
                      {formatDisplayDateTime(order.estimatedDeliveryTime).split(' ')[1] || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-600">Thời gian lấy hàng:</span>
                  <p className="font-medium">{formatDisplayDateTime(order.estimatedPickupTime)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Thời gian giao hàng:</span>
                  <p className="font-medium">{formatDisplayDateTime(order.estimatedDeliveryTime)}</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => handleAcceptOrder(order.orderId)}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Nhận đơn hàng</span>
                </button>
              </div>
            </div>
          ))
        )}
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