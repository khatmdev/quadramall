import React, { memo } from 'react';
import { ProductDetailDTO } from '@/types/product/product_Detail';

interface ReviewsSectionProps {
  product: ProductDetailDTO | null;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ product }) => {
  if (!product || !product.reviews || product.reviews.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-gray-500 text-lg">Chưa có đánh giá nào</p>
        <p className="text-gray-400 text-sm mt-1">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
      </div>
    );
  }

  const progress = ((product.averageRating ?? 0) / 5) * 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <svg className="w-6 h-6 mr-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Đánh giá sản phẩm
        </h2>
      </div>

      {/* Rating Overview */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeDasharray="100 100"
                  strokeDashoffset={100 - progress}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">
                  {(product.averageRating ?? 0).toFixed(1)}
                </span>
                <span className="text-xs text-gray-500">trên 5</span>
              </div>
            </div>
            <div className="flex justify-center items-center text-yellow-400 text-xl mb-2">
              {'★'.repeat(Math.floor(product.averageRating ?? 0))}
              {Math.floor(product.averageRating ?? 0) < 5 && '☆'.repeat(5 - Math.floor(product.averageRating ?? 0))}
            </div>
            <p className="text-sm text-gray-600">
              {product.reviewCount ?? 0} đánh giá
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-gray-800 mb-4">Phân bố rating</h3>
            <div className="space-y-3">
              {(() => {
                // Tính toán phân bố rating từ dữ liệu thực
                const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                const totalReviews = product.reviews?.length ?? 0;

                // Đếm số lượng mỗi rating
                product.reviews?.forEach(review => {
                  if (review.rating >= 1 && review.rating <= 5) {
                    ratingCounts[review.rating as keyof typeof ratingCounts]++;
                  }
                });

                // Tạo array với dữ liệu thực
                return [
                  { rating: 5, count: ratingCounts[5], percentage: totalReviews > 0 ? ratingCounts[5] / totalReviews : 0, color: 'bg-green-500' },
                  { rating: 4, count: ratingCounts[4], percentage: totalReviews > 0 ? ratingCounts[4] / totalReviews : 0, color: 'bg-blue-500' },
                  { rating: 3, count: ratingCounts[3], percentage: totalReviews > 0 ? ratingCounts[3] / totalReviews : 0, color: 'bg-yellow-500' },
                  { rating: 2, count: ratingCounts[2], percentage: totalReviews > 0 ? ratingCounts[2] / totalReviews : 0, color: 'bg-orange-500' },
                  { rating: 1, count: ratingCounts[1], percentage: totalReviews > 0 ? ratingCounts[1] / totalReviews : 0, color: 'bg-red-500' }
                ];
              })().map((dist) => (
                <div key={dist.rating} className="flex items-center">
                  <div className="flex items-center w-16">
                    <span className="text-sm font-medium text-gray-700">{dist.rating}</span>
                    <svg className="w-4 h-4 ml-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${dist.color} h-2 rounded-full transition-all duration-500 ease-out`}
                        style={{ width: `${dist.percentage * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-8 text-sm text-gray-600 text-right">{dist.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
                Tất cả đánh giá
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                Có hình ảnh
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                Có mô tả chi tiết
              </button>
            </div>
            <div className="flex gap-3">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Tất cả rating</option>
                <option>5 sao</option>
                <option>4 sao</option>
                <option>3 sao</option>
                <option>2 sao</option>
                <option>1 sao</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Chủ đề đánh giá</option>
                <option>Chất lượng sản phẩm</option>
                <option>Dịch vụ người bán</option>
                <option>Giá cả</option>
                <option>Vận chuyển</option>
                <option>Đúng mô tả</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {product.reviews?.map((review) => (
            <div key={review.id} className="bg-white border border-gray-100 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={review.avatarUrl ?? '/assets/images/default-avatar.png'}
                    className="w-12 h-12 rounded-full border-2 border-gray-100 object-cover"
                    alt="Avatar"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{review.userName ?? 'Người dùng ẩn danh'}</p>
                    <p className="text-sm text-gray-500">{review.createdAt?.toLocaleString() ?? 'Không có ngày'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="flex items-center space-x-1 px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm hover:bg-green-100 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span>{review.likes ?? 0}</span>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center mb-3">
                <div className="flex text-yellow-400 text-lg mr-3">
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {review.rating}/5 sao
                </span>
              </div>

              <p className="text-gray-700 leading-relaxed">
                {review.comment ?? 'Không có bình luận chi tiết'}
              </p>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
          <span className="text-sm text-gray-600">
            Hiển thị 1 - {Math.min(5, product.reviews?.length ?? 0)} trong tổng số {product.reviews?.length ?? 0} đánh giá
          </span>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ReviewsSection);
