import React, { useState, useEffect } from 'react';
import OrderCard from './OrderCard';
import Pagination from '../../model/Pagination';
import { getAllOrders, getOrdersByStatus, OrderResponse } from '../../api/orderApi';

// Định nghĩa type cho item trong orderItemResponses
type OrderItemResponse = {
  productVariant: {
    product: {
      name: string;
    }
  };
  // ... các trường khác nếu cần
};

const OrderTabForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pageSize = 5;

  const tabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'PENDING', label: 'Chờ xử lý' },
    { key: 'CONFIRMED', label: 'Đã xác nhận' },
    { key: 'PREPARING', label: 'Đang chuẩn bị' },
    { key: 'SHIPPED', label: 'Đã giao' },
    { key: 'DELIVERED', label: 'Hoàn thành' },
    { key: 'CANCELLED', label: 'Đã hủy' },
  ];

  // Tải danh sách đơn hàng từ API
  const loadOrders = async (status?: string) => {
    setLoading(true);
    setError('');
    try {
      let ordersData: OrderResponse[];
      if (status === 'all' || !status) {
        ordersData = await getAllOrders();
      } else {
        ordersData = await getOrdersByStatus(status);
      }
      setOrders(ordersData);
    } catch (err) {
      setError('Không thể tải danh sách đơn hàng');
      console.error('Lỗi khi tải đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  // Tải đơn hàng khi component mount hoặc tab thay đổi
  useEffect(() => {
    loadOrders(activeTab);
  }, [activeTab]);

  // Xử lý thay đổi tab
  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    setCurrentPage(1);
  };

  // Xóa dữ liệu đơn hàng mẫu và thay thế bằng logic tìm kiếm mới
  const handleTabClick = (key: string) => {
    handleTabChange(key);
  };

  // Lọc đơn hàng theo từ khóa tìm kiếm
  const filteredOrders = orders.filter((order) => {
    return order.id.toString().includes(searchTerm) ||
      (Array.isArray(order.orderItemResponses) &&
        order.orderItemResponses.some((item: OrderItemResponse) =>
          typeof item.productVariant?.product?.name === 'string' &&
          item.productVariant.product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
  });
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-white rounded-md shadow-md px-4 py-4 max-w-5xl mx-auto mt-8">
      {/* Tabs */}
      <div className="flex border-b border-gray-300 bg-transparent w-full overflow-x-auto overflow-y-hidden scrollbar-hide">
        {tabs.map((tabItem, idx) => (
          <button
            key={tabItem.key}
            type="button"
            className={`relative px-6 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none
              ${activeTab === tabItem.key
                ? 'text-emerald-600'
                : 'text-gray-500 hover:text-emerald-500'}
            `}
            style={{
              borderTopLeftRadius: idx === 0 ? 8 : 0,
              borderTopRightRadius: idx === tabs.length - 1 ? 8 : 0,
            }}
            onClick={() => handleTabClick(tabItem.key)}
          >
            {tabItem.label}
            {activeTab === tabItem.key && (
              <span
                className="absolute left-0 right-0 -bottom-[1px] h-1 bg-emerald-500 rounded-t-full"
                style={{ boxShadow: '0 2px 8px 0 #10b98133' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Search Box */}
      <div className="mt-4">
        <input
          type="text"
          placeholder="Bạn có thể tìm kiếm theo tên sản phẩm hoặc mã đơn hàng"
          className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-gray-100"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Danh sách đơn hàng */}
      <div className="mt-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <p className="mt-2 text-gray-500">Đang tải đơn hàng...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => loadOrders(activeTab)}
              className="mt-2 px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
            >
              Thử lại
            </button>
          </div>
        ) : paginatedOrders.length > 0 ? (
          paginatedOrders.map((order) => <OrderCard key={order.id} order={order} />)
        ) : (
          <div className="text-gray-500 text-sm italic text-center py-8">
            Không có đơn hàng nào ở trạng thái "{tabs.find((t) => t.key === activeTab)?.label}".
          </div>
        )}
      </div>
      {/* Pagination */}
      {filteredOrders.length > pageSize && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default OrderTabForm;
