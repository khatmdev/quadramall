import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '@/store/store';
import { setSearchQuery, setFilterStatus, updateOrderStatus } from '@/store/orderSlice';
import { FiSearch, FiChevronLeft, FiChevronRight, FiCreditCard, FiTruck, FiEdit } from 'react-icons/fi';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Swal from 'sweetalert2';

interface Order {
  id: number;
  customer_id: number;
  store_id: number;
  customer_name: string;
  customer_phone: string;
  store_name: string;
  store_address: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_method: 'standard' | 'express';
  payment_method: 'cod' | 'online';
  payment_status: 'pending' | 'completed' | 'failed';
  total_amount: number;
  created_at: string;
  note?: string;
  discount_code_id?: number;
  shipping_partner?: string;
  tracking_number?: string;
  shipping_cost?: number;
  shipping_address: string;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id?: number;
  quantity: number;
  price_at_time: number;
  product_name: string;
  variant_name?: string;
  product_image: string;
}

const statusTabs = [
  { label: 'Tất cả', value: '' },
  { label: 'Chờ xác nhận', value: 'pending' },
  { label: 'Đang xử lý', value: 'processing' },
  { label: 'Đã giao', value: 'shipped' },
  { label: 'Hoàn thành', value: 'delivered' },
  { label: 'Đã hủy', value: 'cancelled' },
];

const OrdersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { orders, searchQuery, filterStatus } = useSelector((state: RootState) => state.orders);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const orderCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      processing: orders.filter((o) => o.status === 'processing').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(
        (order) =>
            (order.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) &&
            (filterStatus ? order.status === filterStatus : true)
    );
  }, [orders, searchQuery, filterStatus]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewDetails = (orderId: number) => {
    navigate(`/orders/${orderId}`);
  };

  const handleStatusChange = async (id: number, newStatus: Order['status']) => {
    const statusLabels = {
      pending: 'Chờ xác nhận',
      processing: 'Đang xử lý',
      shipped: 'Đã giao',
      delivered: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };

    const result = await Swal.fire({
      title: 'Xác nhận thay đổi trạng thái',
      text: `Bạn có chắc muốn thay đổi trạng thái đơn hàng #${id} thành "${statusLabels[newStatus]}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        await dispatch(updateOrderStatus({ id, status: newStatus })).unwrap();
        Swal.fire({
          title: 'Thành công!',
          text: `Trạng thái đơn hàng #${id} đã được cập nhật.`,
          icon: 'success',
          confirmButtonColor: '#3B82F6',
        });
      } catch (error) {
        Swal.fire({
          title: 'Lỗi!',
          text: `Cập nhật trạng thái đơn hàng #${id} thất bại.`,
          icon: 'error',
          confirmButtonColor: '#3B82F6',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-green-100 text-green-800',
      delivered: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: 'Chờ xác nhận',
      processing: 'Đang xử lý',
      shipped: 'Đã giao',
      delivered: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };
    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getStatusActions = (status: Order['status'], orderId: number) => {
    const actions = {
      pending: [
        { label: 'Xác nhận', status: 'processing', color: 'bg-blue-500 hover:bg-blue-600' },
        { label: 'Hủy', status: 'cancelled', color: 'bg-red-500 hover:bg-red-600' },
      ],
      processing: [
        { label: 'Giao hàng', status: 'shipped', color: 'bg-green-500 hover:bg-green-600' },
      ],
      shipped: [
        { label: 'Hoàn thành', status: 'delivered', color: 'bg-purple-500 hover:bg-purple-600' },
      ],
      delivered: [],
      cancelled: [],
    };
    return actions[status].map((action) => (
        <button
            key={action.status}
            onClick={() => handleStatusChange(orderId, action.status as Order['status'])}
            className={`w-full text-left px-4 py-2 text-sm text-white ${action.color} transition-colors`}
        >
          {action.label}
        </button>
    ));
  };

  return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen font-sans animate-fade-in">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6">
          Quản lý đơn hàng
        </h2>

        <div className="mb-6 bg-white rounded-lg shadow-sm p-4 transition-all hover:shadow-md animate-slide-up">
          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
                type="text"
                placeholder="Tìm kiếm mã đơn, khách hàng..."
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 bg-white rounded-lg shadow-sm p-4 transition-all hover:shadow-md animate-slide-up">
          {statusTabs.map((tab) => (
              <button
                  key={tab.value}
                  onClick={() => dispatch(setFilterStatus(tab.value))}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-transform hover:scale-105 ${
                      filterStatus === tab.value
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {tab.label} ({orderCounts[tab.value || 'all']})
              </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-x-auto transition-all hover:shadow-md animate-slide-up">
          {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
                <svg
                    className="animate-spin h-8 w-8 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                  <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                  ></circle>
                  <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
          )}
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-medium">
            <tr>
              <th scope="col" className="py-3 px-4 text-left">Mã đơn</th>
              <th scope="col" className="py-3 px-4 text-left">Ngày đặt</th>
              <th scope="col" className="py-3 px-4 text-left">Khách hàng</th>
              <th scope="col" className="py-3 px-4 text-left">Thanh toán</th>
              <th scope="col" className="py-3 px-4 text-left">Trạng thái</th>
              <th scope="col" className="py-3 px-4 text-left">Vận chuyển</th>
              <th scope="col" className="py-3 px-4 text-left">Tổng tiền</th>
              <th scope="col" className="py-3 px-4 text-left">Hành động</th>
            </tr>
            </thead>
            <tbody>
            {paginatedOrders.map((order) => (
                <tr key={order.id} className="border-t border-gray-200 hover:bg-gray-100 transition-colors">
                  <td
                      className="py-3 px-4 text-green-500 font-medium cursor-pointer transition-transform hover:scale-105"
                      onClick={() => handleViewDetails(order.id)}
                  >
                    #{order.id}
                  </td>
                  <td className="py-3 px-4">{new Date(order.created_at).toLocaleString('vi-VN')}</td>
                  <td className="py-3 px-4">{order.customer_name}</td>
                  <td className="py-3 px-4">
                  <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium gap-1 ${
                          order.payment_status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : order.payment_status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                      }`}
                  >
                    <FiCreditCard className="text-xs" />
                    {order.payment_status === 'completed'
                        ? 'Đã thanh toán'
                        : order.payment_status === 'pending'
                            ? 'Chờ thanh toán'
                            : 'Thất bại'}
                  </span>
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                  <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1">
                    <FiTruck className="text-xs text-gray-500" />
                    {order.shipping_partner ? `${order.shipping_partner} (${order.tracking_number || 'N/A'})` : 'N/A'}
                  </span>
                  </td>
                  <td className="py-3 px-4">
                    {order.total_amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                          onClick={() => handleViewDetails(order.id)}
                          className="text-blue-500 hover:text-blue-600 transition-transform hover:scale-105"
                          disabled={isLoading}
                      >
                        Xem chi tiết
                      </button>
                      {(order.status === 'pending' || order.status === 'processing' || order.status === 'shipped') && (
                          <Popover className="relative">
                            <Popover.Button
                                className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600 transition-transform hover:scale-105"
                                disabled={isLoading}
                                aria-label={`Thay đổi trạng thái đơn hàng #${order.id}`}
                            >
                              <FiEdit className="text-xs" />
                              Hành động
                            </Popover.Button>
                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                              <Popover.Panel className="absolute right-0 mt-2 w-36 origin-top-right rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                <div className="py-1 flex flex-col gap-1">
                                  {getStatusActions(order.status, order.id)}
                                </div>
                              </Popover.Panel>
                            </Transition>
                          </Popover>
                      )}
                    </div>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
          <div>
            Hiển thị {startIndex + 1} đến {Math.min(startIndex + itemsPerPage, filteredOrders.length)} của{' '}
            {filteredOrders.length} đơn hàng
          </div>
          <div className="flex items-center gap-2">
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-transform hover:scale-105"
            >
              <FiChevronLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 rounded-full text-sm ${
                        page === currentPage
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } transition-transform hover:scale-105`}
                >
                  {page}
                </button>
            ))}
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-transform hover:scale-105"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
  );
};

export default OrdersPage;