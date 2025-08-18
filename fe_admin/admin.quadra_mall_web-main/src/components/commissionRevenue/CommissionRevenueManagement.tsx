import React, { useState } from 'react';
import {
    DollarSign,
    TrendingUp,
    Store,
    Calendar,
    Eye,
    Download,
    Filter,
    Search,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    CreditCard,
    Wallet,
    Users
} from 'lucide-react';

const CommissionRevenueManagement = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [selectedShopFilter, setSelectedShopFilter] = useState('all');

    // Dữ liệu giả cho tổng quan
    const overviewData = {
        totalRevenue: 2450000000, // 2.45 tỷ
        totalCommission: 245000000, // 245 triệu
        totalShops: 1250,
        activeShops: 980,
        monthlyGrowth: 12.5,
        commissionRate: 10 // 10%
    };

    // Dữ liệu giả cho hoa hồng theo shop
    const shopCommissions = [
        {
            id: 1,
            shopName: 'Cửa hàng Điện tử ABC',
            shopOwner: 'Nguyễn Văn A',
            totalSales: 150000000,
            commissionRate: 8,
            commissionAmount: 12000000,
            status: 'paid',
            lastPayment: '2025-06-15',
            category: 'electronics'
        },
        {
            id: 2,
            shopName: 'Quán Cơm Tấm Sài Gòn',
            shopOwner: 'Trần Thị B',
            totalSales: 85000000,
            commissionRate: 15,
            commissionAmount: 12750000,
            status: 'pending',
            lastPayment: '2025-06-10',
            category: 'food'
        },
        {
            id: 3,
            shopName: 'Fashion Store XYZ',
            shopOwner: 'Lê Văn C',
            totalSales: 220000000,
            commissionRate: 12,
            commissionAmount: 26400000,
            status: 'paid',
            lastPayment: '2025-06-18',
            category: 'fashion'
        },
        {
            id: 4,
            shopName: 'Nhà hàng Hải sản Ngon',
            shopOwner: 'Phạm Thị D',
            totalSales: 180000000,
            commissionRate: 15,
            commissionAmount: 27000000,
            status: 'overdue',
            lastPayment: '2025-05-20',
            category: 'food'
        },
        {
            id: 5,
            shopName: 'Cửa hàng Sách Văn học',
            shopOwner: 'Hoàng Văn E',
            totalSales: 45000000,
            commissionRate: 10,
            commissionAmount: 4500000,
            status: 'paid',
            lastPayment: '2025-06-12',
            category: 'books'
        }
    ];

    // Dữ liệu giả cho biểu đồ doanh thu theo tháng
    const monthlyData = [
        { month: 'T1', revenue: 1800000000, commission: 180000000 },
        { month: 'T2', revenue: 2100000000, commission: 210000000 },
        { month: 'T3', revenue: 1950000000, commission: 195000000 },
        { month: 'T4', revenue: 2300000000, commission: 230000000 },
        { month: 'T5', revenue: 2200000000, commission: 220000000 },
        { month: 'T6', revenue: 2450000000, commission: 245000000 }
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'overdue':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'paid':
                return 'Đã thanh toán';
            case 'pending':
                return 'Chờ thanh toán';
            case 'overdue':
                return 'Quá hạn';
            default:
                return 'Không xác định';
        }
    };

    const getCategoryText = (category) => {
        switch (category) {
            case 'electronics':
                return 'Điện tử';
            case 'food':
                return 'Đồ ăn';
            case 'fashion':
                return 'Thời trang';
            case 'books':
                return 'Sách';
            default:
                return category;
        }
    };

    const filteredShops = shopCommissions.filter(shop => {
        if (selectedShopFilter === 'all') return true;
        return shop.status === selectedShopFilter;
    });

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Hoa hồng & Doanh thu</h1>
                <p className="text-gray-600">Theo dõi doanh thu và hoa hồng từ các cửa hàng trên sàn</p>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'overview'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Tổng quan
                        </button>
                        <button
                            onClick={() => setActiveTab('shops')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'shops'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Hoa hồng theo Shop
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'analytics'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Báo cáo & Phân tích
                        </button>
                    </nav>
                </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <DollarSign className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Tổng doanh thu</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(overviewData.totalRevenue)}</p>
                                    <div className="flex items-center mt-1">
                                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-green-500 ml-1">+{overviewData.monthlyGrowth}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Wallet className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Tổng hoa hồng</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(overviewData.totalCommission)}</p>
                                    <p className="text-sm text-gray-500 mt-1">Tỷ lệ: {overviewData.commissionRate}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Store className="h-8 w-8 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Tổng số Shop</p>
                                    <p className="text-2xl font-bold text-gray-900">{overviewData.totalShops}</p>
                                    <p className="text-sm text-gray-500 mt-1">Hoạt động: {overviewData.activeShops}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <TrendingUp className="h-8 w-8 text-orange-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Tăng trưởng</p>
                                    <p className="text-2xl font-bold text-gray-900">+{overviewData.monthlyGrowth}%</p>
                                    <p className="text-sm text-gray-500 mt-1">So với tháng trước</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Biểu đồ Doanh thu & Hoa hồng</h3>
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="month">6 tháng gần nhất</option>
                                <option value="quarter">4 quý gần nhất</option>
                                <option value="year">Theo năm</option>
                            </select>
                        </div>

                        <div className="h-80 flex items-end justify-between space-x-2">
                            {monthlyData.map((item, index) => (
                                <div key={index} className="flex-1 flex flex-col items-center">
                                    <div className="w-full flex flex-col items-center space-y-1">
                                        <div
                                            className="w-full bg-green-500 rounded-t"
                                            style={{ height: `${(item.revenue / 2500000000) * 200}px` }}
                                            title={`Doanh thu: ${formatCurrency(item.revenue)}`}
                                        ></div>
                                        <div
                                            className="w-full bg-blue-500 rounded-b"
                                            style={{ height: `${(item.commission / 250000000) * 100}px` }}
                                            title={`Hoa hồng: ${formatCurrency(item.commission)}`}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-2">{item.month}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center mt-4 space-x-6">
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                                <span className="text-sm text-gray-600">Doanh thu</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                                <span className="text-sm text-gray-600">Hoa hồng</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Shops Tab */}
            {activeTab === 'shops' && (
                <div className="space-y-6">
                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex items-center space-x-2">
                                <Filter className="h-5 w-5 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">Lọc theo:</span>
                            </div>

                            <select
                                value={selectedShopFilter}
                                onChange={(e) => setSelectedShopFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="paid">Đã thanh toán</option>
                                <option value="pending">Chờ thanh toán</option>
                                <option value="overdue">Quá hạn</option>
                            </select>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm shop..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <button className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Xuất báo cáo
                            </button>
                        </div>
                    </div>

                    {/* Shops Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thông tin Shop
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Danh mục
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Doanh số
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hoa hồng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {filteredShops.map((shop) => (
                                    <tr key={shop.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{shop.shopName}</div>
                                                <div className="text-sm text-gray-500">{shop.shopOwner}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {getCategoryText(shop.category)}
                        </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(shop.totalSales)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatCurrency(shop.commissionAmount)}</div>
                                            <div className="text-xs text-gray-500">Tỷ lệ: {shop.commissionRate}%</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(shop.status)}`}>
                          {getStatusText(shop.status)}
                        </span>
                                            <div className="text-xs text-gray-500 mt-1">
                                                TT cuối: {shop.lastPayment}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex space-x-2">
                                                <button className="text-blue-600 hover:text-blue-900">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button className="text-green-600 hover:text-green-900">
                                                    <CreditCard className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Performing Shops */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Shop theo Hoa hồng</h3>
                            <div className="space-y-4">
                                {shopCommissions
                                    .sort((a, b) => b.commissionAmount - a.commissionAmount)
                                    .slice(0, 5)
                                    .map((shop, index) => (
                                        <div key={shop.id} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                        index === 1 ? 'bg-gray-100 text-gray-800' :
                                                            index === 2 ? 'bg-orange-100 text-orange-800' :
                                                                'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{shop.shopName}</p>
                                                    <p className="text-xs text-gray-500">{getCategoryText(shop.category)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">{formatCurrency(shop.commissionAmount)}</p>
                                                <p className="text-xs text-gray-500">{shop.commissionRate}%</p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Category Performance */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiệu suất theo Danh mục</h3>
                            <div className="space-y-4">
                                {['food', 'electronics', 'fashion', 'books'].map((category) => {
                                    const categoryShops = shopCommissions.filter(shop => shop.category === category);
                                    const totalCommission = categoryShops.reduce((sum, shop) => sum + shop.commissionAmount, 0);
                                    const totalSales = categoryShops.reduce((sum, shop) => sum + shop.totalSales, 0);

                                    return (
                                        <div key={category} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-700">{getCategoryText(category)}</span>
                                                <span className="text-sm text-gray-900">{formatCurrency(totalCommission)}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full"
                                                    style={{ width: `${(totalCommission / overviewData.totalCommission) * 100}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>{categoryShops.length} shop</span>
                                                <span>{formatCurrency(totalSales)} doanh số</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê Thanh toán</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {shopCommissions.filter(shop => shop.status === 'paid').length}
                                </div>
                                <div className="text-sm text-gray-500">Shop đã thanh toán</div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {formatCurrency(shopCommissions.filter(shop => shop.status === 'paid').reduce((sum, shop) => sum + shop.commissionAmount, 0))}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {shopCommissions.filter(shop => shop.status === 'pending').length}
                                </div>
                                <div className="text-sm text-gray-500">Shop chờ thanh toán</div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {formatCurrency(shopCommissions.filter(shop => shop.status === 'pending').reduce((sum, shop) => sum + shop.commissionAmount, 0))}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">
                                    {shopCommissions.filter(shop => shop.status === 'overdue').length}
                                </div>
                                <div className="text-sm text-gray-500">Shop quá hạn</div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {formatCurrency(shopCommissions.filter(shop => shop.status === 'overdue').reduce((sum, shop) => sum + shop.commissionAmount, 0))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommissionRevenueManagement;