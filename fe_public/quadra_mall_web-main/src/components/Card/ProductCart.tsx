import React from 'react';
import { IoHeartCircle } from "react-icons/io5";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    rating: number;
    reviewCount: number;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const renderStars = () => {
    return (
      <svg 
        className="w-6 h-6 text-yellow-400" 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  };

  return (
    <div className="relative bg-white rounded-lg shadow-sm hover:shadow-md transition">
      {/* Heart icon góc trên phải */}
      <IoHeartCircle 
        className="absolute top-2 right-2 text-gray-300 cursor-pointer hover:text-gray-400" 
        size={24} 
        title="Favorite" 
      />

      {/* Product image */}
      <div className="h-40 rounded-t-lg bg-gray-100 overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
      </div>

      {/* Product details */}
      <div className="p-5">
        <h3 className="font-medium text-sm truncate">{product.name}</h3>
        <p className="text-green-600 font-semibold mt-1">${product.price.toFixed(2)}</p>

        {/* Ratings */}
        <div className="flex items-center mt-2">
          <div className="flex">{renderStars()}</div>
          <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
