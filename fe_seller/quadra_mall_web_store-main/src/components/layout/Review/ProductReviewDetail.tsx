import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '@/store/store';
import { addReviewReply, markReviewAsViewed } from '@/store/reviewSlice';
import { FiArrowLeft, FiStar, FiUser, FiImage, FiMessageSquare, FiEdit3, FiFilter } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ChartOptions, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Chart } from 'chart.js/auto';
import {Star} from "lucide-react";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Review {
    id: number;
    productId: number;
    reviewerName: string;
    rating: number;
    text: string;
    date: string;
    image?: string;
    reply?: string;
    isNew?: boolean;
}

const ProductReviewDetail: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const products = useSelector((state: RootState) => state.reviews.products || []);
    const reviews = useSelector((state: RootState) => state.reviews.reviews || []);
    const loading = useSelector((state: RootState) => state.reviews.loading);

    const [replyText, setReplyText] = useState('');
    const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
    const [starFilter, setStarFilter] = useState<number | null>(null);
    const [showUnrepliedOnly, setShowUnrepliedOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 5;

    const product = products.find((p) => p.id === parseInt(productId || '0'));

    // Mark new reviews as viewed when the component mounts
    useEffect(() => {
        const newReviews = reviews.filter((r) => r.productId === parseInt(productId || '0') && r.isNew);
        newReviews.forEach((review) => {
            dispatch(markReviewAsViewed(review.id));
        });
    }, [reviews, productId, dispatch]);

    const filteredReviews = useMemo(() => {
        if (!product) return [];

        let filtered = reviews.filter((r) => r.productId === product.id);

        if (starFilter !== null) {
            filtered = filtered.filter((r) => r.rating === starFilter);
        }

        if (showUnrepliedOnly) {
            filtered = filtered.filter((r) => !r.reply);
        }

        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [reviews, product, starFilter, showUnrepliedOnly]);

    const paginatedReviews = useMemo(() => {
        const startIndex = (currentPage - 1) * reviewsPerPage;
        const endIndex = startIndex + reviewsPerPage;
        return filteredReviews.slice(startIndex, endIndex);
    }, [filteredReviews, currentPage]);

    const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

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

    const handleReplySubmit = async (reviewId: number) => {
        if (!replyText.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Lỗi',
                text: 'Vui lòng nhập nội dung phản hồi.',
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Xác nhận',
            text: 'Bạn có chắc chắn muốn gửi phản hồi này?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Gửi',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await dispatch(addReviewReply({ id: reviewId, reply: replyText })).unwrap();
                setReplyText('');
                setSelectedReviewId(null);
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: 'Phản hồi đã được gửi.',
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể gửi phản hồi. Vui lòng thử lại.',
                });
            }
        }
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
                            ? 'bg-blue-600 text-white'
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

    // Tính số lượng đánh giá theo số sao (dựa trên toàn bộ reviews thay vì filteredReviews)
    const reviewCountsByRating = useMemo(() => {
        const counts = [0, 0, 0, 0, 0]; // Index 0: 1 sao, 1: 2 sao, ..., 4: 5 sao
        const productReviews = reviews.filter((r) => r.productId === parseInt(productId || '0'));
        productReviews.forEach((review) => {
            counts[review.rating - 1] += 1;
        });
        return counts;
    }, [reviews, productId]);

    // Tính tổng số đánh giá và phần trăm
    const totalReviews = reviewCountsByRating.reduce((sum, count) => sum + count, 0);
    const reviewPercentages = reviewCountsByRating.map(count => totalReviews > 0 ? ((count / totalReviews) * 100).toFixed(1) : '0.0');

    // Custom Rating Chart Component
    const RatingChart = () => {
        const maxCount = Math.max(...reviewCountsByRating);

        return (
            <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating, index) => {
                    const count = reviewCountsByRating[rating - 1];
                    const percentage = reviewPercentages[rating - 1];
                    const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

                    return (
                        <div key={rating} className="flex items-center space-x-3">
                            {/* Star Rating Label */}
                            <div className="flex items-center space-x-1 w-16">
                                <span className="text-sm font-medium text-gray-700">{rating}</span>
                                <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                            </div>

                            {/* Progress Bar */}
                            <div className="flex-1 relative">
                                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${barWidth}%` }}
                                    />
                                </div>
                                {/* Count overlay on bar */}
                                {count > 0 && (
                                    <div className="absolute inset-0 flex items-center justify-start pl-2">
                                        <span className="text-xs font-medium text-white drop-shadow-sm">{count}</span>
                                    </div>
                                )}
                            </div>

                            {/* Percentage and Count */}
                            <div className="flex items-center space-x-2 w-20 text-right">
                                <span className="text-sm text-gray-600">{percentage}%</span>
                                <span className="text-xs text-gray-500">({count})</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Tính trung bình sao
    const avgRating = product ? (product.avgRating || 0).toFixed(1) : '0.0';
    const renderRatingStars = () => {
        const rating = parseFloat(avgRating);
        return Array(5).fill(0).map((_, i) => {
            const filled = i < Math.floor(rating);
            const halfFilled = i === Math.floor(rating) && rating % 1 >= 0.5;

            return (
                <FiStar
                    key={i}
                    className={`w-5 h-5 ${
                        filled || halfFilled
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                    }`}
                />
            );
        });
    };

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Không tìm thấy sản phẩm.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/reviews')}
                            className="mr-4 text-gray-600 hover:text-gray-900"
                        >
                            <FiArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                            <div className="flex items-center mt-1">
                                <div className="flex items-center">{renderRatingStars()}</div>
                                <span className="ml-2 text-lg font-semibold text-gray-900">{avgRating}</span>
                                <span className="ml-2 text-gray-500">({totalReviews} đánh giá)</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/products/edit/${product.id}`)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <FiEdit3 className="w-5 h-5 mr-2" />
                        Chỉnh sửa sản phẩm
                    </button>
                </div>
            </div>

            <div className="p-6">


                {/* Improved Rating Distribution Chart */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Phân bố đánh giá</h2>
                        <div className="text-sm text-gray-500">
                            Tổng cộng: {totalReviews} đánh giá
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Rating Overview */}
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="text-4xl font-bold text-gray-900 mb-2">{avgRating}</div>
                            <div className="flex items-center mb-2">{renderRatingStars()}</div>
                            <div className="text-sm text-gray-500">{totalReviews} đánh giá</div>
                        </div>

                        {/* Rating Distribution */}
                        <div className="lg:col-span-2">
                            <RatingChart />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <FiFilter className="w-5 h-5 text-gray-600 mr-2" />
                                <span className="font-medium text-gray-900">Bộ lọc:</span>
                            </div>
                            <select
                                value={starFilter || ''}
                                onChange={(e) => setStarFilter(e.target.value ? parseInt(e.target.value) : null)}
                                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Tất cả</option>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <option key={star} value={star}>
                                        {star } sao
                                    </option>
                                ))}
                            </select>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={showUnrepliedOnly}
                                    onChange={(e) => setShowUnrepliedOnly(e.target.checked)}
                                    className="mr-2"
                                />
                                Chỉ hiển thị chưa phản hồi
                            </label>
                        </div>
                        <div className="text-sm text-gray-500">
                            Hiển thị {paginatedReviews.length} / {filteredReviews.length} đánh giá
                        </div>
                    </div>
                </div>

                {/* Review List */}
                <div className="space-y-6">
                    {paginatedReviews.map((review) => (
                        <div
                            key={review.id}
                            className={`bg-white rounded-lg shadow-sm p-6 ${
                                review.isNew ? 'border-l-4 border-blue-500' : ''
                            }`}
                        >
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <FiUser className="w-8 h-8 text-gray-400" />
                                </div>
                                <div className="ml-4 flex-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">{review.reviewerName}</p>
                                            <div className="flex items-center mt-1">{renderStars(review.rating)}</div>
                                        </div>
                                        <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                    <p className="mt-2 text-gray-700">{review.text}</p>
                                    {review.image && (
                                        <img
                                            src={review.image}
                                            alt="Review"
                                            className="mt-2 w-24 h-24 object-cover rounded-lg"
                                        />
                                    )}
                                    {review.reply ? (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm font-medium text-gray-900">Phản hồi:</p>
                                            <p className="text-sm text-gray-700">{review.reply}</p>
                                        </div>
                                    ) : (
                                        <div className="mt-4">
                                            {selectedReviewId === review.id ? (
                                                <div className="flex items-center space-x-2">
                                                    <textarea
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder="Nhập phản hồi..."
                                                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        onClick={() => handleReplySubmit(review.id)}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                                        disabled={loading}
                                                    >
                                                        Gửi
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setReplyText('');
                                                            setSelectedReviewId(null);
                                                        }}
                                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedReviewId(review.id)}
                                                    className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                >
                                                    <FiMessageSquare className="w-4 h-4 mr-1" />
                                                    Phản hồi
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {renderPagination()}

                {paginatedReviews.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Không tìm thấy đánh giá nào.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductReviewDetail;