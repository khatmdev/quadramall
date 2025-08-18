import React from 'react';
import Card from '../components/Home/Card';

interface Product {
  image: string;
  name: string;
  category: string;
  price: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { image, name, category, price } = product;

  return (
    <Card className="transition-transform hover:translate-y-[-8px]">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-500 mb-1">{category}</p>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{name}</h3>
        <p className="font-semibold text-gray-900">${price}</p>
      </div>
    </Card>
  );
};

export default ProductCard;
