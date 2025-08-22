import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiMessageCircle, FiCheck } from 'react-icons/fi';
import { ShopDetailDto, StoreFavoriteRequestDto } from '@/types/store_detail/interfaces';
import { storeService } from '@/api/storeService';
import { toast } from 'react-toastify';

interface StoreHeaderProps {
  storeInfo: ShopDetailDto;
  onToggleFavorite: (isFavorite: boolean) => void;
}

const StoreHeader: React.FC<StoreHeaderProps> = ({ storeInfo, onToggleFavorite }) => {
  const navigate = useNavigate();

  const handleChat = () => {
    // Open ChatInterface route and pass storeId, storeName and logoUrl via query string
    const params = new URLSearchParams({
      storeId: String(storeInfo.storeId),
      storeName: storeInfo.storeName,
      logoUrl: storeInfo.logoUrl || ''
    });
    navigate(`/ChatInterface?${params.toString()}`);
  };
  // Hàm format số thành dạng ngắn gọn (1000 → "1k+")
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${Math.floor(num / 1000)}k+`;
    }
    return num.toString();
  };

  // Hàm render sao đánh giá
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="text-red-500">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="text-red-500">☆</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">☆</span>);
      }
    }
    return stars;
  };

  // Xử lý nhấn nút Theo dõi/Đã theo dõi
  const handleToggleFavorite = async () => {
    try {
      if (storeInfo.favorite) {
        // Gọi API xóa yêu thích
        await storeService.removeStoreFavorite(storeInfo.storeId);
        onToggleFavorite(false);
      } else {
        // Gọi API thêm yêu thích
        const favoriteDto: StoreFavoriteRequestDto = {
          storeId: storeInfo.storeId,
          isFavorite: true,
        };
        await storeService.addStoreFavorite(favoriteDto);
        onToggleFavorite(true);
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Không thể thực hiện hành động');
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* Left: Logo + Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
          {/* Store Logo */}
          <div className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img
              src={storeInfo.logoUrl}
              alt={`${storeInfo.storeName} Logo`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/80';
              }}
            />
          </div>

          {/* Info + Actions */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div className="pl-1">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{storeInfo.storeName}</h1>
              <p className="text-sm text-gray-500">{storeInfo.status === 'ACTIVE' ? 'Online' : 'Offline'}</p>
            </div>

            <div className="flex gap-3 flex-wrap pl-1">
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  storeInfo.favorite
                    ? 'border border-red-500 text-red-500 hover:bg-red-50'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {storeInfo.favorite ? <FiCheck size={16} /> : <FiPlus size={16} />}
                {storeInfo.favorite ? 'Đã theo dõi' : 'Theo dõi'}
              </button>
              <button onClick={handleChat} className="flex items-center gap-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium">
                <FiMessageCircle size={16} />
                Chat
              </button>
            </div>
          </div>
        </div>

        {/* Right: Stats + Address */}
        <div className="w-full md:w-[800px] flex-shrink-0">
          {/* Stats */}
          <div className="flex flex-wrap text-sm pl-1">
            <div className="flex justify-between w-1/2 pr-4 mb-3">
              <span className="text-gray-600">Sản phẩm:</span>
              <span className="font-semibold text-red-500">{formatNumber(storeInfo.productCount)}</span>
            </div>

            <div className="flex justify-between w-1/2 pr-4 mb-3">
              <span className="text-gray-600">Người theo dõi:</span>
              <span className="font-semibold text-red-500">{formatNumber(storeInfo.followerCount)}</span>
            </div>

            <div className="flex justify-between w-1/2 pr-4 mb-3">
              <span className="text-gray-600">Đánh giá:</span>
              <div className="flex items-center gap-1 text-lg text-red-500">
                {renderStars(storeInfo.averageRating)}
                <span className="text-sm ml-1">({storeInfo.reviewCount})</span>
              </div>
            </div>

            <div className="flex justify-between w-1/2 pr-4 mb-3">
              <span className="text-gray-600">Tỉ lệ phản hồi chat:</span>
              <span className="font-semibold text-red-500">{Math.round(storeInfo.chatResponseRate)}%</span>
            </div>
          </div>

          {/* Store Address */}
          <div className="mt-3 text-sm pl-1 border-t pt-2">
            <span className="text-gray-600">Địa chỉ:</span>{" "}
            <span className="font-semibold">{storeInfo.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreHeader;
