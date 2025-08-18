import React, { useState } from "react";
import { usePaginatedHomeProducts } from "@/hooks/usePaginatedHomeProducts";
import { ProductCardDTO } from "@/types/home/product";
import { formatProvinceName } from "@/utils/formatProvinceName";

export const TodaysProducts = () => {
  const [page, setPage] = useState(0);
  const { data, isLoading, isError } = usePaginatedHomeProducts(page, 10);
  const products = data || [];
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  const [favorites, setFavorites] = useState<{ [key: number]: boolean }>(
    products.reduce((acc, p) => ({ ...acc, [p.id]: p.isFav }), {})
  );

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleViewDetail = (slug: string) => {
    window.open(`/products/${slug}`, "_blank");
  };

  const handleViewStore = (slug: string) => {
    window.open(`/storeDetails/${slug}`, "_blank");
  };

  if (isLoading) return <div className="px-6 py-8">Đang tải sản phẩm...</div>;
  if (isError)
    return <div className="px-6 py-8 text-red-500">Lỗi khi tải sản phẩm</div>;

  return (
    <section className="py-8 bg-white">
      <div className="flex justify-between items-center px-6 mb-6">
        <h2 className="text-2xl font-bold text-[#14532D]">Sản phẩm nổi bật</h2>
        <a
          href={`/product/today?page=${page + 1}`}
          className="text-base text-green-600 font-medium hover:underline"
        >
          Xem thêm
        </a>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 px-6">
        {products.map((p: ProductCardDTO) => {

          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div
                className="relative"
                onMouseEnter={() => setHoveredProduct(p.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <a
                  href={`/products/${p.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleViewDetail(p.slug);
                  }}
                >
                  <img
                    src={p.thumbnailUrl}
                    alt={p.name}
                    className="w-full h-48 object-cover"
                  />
                </a>
                {hoveredProduct === p.id && (
                  <div
                    className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer"
                    onClick={() => handleViewDetail(p.slug)}
                  >
                    <span className="text-white font-semibold text-lg">
                      Xem chi tiết
                    </span>
                  </div>
                )}
                <button
                  onClick={() => toggleFavorite(p.id)}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-green-50 transition"
                >
                  <svg
                    className={`w-5 h-5 ${
                      favorites[p.id]
                        ? "text-green-500 fill-current"
                        : "text-gray-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-4 relative">
                <h3 className="text-base font-semibold line-clamp-2 h-12 text-gray-800">
                  {p.name}
                </h3>
                <p className="text-green-500 font-bold text-lg">
                  {p.price.toLocaleString()}₫
                </p>
                <a
                  href={`/storeDetails/${p.seller.slug}`}
                  className="text-sm text-gray-500 hover:text-green-500"
                  onClick={(e) => {
                    e.preventDefault();
                    handleViewStore(p.seller.slug);
                  }}
                >
                  {p.seller.name}
                </a>
                <p className="text-sm text-gray-600 mt-1">
                  ★ {p.rating} · Đã bán {p.soldCount}
                </p>
                <p className="text-xs text-gray-500 absolute bottom-1 right-1 italic">
                  {formatProvinceName(p.seller.province)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
