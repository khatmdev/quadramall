import React, { useState } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { OrderResponse } from '@/api/orderApi';
import OrderDetailPopup from './OrderDetailPopup';

interface OrderItemProps {
  order: OrderResponse;
}

const OrderItemCard: React.FC<OrderItemProps> = ({ order }) => {
  const [showDetail, setShowDetail] = useState(false);
  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Define status styles - mapping backend status to Vietnamese
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { text: 'Chờ xử lý', style: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
      case 'CONFIRMED':
        return { text: 'Đã xác nhận', style: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'PREPARING':
        return { text: 'Đang chuẩn bị', style: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'SHIPPED':
        return { text: 'Đã giao', style: 'bg-green-100 text-green-800 border-green-300' };
      case 'DELIVERED':
        return { text: 'Hoàn thành', style: 'bg-green-100 text-green-800 border-green-300' };
      case 'CANCELLED':
        return { text: 'Đã hủy', style: 'bg-red-100 text-red-800 border-red-300' };
      case 'RETURNED':
        return { text: 'Trả hàng', style: 'bg-gray-100 text-gray-800 border-gray-300' };
      default:
        return { text: status, style: 'bg-gray-100 text-gray-800 border-gray-300' };
    }
  };

  // Get first item for display (since an order can have multiple items)
  const firstItem = order.orderItemResponses?.[0];
  const totalItems = order.orderItemResponses?.length || 0;

  return (
    <div className="bg-white rounded-xl px-4 py-4 mb-4 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Hình ảnh */}
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <img
            src={firstItem?.productVariant?.imageUrl || firstItem?.productVariant?.product?.thumbnailUrl || '/placeholder.jpg'}
            alt={firstItem?.productVariant?.product?.name || 'Sản phẩm'}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Thông tin */}
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-medium text-gray-800 line-clamp-2">
                {firstItem?.productVariant?.product?.name || 'Đơn hàng'}
              </h3>
              {order.store && (
                <p className="text-sm text-gray-500">Cửa hàng: {order.store.name}</p>
              )}
            </div>
            {/* Status Badge */}
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-md border ${getStatusStyles(order.status).style}`}
            >
              {getStatusStyles(order.status).text}
            </span>
          </div>

          <div className="mt-1 text-sm text-gray-500">
            {totalItems > 1 ? (
              <span>Số lượng: {firstItem?.quantity} (+{totalItems - 1} sản phẩm khác)</span>
            ) : (
              <span>Số lượng: {firstItem?.quantity}</span>
            )}
          </div>

          <div className="mt-1 flex justify-between items-center">
            <span className="text-sm font-semibold text-green-600">
              {formatCurrency(order.totalAmount)}
            </span>
            <span className="text-xs text-gray-400">
              Ngày đặt: {formatDate(order.createdAt)}
            </span>
          </div>
        </div>

        {/* Nút mũi tên */}
        <button
          onClick={() => setShowDetail(true)}
          className="bg-white border border-green-300 shadow-md hover:bg-green-50 hover:scale-105 active:scale-95 transition-all duration-200 p-2 rounded-full text-green-500 focus:outline-none focus:ring-2 focus:ring-green-300"
          aria-label="Xem chi tiết"
        >
          <FiChevronRight size={20} />
        </button>
        {showDetail && (
          <OrderDetailPopup order={order} onClose={() => setShowDetail(false)} />
        )}
      </div>
    </div>
  );
};

export default OrderItemCard;
