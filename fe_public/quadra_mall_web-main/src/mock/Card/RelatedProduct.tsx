import React from 'react';
import ProductCard from '../../components/Card/ProductCart';

const RelatedProducts: React.FC = () => { 
  const relatedProducts = [
    {
      id: 1,
      name: 'Basic Yellow T-Shirt',
      price: 24.99,
      image: '/images/yellow-tshirt.jpg',
      rating: 4.5,
      reviewCount: 12
    },
    {
      id: 2,
      name: 'Green Utility Jacket',
      price: 89.99,
      image: '/images/green-jacket.jpg',
      rating: 4.2,
      reviewCount: 8
    },
    {
      id: 3,
      name: 'iPhone 13 Pro Max',
      price: 1099.99,
      image: '/images/iphone.jpg',
      rating: 4.8,
      reviewCount: 36
    },
    {
      id: 4,
      name: 'Purple Winter Sweater',
      price: 64.99,
      image: '/images/purple-sweater.jpg',
      rating: 4.3,
      reviewCount: 15
    }
  ];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Related Products</h2>
        <button className="text-sm text-green-600 hover:text-green-700">View All</button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;