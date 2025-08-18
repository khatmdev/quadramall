import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchOrderDetail,
  updateOrderStatus,
  confirmOrder,
  prepareOrder,
  cancelOrder,
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
  FiArrowLeft,
  FiUser,
  FiMapPin,
  FiPackage,
  FiCreditCard,
  FiTruck,
  FiPhone,
  FiCalendar,
  FiDollarSign,
  FiMessageSquare,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiClock,
  FiEdit
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import {AppDispatch, RootState} from "@/store";

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const {
    selectedOrder: order,
    orderDetailLoading,
    updating,
    error
  } = useSelector((state: RootState) => state.orders);

  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderDetail(Number(orderId)));
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  if (orderDetailLoading) {
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="flex items-center justify-center py-12">
            <FiRefreshCw className="animate-spin text-2xl text-gray-400 mr-3" />
            <span className="text-gray-600">Đang tải chi tiết đơn hàng...</span>
          </div>
        </div>
    );
  }

  if (!order) {
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="text-center py-12">
            <FiPackage className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
            <p className="text-gray-600 mb-4">Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.</p>
            <button
                onClick={() => navigate('/seller/orders')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Quay lại danh sách đơn hàng
            </button>
          </div>
        </div>
    );
  }

  const handleStatusUpdate = async (newStatus: OrderStatus, noteText?: string) => {
    try {
      await dispatch(updateOrderStatus({
        orderId: order.id,
        request: { status: newStatus, note: noteText }
      })).unwrap();

      toast.success(`Đã cập nhật trạng thái đơn hàng thành ${ORDER_STATUS_LABELS[newStatus]}`);

      // Refresh order detail
      dispatch(fetchOrderDetail(order.id));
    } catch (error) {
      // Error handled by Redux
    }
  };

  const handleConfirmOrder = async () => {
    const result = await Swal.fire({
      title: 'Xác nhận đơn hàng',
      text: 'Bạn có chắc muốn xác nhận đơn hàng này?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
      input: 'textarea',
      inputPlaceholder: 'Ghi chú (tùy chọn)...',
      inputAttributes: {
        maxlength: '500'
      }
    });

    if (result.isConfirmed) {
      try {
        await dispatch(confirmOrder({
          orderId: order.id,
          note: result.value
        })).unwrap();

        toast.success('Đã xác nhận đơn hàng thành công');
        dispatch(fetchOrderDetail(order.id));
      } catch (error) {
        // Error handled by Redux
      }
    }
  };

  const handlePrepareOrder = async () => {
    const result = await Swal.fire({
      title: 'Hoàn thành chuẩn bị hàng',
      text: 'Bạn đã chuẩn bị xong hàng và sẵn sàng giao cho shipper?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8B5CF6',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Hoàn thành',
      cancelButtonText: 'Hủy',
      input: 'textarea',
      inputPlaceholder: 'Ghi chú về việc chuẩn bị hàng (tùy chọn)...',
      inputAttributes: {
        maxlength: '500'
      }
    });

    if (result.isConfirmed) {
      try {
        await dispatch(prepareOrder({
          orderId: order.id,
          note: result.value
        })).unwrap();

        toast.success('Đã hoàn thành chuẩn bị hàng. Đơn hàng sẽ được giao cho shipper.');
        dispatch(fetchOrderDetail(order.id));
      } catch (error) {
        // Error handled by Redux
      }
    }
  };

  const handleCancelOrder = async () => {
    const result = await Swal.fire({
      title: 'Hủy đơn hàng',
      text: 'Vui lòng nhập lý do hủy đơn hàng:',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Hủy đơn hàng',
      cancelButtonText: 'Quay lại',
      input: 'textarea',
      inputPlaceholder: 'Nhập lý do hủy đơn hàng...',
      inputAttributes: {
        required: 'true',
        maxlength: '500'
      },
      inputValidator: (value) => {
        if (!value) {
          return 'Vui lòng nhập lý do hủy đơn hàng';
        }
        return null;
      }
    });

    if (result.isConfirmed && result.value) {
      try {
        await dispatch(cancelOrder({
          orderId: order.id,
          reason: result.value
        })).unwrap();

        toast.success('Đã hủy đơn hàng thành công');
        dispatch(fetchOrderDetail(order.id));
      } catch (error) {
        // Error handled by Redux
      }
    }
  };

  const renderStatusActions = () => {
    if (!order.canUpdateStatus) {
      return (
          <div className="text-center py-4">
            <span className="text-gray-500 text-sm">Không có thao tác khả dụng</span>
          </div>
      );
    }

    // Ngăn chặn mọi thao tác khi đơn hàng ở trạng thái PENDING
    if (order.status === OrderStatus.PENDING) {
      return (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 text-amber-600">
              <FiClock className="text-lg" />
              <span className="text-sm font-medium">Đơn hàng đang chờ xử lý, không thể thực hiện thao tác</span>
            </div>
          </div>
      );
    }

    const actions = [];

    switch (order.status) {
      case OrderStatus.PROCESSING:
        actions.push(
            <button
                key="confirm"
                onClick={handleConfirmOrder}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              <FiCheck className={updating ? 'animate-spin' : ''} />
              Xác nhận đơn hàng
            </button>
        );
        break;

      case OrderStatus.CONFIRMED_PREPARING:
        actions.push(
            <button
                key="prepare"
                onClick={handlePrepareOrder}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
            >
              <FiTruck className={updating ? 'animate-spin' : ''} />
              Hoàn thành chuẩn bị - Giao shipper
            </button>
        );
        break;
    }

    // Add cancel button for cancellable statuses (excluding PENDING)
    if ([OrderStatus.PROCESSING, OrderStatus.CONFIRMED_PREPARING].includes(order.status)) {
      actions.push(
          <button
              key="cancel"
              onClick={handleCancelOrder}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            <FiX className={updating ? 'animate-spin' : ''} />
            Hủy đơn hàng
          </button>
      );
    }

    return (
        <div className="flex flex-wrap gap-3">
          {actions}
        </div>
    );
  };

  const renderTimeline = () => {
    if (!order.timeline || order.timeline.length === 0) return null;

    return (
        <div className="space-y-4">
          {order.timeline.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${
                      item.status === order.status ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                  {index < order.timeline.length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-medium ${
                    item.status === order.status ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {item.statusDisplayName}
                </span>
                    <span className="text-xs text-gray-500">
                  {new Date(item.timestamp).toLocaleString('vi-VN')}
                </span>
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  {item.note && (
                      <p className="text-sm text-gray-500 mt-1 italic">"{item.note}"</p>
                  )}
                </div>
              </div>
          ))}
        </div>
    );
  };

  return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
              onClick={() => navigate('/seller/orders')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors"
          >
            <FiArrowLeft />
            Quay lại
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng #{order.id}</h1>
            <p className="text-sm text-gray-600">
              Tạo lúc {new Date(order.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Trạng thái đơn hàng</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
              </div>
              {renderStatusActions()}
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <FiUser className="text-blue-500" />
                Thông tin khách hàng
              </h2>
              <div className="flex items-center gap-4">
                {order.customer.avatarUrl && (
                    <img
                        src={order.customer.avatarUrl}
                        alt={order.customer.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                )}
                <div>
                  <h3 className="font-medium text-gray-900">{order.customer.fullName}</h3>
                  <p className="text-sm text-gray-600">ID: {order.customer.id}</p>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            {order.shipping && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <FiMapPin className="text-green-500" />
                    Thông tin giao hàng
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Địa chỉ lấy hàng</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{order.shipping.pickupAddress}</p>
                        <p>{order.shipping.pickupWard}, {order.shipping.pickupDistrict}</p>
                        <p>{order.shipping.pickupProvince}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Địa chỉ giao hàng</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-medium">{order.shipping.deliveryName}</p>
                        <p>{order.shipping.deliveryAddress}</p>
                        <p>{order.shipping.deliveryWard}, {order.shipping.deliveryDistrict}</p>
                        <p>{order.shipping.deliveryProvince}</p>
                      </div>
                    </div>
                  </div>
                  {order.shipping.shippingCost > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Phí vận chuyển:</span>
                          <span className="font-medium text-gray-900">
                      {order.shipping.shippingCost.toLocaleString('vi-VN')} ₫
                    </span>
                        </div>
                      </div>
                  )}
                </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <FiPackage className="text-purple-500" />
                Sản phẩm trong đơn hàng
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                      <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.productName}</h3>
                        {item.variantName && (
                            <p className="text-sm text-gray-600">Phân loại: {item.variantName}</p>
                        )}
                        <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                        <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">
                        {item.priceAtTime.toLocaleString('vi-VN')} ₫ × {item.quantity}
                      </span>
                          <span className="font-medium text-gray-900">
                        {item.totalPrice.toLocaleString('vi-VN')} ₫
                      </span>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-2">
                  <FiCalendar className="text-xs" />
                  Ngày tạo:
                </span>
                  <span className="text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </span>
                </div>
                <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-2">
                  <FiCreditCard className="text-xs" />
                  Thanh toán:
                </span>
                  <span className="text-gray-900">
                  {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                </span>
                </div>
                <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-2">
                  <FiTruck className="text-xs" />
                  Vận chuyển:
                </span>
                  <span className="text-gray-900">
                  {SHIPPING_METHOD_LABELS[order.shippingMethod]}
                </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between font-medium text-lg">
                  <span className="text-gray-900 flex items-center gap-2">
                    <FiDollarSign className="text-sm" />
                    Tổng tiền:
                  </span>
                    <span className="text-green-600">
                    {order.totalAmount.toLocaleString('vi-VN')} ₫
                  </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            {order.note && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <FiMessageSquare className="text-yellow-500" />
                    Ghi chú
                  </h2>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {order.note}
                  </p>
                </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <FiClock className="text-blue-500" />
                Lịch sử đơn hàng
              </h2>
              {renderTimeline()}
            </div>
          </div>
        </div>
      </div>
  );
};

export default OrderDetailPage;