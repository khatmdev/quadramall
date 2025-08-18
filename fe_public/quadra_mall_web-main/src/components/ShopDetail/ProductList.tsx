import React from 'react';
import ProductCard from '@/components/ShopDetail/ProductCard';
import { sortProducts } from '@/utils/productSort';
import { ProductDto } from '@/types/store_detail/interfaces';

interface ProductListProps {
    products: ProductDto[];
    sort: string;
    isLoading: boolean;
}

const ProductList: React.FC<ProductListProps> = ({ products, sort, isLoading }) => {
    // Chỉ áp dụng sortProducts khi không gọi API /products (mặc định)
    const sortedProducts = React.useMemo(() => sortProducts(products, sort), [products, sort]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm transition-opacity duration-300">
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50 transition-opacity duration-300">
                    {Array(6).fill(0).map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="h-48 bg-gray-200 rounded-md" />
                            <div className="mt-2 h-4 bg-gray-200 rounded w-3/4" />
                            <div className="mt-1 h-4 bg-gray-200 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-100 transition-opacity duration-300">
                    {sortedProducts.length > 0 ? (
                        sortedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <div className="col-span-full text-center text-gray-500">
                            Không có sản phẩm nào
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductList;
