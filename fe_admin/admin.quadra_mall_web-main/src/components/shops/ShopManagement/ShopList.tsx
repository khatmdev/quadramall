import React from 'react';
import { Eye, Lock, Unlock, Mail, ShoppingBag } from 'lucide-react';
import type { Shop, ViolationReport } from '@/types/shop';

interface ShopListProps {
  shops: Shop[];
  handleLockShop: (shop: Shop) => void;
  handleViolationResponse: (violation: ViolationReport, shop: Shop) => void;
  setSelectedShop: (shop: Shop | null) => void;
  setShowShopDetails: (show: boolean) => void;
}

const ShopList: React.FC<ShopListProps> = ({
                                             shops,
                                             handleLockShop,
                                             setSelectedShop,
                                             setShowShopDetails
                                           }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'locked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shop
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hiệu suất
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doanh thu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vi phạm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {shops.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <ShoppingBag size={48} className="text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg">Không tìm thấy shop nào</p>
                      <p className="text-gray-400 text-sm mt-1">
                        Thử thay đổi từ khóa tìm kiếm
                      </p>
                    </div>
                  </td>
                </tr>
            ) : (
                shops.map((shop) => (
                    <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                              src={shop.avatar ?? 'https://via.placeholder.com/40'}
                              alt={shop.shopName}
                              className="h-10 w-10 rounded-full object-cover"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{shop.shopName}</div>
                            <div className="text-sm text-gray-500">{shop.ownerName}</div>
                            <div className="text-xs text-gray-400">{shop.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(shop.status)}`}>
                      {shop.status === 'active' ? 'Hoạt động' :
                          shop.status === 'inactive' ? 'Không hoạt động' :
                              shop.status === 'locked' ? 'Bị khóa' : 'Không xác định'}
                    </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600">{shop.orderCount.toLocaleString()} đơn hàng</div>
                          <div className="text-sm text-gray-600">{shop.completionRate.toFixed(1)}% hoàn thành</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{(shop.totalRevenue / 1000000).toFixed(1)}M VNĐ</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">Không có</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                              onClick={() => {
                                setSelectedShop(shop);
                                setShowShopDetails(true);
                              }}
                              className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                              title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                              onClick={() => handleLockShop(shop)}
                              className={`p-2 rounded-lg transition-colors ${
                                  shop.status === 'locked'
                                      ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                              }`}
                              title={shop.status === 'locked' ? 'Mở khóa shop' : 'Khóa shop'}
                          >
                            {shop.status === 'locked' ? <Unlock size={16} /> : <Lock size={16} />}
                          </button>
                          <button
                              onClick={() => window.open(`mailto:${shop.email}`)}
                              className="p-2 bg-purple-100 text-purple-600 hover:bg-purple-200 rounded-lg transition-colors"
                              title="Gửi email"
                          >
                            <Mail size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                ))
            )}
            </tbody>
          </table>
        </div>
      </div>
  );
};

export default ShopList;