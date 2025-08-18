import React, { useState, useEffect, useCallback, memo } from 'react';
import { StoreDTO, StoreFavoriteRequestDto } from '@/types/product/product_Detail';
import { toast } from 'react-toastify';
import { storeService } from '@/api/storeService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useNavigate } from 'react-router-dom';

interface ShopInfoProps {
  store: StoreDTO | null;
  onToggleFavorite?: (isFavorite: boolean) => void;
}

const ShopInfo: React.FC<ShopInfoProps> = ({ store, onToggleFavorite }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [storeStats, setStoreStats] = useState<{
    rating: number;
    productCount: number;
    reviewCount: number;
  } | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isFavorite, setIsFavorite] = useState<boolean>(store?.favorite ?? false);
  const maxRetries = 3;

  const loadStoreStats = useCallback(async () => {
    if (!store?.id) return;
    try {
      setStatsError(null);
      setStoreStats({
        rating: store.rating ?? 0,
        productCount: store.productCount ?? 0,
        reviewCount: store.reviewCount ?? 0
      });
    } catch (err) {
      if (retryCount < maxRetries) {
        setRetryCount((prev) => prev + 1);
      } else {
        setStatsError('Không thể tải thông tin cửa hàng. Vui lòng thử lại sau.');
      }
    }
  }, [store?.id, store?.rating, store?.productCount, store?.reviewCount, retryCount]);

  useEffect(() => {
    loadStoreStats();
  }, [loadStoreStats]);

  useEffect(() => {
    setIsFavorite(store?.favorite ?? false);
  }, [store?.favorite]);

  const handleRetry = () => {
    setRetryCount(0);
    loadStoreStats();
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để theo dõi cửa hàng.');
      navigate('/login');
      return;
    }

    if (!store?.id) {
      toast.error('Không thể thực hiện hành động: Cửa hàng không hợp lệ');
      return;
    }

    try {
      if (isFavorite) {
        await storeService.removeStoreFavorite(store.id);
        setIsFavorite(false);
        onToggleFavorite?.(false);
      } else {
        const favoriteDto: StoreFavoriteRequestDto = {
          storeId: store.id,
          isFavorite: true,
        };
        await storeService.addStoreFavorite(favoriteDto);
        setIsFavorite(true);
        onToggleFavorite?.(true);
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Không thể thực hiện hành động');
    }
  };

  const toShopDetail = (slug: string | undefined) => {
    if (slug) {
      navigate(`/shopdetail/${slug}`);
    }
  };

  if (!store) {
    return <p className="text-gray-500 text-sm p-4">Không có thông tin cửa hàng.</p>;
  }

  const rating = storeStats?.rating ?? store.rating ?? 0;
  const productCount = storeStats?.productCount ?? store.productCount ?? 0;
  const reviewCount = storeStats?.reviewCount ?? store.reviewCount ?? 0;

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      {/* Header - Store info and Follow button */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start flex-1">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            <img
              src={store.logoUrl ?? 'https://via.placeholder.com/50'}
              alt={`${store.name} logo`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <h3 className="text-lg font-bold text-gray-800 truncate">{store.name}</h3>
            {store.address && (
              <p className="text-sm text-gray-500 truncate mb-2">{store.address}</p>
            )}
            {/* Action Buttons moved here */}
            <div className="flex gap-2">
              <button
                onClick={() => toShopDetail(store.slug)}
                className="px-3 py-1 text-xs border border-green-600 text-green-700 rounded hover:bg-green-50 transition-colors font-medium"
              >
                Chat ngay
              </button>
              <button
                onClick={() => toShopDetail(store.slug)}
                className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors font-medium"
              >
                Xem shop
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleToggleFavorite}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 ml-3 ${
            isFavorite
              ? 'border border-red-500 text-red-500 hover:bg-red-50'
              : 'bg-green-700 text-white hover:bg-green-800 shadow-md hover:shadow-lg'
          }`}
        >
          <span className="text-lg">{isFavorite ? '✓' : '+'}</span>
          <span className="ml-2">{isFavorite ? 'Đã theo dõi' : 'Theo dõi'}</span>
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-4 py-3 border-y border-gray-100">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Đánh giá</p>
          <div className="flex items-center justify-center">
            <span className="text-yellow-500 text-sm mr-1">★</span>
            <p className="font-semibold text-gray-800">
              {rating > 0 ? rating.toFixed(1) : 'N/A'}
            </p>
          </div>
        </div>

        <div className="text-center border-x border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Sản phẩm</p>
          <p className="font-semibold text-gray-800">
            {productCount.toLocaleString('vi-VN')}
          </p>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Lượt đánh giá</p>
          <p className="font-semibold text-gray-800">
            {reviewCount.toLocaleString('vi-VN')}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {statsError && (
        <div className="text-center mt-3 p-2 bg-red-50 rounded-md">
          <p className="text-red-600 text-sm">{statsError}</p>
          <button
            onClick={handleRetry}
            className="text-green-600 text-sm hover:underline mt-1 font-medium"
          >
            Thử lại
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(ShopInfo);
