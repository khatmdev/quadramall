import React from 'react';
import { 
  Package, 
  MapPin, 
  Clock, 
  Phone, 
  User, 
  Truck,
  CheckCircle,
  PlayCircle,
  XCircle 
} from 'lucide-react';
import { ShipperOrder, ORDER_STATUS_LABELS, DELIVERY_STATUS_LABELS } from '@/types/Shipper/order';
import { formatCurrency, formatDateTime } from '@/utils/utils';

interface ShipperOrderCardProps {
  order: ShipperOrder;
  onPickup: (orderId: number) => void;
  onStartDelivery: (orderId: number) => void;
  onComplete: (orderId: number) => void;
  onCancel: (orderId: number) => void;
  loading?: boolean;
}

export const ShipperOrderCard: React.FC<ShipperOrderCardProps> = ({
  order,
  onPickup,
  onStartDelivery,
  onComplete,
  onCancel,
  loading = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'PICKED_UP': return 'bg-yellow-100 text-yellow-800';
      case 'IN_TRANSIT': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CONFIRMED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionButtons = () => {
    // Use order.id for the API calls since that's what the backend expects
    const orderId = order.id;
    
    switch (order.assignmentStatus) {
      case 'ASSIGNED':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => onPickup(orderId)}
              disabled={loading}
              className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              <Package className="h-4 w-4" />
              <span>Lấy hàng</span>
            </button>
            <button
              onClick={() => onCancel(orderId)}
              disabled={loading}
              className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              <span>Hủy</span>
            </button>
          </div>
        );
      case 'PICKED_UP':
        return (
          <button
            onClick={() => onStartDelivery(orderId)}
            disabled={loading}
            className="flex items-center space-x-1 bg-purple-600 text-white px-3 py-1 rounded-md text-sm hover:bg-purple-700 disabled:opacity-50"
          >
            <PlayCircle className="h-4 w-4" />
            <span>Bắt đầu giao</span>
          </button>
        );
      case 'IN_TRANSIT':
        return (
          <button
            onClick={() => onComplete(orderId)}
            disabled={loading}
            className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Hoàn thành</span>
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">#{order.orderCode}</h3>
          <p className="text-sm text-gray-500">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.assignmentStatus)}`}>
            {DELIVERY_STATUS_LABELS[order.assignmentStatus] || order.assignmentStatus}
          </span>
          <span className="font-bold text-lg text-gray-900">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="flex items-center space-x-3 mb-3 p-2 bg-gray-50 rounded-md">
        <User className="h-4 w-4 text-gray-600" />
        <div className="flex-1">
          <p className="font-medium text-gray-900">{order.customerName}</p>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="h-3 w-3" />
            <span>{order.customerPhone}</span>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="space-y-2 mb-3">
        <div className="flex items-start space-x-2 text-sm">
          <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
          <div>
            <p className="text-gray-600">Lấy hàng:</p>
            <p className="text-gray-900">{order.pickupAddress}</p>
          </div>
        </div>
        <div className="flex items-start space-x-2 text-sm">
          <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
          <div>
            <p className="text-gray-600">Giao hàng:</p>
            <p className="text-gray-900">{order.deliveryAddress}</p>
          </div>
        </div>
      </div>

      {/* Estimated Delivery */}
      <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600">
        <Clock className="h-4 w-4" />
        <span>Dự kiến giao: {formatDateTime(order.estimatedDelivery)}</span>
      </div>

      {/* Items Preview */}
      <div className="mb-3">
        <p className="text-sm text-gray-600 mb-1">
          Sản phẩm ({order.items?.length || 0} món):
        </p>
        <div className="flex flex-wrap gap-1">
          {order.items && order.items.length > 0 ? (
            <>
              {order.items.slice(0, 3).map((item, index) => (
                <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {item.productName} x{item.quantity}
                </span>
              ))}
              {order.items.length > 3 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  +{order.items.length - 3} khác
                </span>
              )}
            </>
          ) : (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              Không có thông tin sản phẩm
            </span>
          )}
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-800">
            <strong>Ghi chú:</strong> {order.notes}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end">
        {getActionButtons()}
      </div>
    </div>
  );
};