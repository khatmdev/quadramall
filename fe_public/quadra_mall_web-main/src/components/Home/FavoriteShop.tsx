import { useHome } from '@/hooks/useHome';
import { useNavigate } from 'react-router-dom';

export const FavoriteShops = () => {
  const { stores } = useHome();
  const navigate = useNavigate();

  if (stores.isLoading) {
    return (
      <section className="py-8 bg-white px-6">
        <h2 className="text-2xl font-bold mb-6 text-[#14532D]">Các shop yêu thích</h2>
        <p>Đang tải dữ liệu...</p>
      </section>
    );
  }

  const handleClickOutside = (slug: string) => {
    navigate(`/shopdetail/${slug}`);
  }

  const shopList = stores.data || [];

  return (
    <section className="py-8 bg-white">
      <h2 className="text-2xl font-bold mb-6 px-6 text-[#14532D]">Các shop được yêu thích</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 px-6">
        {shopList.map(shop => (
          <div
            key={shop.id}
            className="flex flex-col items-center text-center p-6 bg-white shadow-lg rounded-2xl border border-green-100 hover:shadow-xl transition-shadow duration-300"
          >
            <img
              src={shop.logoUrl}
              alt={shop.name}
              className="w-20 h-20 rounded-full object-cover mb-3 shadow-md cursor-pointer"
              onClick={() => handleClickOutside(shop.slug)}
            />
            <h3 className="text-base font-semibold text-gray-800">{shop.name}</h3>
            <p className="text-sm text-yellow-500 font-medium">★ {shop.rating.toFixed(1)}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

