import React, { memo, useState, useEffect } from 'react';
import { ProductDetailDTO, StoreDTO } from '@/types/product/product_Detail';

interface ProductInfoProps {
  product: ProductDetailDTO | null;
  selectedVariantId: number | null;
  highlights?: string[];
}

const formatTime = (seconds: number): string => {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const ProductInfo: React.FC<ProductInfoProps> = ({
                                                   product,
                                                   selectedVariantId,
                                                   highlights = [],
                                                 }) => {
  // State để lưu countdown thời gian thực
  const [countdown, setCountdown] = useState<string>('');

  // useEffect để cập nhật countdown mỗi giây
  useEffect(() => {
    if (product?.flashSale && product?.flashSaleEndTime) {
      const endTime = new Date(product.flashSaleEndTime).getTime();
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const seconds = Math.max(0, Math.floor((endTime - now) / 1000));
        setCountdown(formatTime(seconds));
        if (seconds === 0) {
          clearInterval(interval); // Dừng khi countdown đạt 0
        }
      }, 1000);
      return () => clearInterval(interval); // Cleanup khi component unmount
    } else {
      setCountdown('');
    }
  }, [product?.flashSale, product?.flashSaleEndTime]);

  // Kiểm tra product null
  if (!product) {
    console.log('Product is null');
    return <p className="text-gray-500">Không có thông tin sản phẩm.</p>;
  }

  // Tìm variant được chọn
  const selectedVariant = product.variants?.find((v) => v?.id === selectedVariantId);

  // Tính toán số lượng tồn kho
  const getStockQuantity = (): number => {
    if (selectedVariant) {
      return selectedVariant.stockQuantity || 0;
    }
    // Nếu chưa chọn variant, sử dụng tổng số lượng tồn kho
    return product.totalStockQuantity || 0;
  };

  // Lấy dữ liệu đã bán từ product
  const soldCount = product.soldCount || 0;

  // Lấy rating từ product
  const rating = product.averageRating || product.store?.rating || 0;

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>

      {/* Flash Sale Countdown */}
      {product.flashSale && product.flashSaleEndTime && countdown && (
        <div className="flex items-center justify-between mt-3 bg-red-100 text-red-600 font-semibold p-3 rounded-lg shadow-sm">
          <span className="text-lg">FLASH SALE</span>
          <span className="text-lg">KẾT THÚC SAU: {countdown}</span>
        </div>
      )}

      {/* Giá sản phẩm */}
      <div className="mt-3">
        {selectedVariant ? (
          selectedVariant.discountedPrice ? (
            <div className="flex flex-col gap-1">
              <p className="text-2xl font-bold text-green-600">
                {selectedVariant.discountedPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              </p>
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-400 line-through">
                  {selectedVariant.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </p>
                <span className="text-xs bg-green-100 text-green-600 font-semibold px-2 py-1 rounded">
                  {product.flashSale?.percentageDiscount}% Giảm
                </span>
              </div>
            </div>
          ) : (
            <p className="text-2xl font-bold text-green-600">
              {selectedVariant.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </p>
          )
        ) : (
          <p className="text-2xl font-bold text-green-600">
            {product.samePrice && product.minPrice != null
              ? product.minPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
              : product.minPrice != null && product.maxPrice != null
                ? `Từ ${product.minPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} - ${product.maxPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`
                : 'Giá không khả dụng'}
          </p>
        )}
      </div>

      {/* Thông tin đã bán, đánh giá, số lượng */}
      <p className="text-sm text-gray-600 mt-2">
        Đã bán: {soldCount.toLocaleString('vi-VN')} |{' '}
        {rating > 0 ? (
          <>
            Đánh giá: ★ <span className="text-red-500">{rating.toFixed(1)}</span>
          </>
        ) : (
          'Chưa có đánh giá'
        )}{' '}
        | Số lượng: {getStockQuantity().toLocaleString('vi-VN')}
      </p>

      {/* Thông tin cửa hàng */}
      {product.store && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700">Cửa hàng: {product.store.name}</p>
          <p className="text-sm text-gray-600">{product.store.address ?? 'Không có địa chỉ'}</p>
        </div>
      )}

      {/* Điểm nổi bật */}
      {highlights.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700">Điểm nổi bật:</h3>
          <ul className="list-disc list-inside text-gray-600 text-sm">
            {highlights.map((highlight, index) => (
              <li key={index}>{highlight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default memo(ProductInfo);
