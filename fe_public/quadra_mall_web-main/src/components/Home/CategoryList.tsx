// src/components/home/CategoryList.tsx
import { useHome } from '@/hooks/useHome';
import { useNavigate } from 'react-router-dom';

export const CategoryList = () => {
  const { itemTypes } = useHome();
  const { data: categories, isLoading, isError } = itemTypes;
  const navigate = useNavigate();

  const handleCategoryClick = (id: number) => {
    navigate(`/search?itemTypeId=${id}`); // ✅ Chỉ truyền itemTypeId
  };

  return (
    <section className="py-8 bg-white">
      <h2 className="text-2xl font-bold mb-6 px-6 text-[#14532D]">Danh mục ngành hàng</h2>

      {isLoading && (
        <div className="px-6 text-gray-500">Đang tải danh mục...</div>
      )}

      {isError && (
        <div className="px-6 text-red-500">Không thể tải danh mục.</div>
      )}

      {!isLoading && categories && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 px-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="flex flex-col items-center p-4 rounded-2xl hover:bg-green-50 transition duration-300 cursor-pointer"
            >
              <img
                src={cat.iconUrl}
                alt={cat.name}
                className="w-20 h-20 object-contain mb-3"
              />
              <span className="text-base font-medium text-gray-800 text-center">{cat.name}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

