import React, { useState, useEffect, memo } from 'react';
import { ProductImageDTO, VariantDTO } from '@/types/product/product_Detail';

interface ProductImagesProps {
  productId: number;
  images: ProductImageDTO[] | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  selectedVariantId: number | null;
  variants: VariantDTO[] | null;
}

const ProductImages: React.FC<ProductImagesProps> = ({
                                                       productId,
                                                       images,
                                                       thumbnailUrl,
                                                       videoUrl,
                                                       selectedVariantId,
                                                       variants,
                                                     }) => {
  // Tìm ảnh của variant được chọn
  const selectedVariant = variants?.find((v) => v?.id === selectedVariantId);
  const variantImageUrl = selectedVariant?.imageUrl;

  // Đặt media mặc định: ưu tiên ảnh variant (nếu có), rồi video, rồi thumbnailUrl
  const defaultMainMedia = variantImageUrl
    ? { type: 'image' as const, url: variantImageUrl }
    : videoUrl
      ? { type: 'video' as const, url: videoUrl }
      : {
        type: 'image' as const,
        url:
          thumbnailUrl ??
          (images?.find((img) => img?.isThumbnail)?.imageUrl ?? '/assets/images/placeholder.jpg'),
      };

  const [mainMedia, setMainMedia] = useState<{
    type: 'image' | 'video';
    url: string;
  }>(defaultMainMedia);

  // Cập nhật mainMedia khi selectedVariantId thay đổi
  useEffect(() => {
    if (variantImageUrl) {
      setMainMedia({
        type: 'image',
        url: variantImageUrl,
      });
    } else if (videoUrl) {
      setMainMedia({
        type: 'video',
        url: videoUrl,
      });
    } else {
      setMainMedia({
        type: 'image',
        url:
          thumbnailUrl ??
          (images?.find((img) => img?.isThumbnail)?.imageUrl ?? '/assets/images/placeholder.jpg'),
      });
    }
  }, [selectedVariantId, variantImageUrl, videoUrl, thumbnailUrl, images]);

  const productImages = images ?? [];

  const handleThumbnailClick = (imageUrl: string) => {
    setMainMedia({
      type: 'image',
      url: imageUrl,
    });
  };

  const handleVideoThumbnailClick = () => {
    if (videoUrl) {
      setMainMedia({
        type: 'video',
        url: videoUrl,
      });
    }
  };

  // Tạo danh sách ảnh nhỏ: video (nếu có), thumbnailUrl, rồi productImages
  const thumbnailItems: { type: 'image' | 'video'; url: string; alt?: string; key: string }[] = [];

  // Thêm video thumbnail nếu có videoUrl
  if (videoUrl) {
    thumbnailItems.push({
      type: 'video',
      url: videoUrl,
      alt: 'Ảnh đại diện video',
      key: 'video-' + videoUrl,
    });
  }

  // Thêm thumbnailUrl nếu có và không trùng với productImages
  if (thumbnailUrl && !productImages.some((img) => img?.imageUrl === thumbnailUrl)) {
    thumbnailItems.push({
      type: 'image',
      url: thumbnailUrl,
      alt: 'Ảnh đại diện sản phẩm',
      key: 'thumbnail-' + thumbnailUrl,
    });
  }

  // Thêm productImages
  productImages.forEach((img) => {
    if (img?.imageUrl) {
      thumbnailItems.push({
        type: 'image',
        url: img.imageUrl,
        alt: img.altText ?? 'Ảnh sản phẩm',
        key: img.imageUrl,
      });
    }
  });

  return (
    <div>
      <div className="relative w-full aspect-[1/1] mb-4">
        {mainMedia.type === 'image' ? (
          <img
            src={mainMedia.url}
            alt="Ảnh sản phẩm chính"
            className="w-full h-full object-cover rounded-md"
            loading="lazy"
          />
        ) : (
          <video
            src={mainMedia.url}
            controls
            muted // Tắt âm thanh mặc định
            className="w-full h-full object-cover rounded-md"
          />
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {thumbnailItems.map((item) => (
          <div
            key={item.key}
            className="relative w-20 h-20 cursor-pointer hover:opacity-80"
            onClick={() =>
              item.type === 'video'
                ? handleVideoThumbnailClick()
                : handleThumbnailClick(item.url)
            }
          >
            {item.type === 'video' ? (
              <video
                src={item.url}
                className="w-full h-full object-cover rounded-md"
                muted
                preload="metadata"
              />
            ) : (
              <img
                src={item.url}
                alt={item.alt}
                className="w-full h-full object-cover rounded-md"
                loading="lazy"
              />
            )}
            {item.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1.5.866v4.268A1 1 0 008 13h4a1 1 0 001-1V7.866A1 1 0 0012 7H8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      {!thumbnailItems.length && (
        <p className="text-gray-500 text-sm">Không có hình ảnh hoặc video sản phẩm.</p>
      )}
    </div>
  );
};

export default memo(ProductImages);
