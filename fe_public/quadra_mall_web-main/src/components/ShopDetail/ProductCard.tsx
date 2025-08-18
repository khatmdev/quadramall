import React from 'react';
import { IoHeartCircle } from 'react-icons/io5';
import { ProductDto } from '@/types/store_detail/interfaces';
import {useNavigate} from "react-router-dom";

interface ProductCardProps {
  product: ProductDto;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Hàm format giá VND
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const navigate = useNavigate();
  const toProductDetail = (slug : string) => {
    navigate(`/products/${slug}`);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden relative">
      {/* Heart icon góc trên phải */}
      <IoHeartCircle
        className={`absolute top-2 right-2 cursor-pointer z-10 ${product.isFav ? 'text-red-500' : 'text-white'} hover:text-red-400 drop-shadow-sm`}
        size={20}
        title={product.isFav ? 'Unfavorite' : 'Favorite'}
      />

      {/* Product image - Square aspect ratio */}
      <div className="aspect-square bg-gray-100 overflow-hidden relative mx-4 mt-3 rounded-lg">
        <img
          src={product.thumbnailUrl}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/300'; // Fallback image
          }}
          onClick={() => toProductDetail(product.slug)}
        />
      </div>

      {/* Product details */}
      <div className="p-3 flex-1 flex flex-col">
        {/* Tên sản phẩm */}
        <h3 className="font-medium text-sm line-clamp-2 leading-5 text-gray-900 mb-2 min-h-[2.5rem] cursor-pointer" onClick={() => toProductDetail(product.slug)}>{product.name}</h3>

        {/* Giá */}
        <div className="text-green-600 font-bold text-lg mb-2">{formatPrice(product.price)}</div>

        {/* Đánh giá và đã bán */}
        <div className="flex items-center gap-1 text-xs text-gray-600 mt-auto">
          <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="font-medium">{product.rating.toFixed(1)}</span>
          <span className="mx-1">·</span>
          <span>{product.soldCount.toLocaleString()} Đã bán</span>
        </div>
      </div>
    </div>
  );
};

// Component sử dụng ProductCard với grid layout
interface ProductListProps {
  products: ProductDto[];
}

export const ProductList: React.FC<ProductListProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductCard;
