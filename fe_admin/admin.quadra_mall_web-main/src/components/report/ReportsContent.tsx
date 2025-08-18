import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Eye, AlertTriangle, TrendingUp, ShoppingCart, Users, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';

type Product = {
  id: string;
  name: string;
  price: number;
  status: string;
  stock: number;
  sold: number;
};

type ViolationReport = {
  id: number;
  reporterName: string;
  reason: string;
  description: string;
  evidence: string;
  reportedAt: string;
  status: string;
  severity: string;
};

type Shop = {
  id: number;
  shopName: string;
  ownerName: string;
  email: string;
  status: string;
  isLocked: boolean;
  lockReason?: string;
  rating: number;
  orderCount: number;
  completionRate: number;
  totalRevenue: number;
  commissionFee: number;
  products: Product[];
  violationReports: ViolationReport[];
};

type Order = {
  id: string;
  shopId: number;
  totalAmount: number;
  commission: number;
  status: string;
  createdAt: string;
};

type Customer = {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
};

const ReportsContent = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [loading, setLoading] = useState(true);

  // Mock data (có thể thay bằng API)
  const mockShops  = [
    {
      id: 1,
      shopName: "Thời Trang Hiện Đại",
      ownerName: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      status: "active",
      isLocked: false,
      rating: 4.8,
      orderCount: 5420,
      completionRate: 98,
      totalRevenue: 2500000,
      commissionFee: 125000,
      products: [
        { id: '1', name: "Áo thun nam", price: 250000, status: "active", stock: 100, sold: 450 },
        { id: '2', name: "Quần jean nữ", price: 450000, status: "active", stock: 80, sold: 230 }
      ],
      violationReports: []
    },
    {
      id: 2,
      shopName: "Điện Tử Thông Minh",
      ownerName: "Trần Thị B",
      email: "tranthib@email.com",
      status: "active",
      isLocked: true,
      lockReason: "Vi phạm chính sách bán hàng",
      rating: 4.2,
      orderCount: 2150,
      completionRate: 92,
      totalRevenue: 1800000,
      commissionFee: 90000,
      products: [
        { id: '3', name: "Điện thoại iPhone", price: 15000000, status: "pending", stock: 20, sold: 45 }
      ],
      violationReports: [
        {
          id: 1,
          reporterName: "Khách hàng X",
          reason: "Bán hàng giả",
          description: "Sản phẩm không đúng mô tả",
          evidence: "evidence1.jpg",
          reportedAt: "2024-06-15",
          status: "pending",
          severity: "high"
        }
      ]
    }
  ];

  const mockOrders = [
    { id: 'ORD001', shopId: 1, totalAmount: 1000000, commission: 50000, status: 'completed', createdAt: '2024-06-01' },
    { id: 'ORD002', shopId: 1, totalAmount: 1500000, commission: 75000, status: 'completed', createdAt: '2024-06-02' },
    { id: 'ORD003', shopId: 2, totalAmount: 2000000, commission: 100000, status: 'pending', createdAt: '2024-06-03' },
    { id: 'ORD004', shopId: 2, totalAmount: 800000, commission: 40000, status: 'cancelled', createdAt: '2024-06-04' },
  ];

  const mockCustomers = [
    { id: 'CUS001', name: 'Nguyễn Văn C', email: 'customer1@email.com', totalOrders: 5, totalSpent: 5000000, lastOrderDate: '2024-06-10' },
    { id: 'CUS002', name: 'Trần Thị D', email: 'customer2@email.com', totalOrders: 3, totalSpent: 3000000, lastOrderDate: '2024-06-05' },
  ];

  useEffect(() => {
    // Giả lập fetch dữ liệu từ API
    setTimeout(() => {
      setShops(mockShops);
      setOrders(mockOrders);
      setCustomers(mockCustomers);
      setLoading(false);
    }, 1000);

    // TODO: Thay bằng API thực tế
    // fetch('/api/shops').then(res => res.json()).then(data => setShops(data));
    // fetch('/api/orders').then(res => res.json()).then(data => setOrders(data));
    // fetch('/api/customers').then(res => res.json()).then(data => setCustomers(data));
  }, []);

  // Lọc đơn hàng theo thời gian
  const filteredOrders = orders.filter(order => {
    if (!dateRange.startDate || !dateRange.endDate) return true;
    const orderDate = new Date(order.createdAt);
    return orderDate >= new Date(dateRange.startDate) && orderDate <= new Date(dateRange.endDate);
  });

  // Xuất Excel
  const exportToExcel = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  // Dữ liệu xu hướng đơn hàng (giả lập)
  const orderTrendData = [
    { month: 'Jan', orders: 100 },
    { month: 'Feb', orders: 120 },
    { month: 'Mar', orders: 150 },
    { month: 'Apr', orders: 130 },
    { month: 'May', orders: 170 },
    { month: 'Jun', orders: 200 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={48} className="mx-auto text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Bộ lọc */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Bộ lọc báo cáo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Từ ngày</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Đến ngày</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      {/* Báo cáo doanh thu */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <TrendingUp size={20} className="mr-2 text-blue-600" />
            Báo cáo doanh thu từ hoa hồng
          </h3>
          <button
            onClick={() => exportToExcel(
              filteredOrders.map(order => ({
                'Mã đơn hàng': order.id,
                'Shop': shops.find(s => s.id === order.shopId)?.shopName || 'Unknown',
                'Tổng giá trị': order.totalAmount,
                'Hoa hồng': order.commission,
                'Trạng thái': order.status === 'completed' ? 'Hoàn thành' : order.status === 'pending' ? 'Chờ xử lý' : 'Hủy',
                'Ngày đặt': order.createdAt
              })),
              'BaoCaoDoanhThu'
            )}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <Download size={16} className="mr-2" />
            Xuất Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng giá trị</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hoa hồng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đặt</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shops.find(s => s.id === order.shopId)?.shopName || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.totalAmount.toLocaleString()} VNĐ</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.commission.toLocaleString()} VNĐ</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status === 'completed' ? 'Hoàn thành' : order.status === 'pending' ? 'Chờ xử lý' : 'Hủy'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Xu hướng đơn hàng */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ShoppingCart size={20} className="mr-2 text-blue-600" />
          Xu hướng đơn hàng
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={orderTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis label={{ value: 'Số đơn hàng', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="orders" stroke="#3B82F6" name="Số đơn hàng" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Hiệu suất shop */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <TrendingUp size={20} className="mr-2 text-blue-600" />
            Hiệu suất shop
          </h3>
          <button
            onClick={() => exportToExcel(
              shops.map(shop => ({
                'Tên shop': shop.shopName,
                'Doanh thu': shop.totalRevenue,
                'Số đơn hàng': shop.orderCount,
                'Tỷ lệ hoàn thành': `${shop.completionRate}%`,
                'Đánh giá trung bình': shop.rating
              })),
              'HieuSuatShop'
            )}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <Download size={16} className="mr-2" />
            Xuất Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên shop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doanh thu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số đơn hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tỷ lệ hoàn thành</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đánh giá</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shops.map(shop => (
                <tr key={shop.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shop.shopName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shop.totalRevenue.toLocaleString()} VNĐ</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shop.orderCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shop.completionRate}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shop.rating}/5</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sản phẩm bán chạy */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <ShoppingCart size={20} className="mr-2 text-blue-600" />
            Sản phẩm bán chạy
          </h3>
          <button
            onClick={() => exportToExcel(
              shops.flatMap(shop => shop.products.map(product => ({
                'Tên sản phẩm': product.name,
                'Shop': shop.shopName,
                'Giá': product.price,
                'Số lượng bán': product.sold,
                'Tồn kho': product.stock
              }))),
              'SanPhamBanChay'
            )}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <Download size={16} className="mr-2" />
            Xuất Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên sản phẩm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng bán</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tồn kho</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shops.flatMap(shop => shop.products.map(product => (
                <tr key={`${shop.id}-${product.id}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shop.shopName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.price.toLocaleString()} VNĐ</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.sold}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Báo cáo vi phạm */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <AlertTriangle size={20} className="mr-2 text-red-600" />
            Báo cáo vi phạm
          </h3>
          <button
            onClick={() => exportToExcel(
              shops.flatMap(shop => shop.violationReports.map(report => ({
                'Shop': shop.shopName,
                'Lý do': report.reason,
                'Mô tả': report.description,
                'Mức độ': report.severity === 'high' ? 'Nghiêm trọng' : report.severity === 'medium' ? 'Trung bình' : 'Nhẹ',
                'Trạng thái': report.status === 'pending' ? 'Chờ xử lý' : report.status === 'resolved' ? 'Đã xử lý' : 'Bị từ chối',
                'Ngày báo cáo': report.reportedAt
              }))),
              'BaoCaoViPham'
            )}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <Download size={16} className="mr-2" />
            Xuất Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lý do</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mức độ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày báo cáo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shops.flatMap(shop => shop.violationReports.map(report => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shop.shopName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      report.severity === 'high' ? 'bg-red-100 text-red-800' :
                      report.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {report.severity === 'high' ? 'Nghiêm trọng' : report.severity === 'medium' ? 'Trung bình' : 'Nhẹ'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {report.status === 'pending' ? 'Chờ xử lý' : report.status === 'resolved' ? 'Đã xử lý' : 'Bị từ chối'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.reportedAt}</td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Phân tích khách hàng */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Users size={20} className="mr-2 text-blue-600" />
            Phân tích khách hàng
          </h3>
          <button
            onClick={() => exportToExcel(
              customers.map(customer => ({
                'Tên khách hàng': customer.name,
                'Email': customer.email,
                'Số đơn hàng': customer.totalOrders,
                'Tổng chi tiêu': customer.totalSpent,
                'Đơn hàng gần nhất': customer.lastOrderDate
              })),
              'PhanTichKhachHang'
            )}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <Download size={16} className="mr-2" />
            Xuất Excel
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Khách hàng mới</p>
            <p className="text-lg font-semibold">{customers.length}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Giá trị đơn hàng TB</p>
            <p className="text-lg font-semibold">
              {(customers.reduce((sum, c) => sum + c.totalSpent, 0) / orders.length).toLocaleString()} VNĐ
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Khách hàng quay lại</p>
            <p className="text-lg font-semibold">{customers.filter(c => c.totalOrders > 1).length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsContent;