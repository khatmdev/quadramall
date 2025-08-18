import React from 'react';
import { OrderResponse } from '@/api/orderApi';

interface OrderDetailPopupProps {
  order: OrderResponse;
  onClose: () => void;
}

const OrderDetailPopup: React.FC<OrderDetailPopupProps> = ({ order, onClose }) => {
  if (!order) return null;

  const statusMap: Record<string, { text: string; color: string; bgColor: string; icon: string }> = {
    PENDING: { 
      text: 'Chờ xử lý', 
      color: 'text-amber-700', 
      bgColor: 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200', 
      icon: '⏳' 
    },
    CONFIRMED: { 
      text: 'Đã xác nhận', 
      color: 'text-blue-700', 
      bgColor: 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200', 
      icon: '✔️' 
    },
    PREPARING: { 
      text: 'Đang chuẩn bị', 
      color: 'text-purple-700', 
      bgColor: 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200', 
      icon: '🛒' 
    },
    SHIPPED: { 
      text: 'Đã giao', 
      color: 'text-emerald-700', 
      bgColor: 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200', 
      icon: '🚚' 
    },
    DELIVERED: { 
      text: 'Hoàn thành', 
      color: 'text-green-700', 
      bgColor: 'bg-gradient-to-r from-green-50 to-green-100 border-green-200', 
      icon: '✅' 
    },
    CANCELLED: { 
      text: 'Đã hủy', 
      color: 'text-red-700', 
      bgColor: 'bg-gradient-to-r from-red-50 to-red-100 border-red-200', 
      icon: '❌' 
    },
    RETURNED: { 
      text: 'Trả hàng', 
      color: 'text-gray-700', 
      bgColor: 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200', 
      icon: '↩️' 
    },
  };

  const statusInfo = statusMap[order.status] || { 
    text: order.status, 
    color: 'text-gray-700', 
    bgColor: 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200', 
    icon: 'ℹ️' 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Main popup container */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-100 max-h-[85vh] flex flex-col">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-t-3xl p-6 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
          
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-gray-600 hover:text-red-500 text-xl font-bold transition-all duration-200 hover:scale-110 shadow-lg backdrop-blur-sm border border-white/50"
            onClick={onClose}
            aria-label="Đóng"
          >
            ×
          </button>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                📋
              </div>
              <div>
                <h2 className="text-2xl font-bold">Chi tiết đơn hàng</h2>
                <p className="text-white/80 text-sm">#{order.id}</p>
              </div>
            </div>
            
            {/* Status badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-semibold ${statusInfo.bgColor} ${statusInfo.color}`}>
              <span className="text-lg">{statusInfo.icon}</span>
              <span>{statusInfo.text}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4"
             style={{ maxHeight: 'calc(85vh - 120px)', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {/* Order info cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Date card */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center">
                  📅
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Ngày đặt</p>
                  <p className="font-semibold text-slate-800">
                    {order.createdAt && !order.createdAt.includes('Invalid') 
                      ? new Date(order.createdAt).toLocaleString('vi-VN') 
                      : 'Chưa xác định'}
                  </p>
                </div>
              </div>
            </div>

            {/* Store card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-200 rounded-xl flex items-center justify-center overflow-hidden">
                  {order.store?.image ? (
                    <img src={order.store.image} alt="Shop" className="w-full h-full object-cover" />
                  ) : (
                    '🏪'
                  )}
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Cửa hàng</p>
                  <p className="font-semibold text-blue-800">{order.store?.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Total amount */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-200">
            <div className="text-center">
              <p className="text-emerald-600 font-medium mb-2">Tổng tiền thanh toán</p>
              <p className="text-3xl font-bold text-emerald-700">
                {order.totalAmount?.toLocaleString()}₫
              </p>
            </div>
          </div>

          {/* Products section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                🛍️
              </div>
              <h3 className="text-lg font-bold text-gray-800">Sản phẩm đã đặt</h3>
            </div>
            
            <div className="space-y-2">
              {order.orderItemResponses?.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-4 border-2 border-gray-100 hover:border-gray-200 transition-colors shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.productVariant?.imageUrl || item.productVariant?.product?.thumbnailUrl || '/placeholder.jpg'}
                        alt={item.productVariant?.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 text-lg truncate">
                        {item.productVariant?.product?.name}
                      </h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-gray-500">Số lượng: {item.quantity}</span>
                        <span className="text-emerald-600 font-bold text-lg">
                          {item.productVariant?.price?.toLocaleString()}₫
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Note section */}
          {order.note && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  📝
                </div>
                <div>
                  <p className="text-amber-700 font-medium mb-1">Ghi chú</p>
                  <p className="text-amber-800">{order.note}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPopup;