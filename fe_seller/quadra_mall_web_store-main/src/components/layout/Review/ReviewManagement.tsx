// ReviewManagement.tsx - Trang danh sách sản phẩm (đã cải thiện)
import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '@/store/store';
import { markNotificationAsRead, removeNotification, clearReadNotifications } from '@/store/reviewSlice';
import { FiSearch, FiStar, FiTrendingUp, FiBell, FiX, FiCheck } from 'react-icons/fi';
import { TfiBarChart } from "react-icons/tfi";

interface Product {
    id: number;
    name: string;
    avgRating: number;
    reviewCount: number;
    image: string;
}

const ReviewManagement: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const products = useSelector((state: RootState) => state.reviews.products || []);
    const reviews = useSelector((state: RootState) => state.reviews.reviews || []);
    const notifications = useSelector((state: RootState) => state.reviews.notifications || []);

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showNotifications, setShowNotifications] = useState(false);
    const itemsPerPage = 8;

    const filteredProducts = useMemo(() => {
        return products.filter((product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    // Phân trang sản phẩm
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    // Tính toán thống kê tổng quan
    const totalReviews = reviews.length;
    const averageRating = reviews.length > 0 ?
        (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : '0';
    const growthPercentage = Math.floor(Math.random() * 30) + 5; // Mock data
    const unreadNotifications = notifications.filter(n => !n.read).length;

    const renderStars = (rating: number) => {
        return Array(5)
            .fill(0)
            .map((_, i) => (
                <FiStar
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
            ));
    };

    const handleProductClick = (productId: number) => {
        navigate(`/reviews/${productId}`);
    };

    const handleNotificationClick = (notificationId: string, productId?: number) => {
        dispatch(markNotificationAsRead(notificationId));
        if (productId) {
            navigate(`/reviews/${productId}`);
        }
        setShowNotifications(false);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-2 mx-1 rounded-lg text-sm ${
                        i === currentPage
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="flex justify-center items-center mt-8 space-x-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg text-sm bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Trước
                </button>
                {pages}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg text-sm bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Sau
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Quản lý đánh giá sản phẩm</h1>
                            <p className="text-gray-600 mt-1">Tháng 3, 2021 - Tháng 2, 2022</p>
                        </div>

                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <FiBell className="w-6 h-6" />
                                {unreadNotifications > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {unreadNotifications}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                    <div className="p-4 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900">Thông báo</h3>
                                            <button
                                                onClick={() => dispatch(clearReadNotifications())}
                                                className="text-sm text-green-600 hover:text-green-700"
                                            >
                                                Xóa đã đọc
                                            </button>
                                        </div>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500">
                                                Không có thông báo nào
                                            </div>
                                        ) : (
                                            notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                                        !notification.read ? 'bg-green-50' : ''
                                                    }`}
                                                    onClick={() => handleNotificationClick(notification.id, notification.productId)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="text-sm text-gray-900">{notification.message}</p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {new Date(notification.timestamp).toLocaleString('vi-VN')}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center space-x-2 ml-2">
                                                            {!notification.read && (
                                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    dispatch(removeNotification(notification.id));
                                                                }}
                                                                className="text-gray-400 hover:text-gray-600"
                                                            >
                                                                <FiX className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng đánh giá</p>
                                <p className="text-3xl font-bold text-gray-900">{totalReviews.toLocaleString()}</p>
                                <div className="flex items-center mt-2">
                                    <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                    <span className="text-sm text-green-600">+{growthPercentage}%</span>
                                    <span className="text-sm text-gray-500 ml-1">so với năm trước</span>
                                </div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-full">
                                <TfiBarChart className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Đánh giá trung bình</p>
                                <div className="flex items-center mt-2">
                                    <p className="text-3xl font-bold text-gray-900">{averageRating}</p>
                                    <div className="flex items-center ml-3">
                                        {renderStars(parseFloat(averageRating))}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Trên tất cả sản phẩm</p>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded-full">
                                <FiStar className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Sản phẩm có đánh giá</p>
                                <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                                <p className="text-sm text-gray-500 mt-2">Đang được theo dõi</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-full">
                                <FiTrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="relative max-w-md">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1); // Reset to first page when searching
                                }}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        <div className="text-sm text-gray-500">
                            Hiển thị {Math.min(itemsPerPage, filteredProducts.length - (currentPage - 1) * itemsPerPage)} / {filteredProducts.length} sản phẩm
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedProducts.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => handleProductClick(product.id)}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
                        >
                            <div className="aspect-w-16 aspect-h-12 bg-gray-100">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>

                                <div className="flex items-center mb-2">
                                    <div className="flex items-center">
                                        {renderStars(product.avgRating)}
                                    </div>
                                    <span className="text-sm text-gray-600 ml-2">{product.avgRating.toFixed(1)}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-black-600">
                                        {product.reviewCount} đánh giá
                                    </span>
                                    <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                                        Xem chi tiết →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {renderPagination()}

                {paginatedProducts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Không tìm thấy sản phẩm nào.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewManagement;