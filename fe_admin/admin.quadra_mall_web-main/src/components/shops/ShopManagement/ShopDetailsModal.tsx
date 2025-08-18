import React from 'react';
import type { Shop } from '@/types/shop';
import { XCircle } from 'lucide-react';

interface ShopDetailsModalProps {
  show: boolean;
  shop: Shop | null;
  onClose: () => void;
}



const ShopDetailsModal: React.FC<ShopDetailsModalProps> = ({ show, shop, onClose }) => {
  if (!show || !shop) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Chi tiết shop: {shop.shopName}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shop Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={shop.avatar}
                  alt={shop.shopName}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-lg font-medium">{shop.shopName}</h4>
                  <p className="text-gray-600">{shop.ownerName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{shop.email}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Điện thoại</p>
                  <p className="font-medium">{shop.phone}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Ngày tham gia</p>
                  <p className="font-medium">{new Date(shop.joinedDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Địa chỉ</p>
                <p className="font-medium">{shop.address}</p>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900">Thống kê hiệu suất</h5>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-600">Tổng đơn hàng</p>
                  <p className="text-2xl font-bold text-blue-900">{shop.orderCount.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-600">Tỷ lệ hoàn thành</p>
                  <p className="text-2xl font-bold text-green-900">{shop.completionRate}%</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-600">Đánh giá</p>
                  <p className="text-2xl font-bold text-yellow-900">{shop.rating}/5</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-purple-600">Phản hồi</p>
                  <p className="text-2xl font-bold text-purple-900">{shop.responseRate}%</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h6 className="font-medium text-gray-900 mb-2">Doanh thu</h6>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tổng doanh thu:</span>
                    <span className="font-medium">{shop.totalRevenue.toFixed(1)}M VNĐ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Hoa hồng:</span>
                    <span className="font-medium">{shop.commissionFee.toFixed(1)}M VNĐ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Phí dịch vụ:</span>
                    <span className="font-medium">{shop.serviceFee.toFixed(1)}M VNĐ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h5 className="font-medium text-gray-900 mb-3">Sản phẩm ({shop.products.length})</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shop.products.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                  <h6 className="font-medium text-gray-900 mb-2">{product.name}</h6>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Giá:</span>
                      <span className="font-medium whitespace-nowrap ml-2">
                        {product.minPrice.toLocaleString()} - {product.maxPrice.toLocaleString()} VNĐ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tồn kho:</span>
                      <span className="font-medium">{product.stock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đã bán:</span>
                      <span className="font-medium">{product.sold}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trạng thái:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' :
                        product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.status === 'active' ? 'Hoạt động' : product.status === 'pending' ? 'Chờ duyệt' : 'Bị từ chối'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDetailsModal;