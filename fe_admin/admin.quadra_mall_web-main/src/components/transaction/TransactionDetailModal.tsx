import React from 'react';
import { X } from 'lucide-react';

interface TransactionDetailModalProps {
  transaction: any;
  onClose: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  // Mock data cho orders (nếu là giao dịch từ order)
  const mockOrders = [
    { id: 1, customer_id: 1, store_id: 1, status: 'completed', shipping_method: 'standard', payment_method: 'wallet', total_amount: 1200000, created_at: '2025-06-01', updated_at: '2025-06-01', products: [{ name: 'Áo thun', price: 1000000, imageUrl: 'https://via.placeholder.com/50?text=Áo+thun' }], voucherDiscount: 100000, shippingFee: 100000 },
    { id: 2, customer_id: 2, store_id: 2, status: 'pending', shipping_method: 'express', payment_method: 'bank', total_amount: 2200000, created_at: '2025-06-02', updated_at: '2025-06-02', products: [{ name: 'Điện thoại', price: 2000000, imageUrl: 'https://via.placeholder.com/50?text=Điện+thoại' }], voucherDiscount: 0, shippingFee: 200000 },
    { id: 3, customer_id: 1, store_id: 3, status: 'cancelled', shipping_method: 'standard', payment_method: 'wallet', total_amount: 600000, created_at: '2025-06-03', updated_at: '2025-06-03', products: [{ name: 'Quần jeans', price: 500000, imageUrl: 'https://via.placeholder.com/50?text=Quần+jeans' }], voucherDiscount: 50000, shippingFee: 50000 },
  ];

  const orderDetail = transaction.orderId ? mockOrders.find(o => o.id === transaction.orderId) : null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Chi tiết giao dịch</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <p><strong>ID:</strong> {transaction.id}</p>
          <p><strong>Loại:</strong> {transaction.type}</p>
          <p><strong>Số tiền:</strong> {transaction.type === 'top-up' || transaction.type === 'refund' ? '+' : '-'}{transaction.amount.toLocaleString()} VND</p>
          <p><strong>Trạng thái:</strong> {transaction.status === 'completed' ? 'Hoàn thành' : transaction.status === 'pending' ? 'Chờ xử lý' : transaction.status === 'failed' ? 'Thất bại' : 'Hủy'}</p>
          <p><strong>Thời gian:</strong> {transaction.createdAt}</p>
          <p><strong>Cập nhật lần cuối:</strong> {transaction.updatedAt}</p>
          <p><strong>Mô tả:</strong> {transaction.description || '-'}</p>
          <p><strong>Nguồn:</strong> {transaction.source}</p>
          {transaction.userId && <p><strong>Mã người dùng:</strong> {transaction.userId}</p>}
          {transaction.orderId && orderDetail && (
            <div>
              <h4 className="text-md font-semibold mt-2">Chi tiết đơn hàng #{transaction.orderId}</h4>
              <div className="space-y-2 mt-2">
                {orderDetail.products.map((product, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded" />
                    <div>
                      <p><strong>Sản phẩm:</strong> {product.name} - {product.price.toLocaleString()} VND</p>
                    </div>
                  </div>
                ))}
                <p><strong>Giảm giá voucher:</strong> {orderDetail.voucherDiscount.toLocaleString()} VND</p>
                <p><strong>Phí vận chuyển:</strong> {orderDetail.shippingFee.toLocaleString()} VND</p>
                <p><strong>Tổng cộng:</strong> {orderDetail.total_amount.toLocaleString()} VND</p>
              </div>
            </div>
          )}
          {transaction.walletId && <p><strong>Ví:</strong> #{transaction.walletId}</p>}
          {transaction.bankAccountId && <p><strong>Tài khoản ngân hàng:</strong> #{transaction.bankAccountId}</p>}
          {transaction.transactionCode && <p><strong>Mã giao dịch:</strong> {transaction.transactionCode}</p>}
        </div>
        <div className="mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;