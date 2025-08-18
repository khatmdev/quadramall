import React from 'react';
import { IoHeartCircle } from "react-icons/io5";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    version?: string; 
    price: number;
    image: string;
    rating: number;
    sold: number; 
    location?: string;
    isFav?: boolean;
  };
  onToggleFavorite?: (productId: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onToggleFavorite }) => {
  return (
    <div className="relative bg-white rounded-lg shadow-sm hover:shadow-md transition min-w-[220px] max-w-full flex flex-col m-2">
      {/* Heart icon góc trên phải - màu đỏ nếu là yêu thích */}
      <IoHeartCircle 
        className={`absolute top-2 right-2 cursor-pointer hover:scale-110 transition-transform ${
          product.isFav ? 'text-red-500' : 'text-gray-300 hover:text-gray-400'
        }`}
        size={24} 
        title={product.isFav ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
        onClick={() => onToggleFavorite?.(product.id)}
      />

      {/* Product image */}
      <div className="h-40 rounded-t-lg bg-gray-100 overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
      </div>

      {/* Product details */}
      <div className="p-4 flex-1">
        {/* Tên và giá */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-base leading-5 text-black">{product.name}</h3>
            {product.version && (
              <div className="font-semibold text-base leading-5 text-black">{product.version}</div>
            )}
          </div>
          <div className="text-green-600 font-semibold text-lg ml-2 mt-1">${product.price}</div>
        </div>
        {/* Địa chỉ */}
        {product.location && (
          <div className="text-xs text-gray-400 mt-1">{product.location}</div>
        )}
        {/* Đánh giá và đã bán */}
        <div className="flex items-center mt-3 gap-1">
          <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">{product.rating.toFixed(1)}</span>
          <span className="mx-1 text-gray-400">·</span>
          <span className="text-sm text-gray-700">{product.sold.toLocaleString()} Sold</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
