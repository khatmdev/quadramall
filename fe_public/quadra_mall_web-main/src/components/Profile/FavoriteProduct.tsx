// pages/account/FavoriteProducts.tsx
import React, { useEffect, useState } from 'react';
import ProductCard from '../../model/ProductCard';
import { api } from '@/main';
import Swal from 'sweetalert2';

interface FavoriteProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  sold: number;
  description?: string;
  slug?: string;
  shop?: string;
  isFav?: boolean;
}

const FavoriteProducts: React.FC = () => {
  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleToggleFavorite = async (productId: number) => {
    const result = await Swal.fire({
      title: 'Bỏ yêu thích?',
      text: 'Bạn có chắc chắn muốn bỏ sản phẩm này khỏi danh sách yêu thích?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Bỏ yêu thích',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/favorites/${productId}`);
        setFavoriteProducts((prev) => prev.filter((p) => p.id !== productId));
        Swal.fire({
          icon: 'success',
          title: 'Đã bỏ yêu thích!',
          text: 'Sản phẩm đã được xóa khỏi danh sách yêu thích',
          confirmButtonColor: '#3b82f6'
        });
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi xóa khỏi yêu thích!';
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: errorMessage,
          confirmButtonColor: '#3b82f6'
        });
      }
    }
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await api.get('/favorites');
        const rawData = response.data?.data || response.data || [];
        
        const products = rawData.map((item: FavoriteProduct & { seller?: { name?: string }; thumbnailUrl?: string; soldCount?: number }) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.thumbnailUrl ?? '',
          rating: item.rating,
          sold: item.soldCount,
          description: item.description,
          slug: item.slug,
          shop: item.seller?.name ?? '',
          isFav: true,
        }));
        setFavoriteProducts(products);
      } catch {
        setError('Không thể tải danh sách sản phẩm yêu thích');
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-xl p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Sản phẩm yêu thích</h2>
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {favoriteProducts.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500">Bạn chưa có sản phẩm yêu thích nào.</div>
          ) : (
            favoriteProducts.map((product) => (
              <div key={product.id}>
                <ProductCard 
                  product={product} 
                  onToggleFavorite={handleToggleFavorite}
                />
                {product.shop && (
                  <div className="mt-2 text-sm text-gray-500">Shop: {product.shop}</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FavoriteProducts;

