import React from 'react';
import { RelatedProduct } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface RelatedProductsProps {
    relatedProducts: RelatedProduct[];
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ relatedProducts }) => {
    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4 shadow-md">
                        <img
                            src={product.thumbnail_url}
                            alt={product.name}
                            className="w-full h-40 object-cover rounded-md mb-2"
                        />
                        <h3 className="text-sm font-semibold">{product.name}</h3>
                        <p className="text-sm text-primary">
                            {product.base_price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </p>
                        <p className="text-xs text-gray-500">Đã bán: {product.sold_count}</p>
                        <Link to={`/product/${product.id}`}>
                            <Button variant="outline" size="sm" className="mt-2 w-full">
                                Xem chi tiết
                            </Button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;