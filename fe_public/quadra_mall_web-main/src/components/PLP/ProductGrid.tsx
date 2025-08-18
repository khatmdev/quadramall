import React, { useState } from "react";
import { ProductCardDTO } from "@/types/home/product";
import { formatProvinceName } from "@/utils/formatProvinceName";

interface ProductGridProps {
  products: ProductCardDTO[];
  favorites: { [key: number]: boolean };
  toggleFavorite: (id: number) => void;
}

const ProductGrid: React.FC<ProductGridProps> = React.memo(
  ({ products, favorites, toggleFavorite }) => {
    const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 px-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            onMouseEnter={() => setHoveredProduct(p.id)}
            onMouseLeave={() => setHoveredProduct(null)}
          >
            <div className="relative">
              <a
                href={`/products/${p.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  window.open(`/products/${p.slug}`, "_blank");
                }}
              >
                <img
                  src={p.thumbnailUrl}
                  alt={p.name}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
              </a>
              {hoveredProduct === p.id && (
                <div
                  className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer"
                  onClick={() => window.open(`/products/${p.slug}`, "_blank")}
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
                    favorites[p.id] ? "text-green-500 fill-current" : "text-gray-400"
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
                href={`/shopdetail/${p.seller.slug}`}
                className="text-sm text-gray-500 hover:text-green-500"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(`/shopdetail/${p.seller.slug}`, "_blank");
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
        ))}
      </div>
    );
  }
);

export default ProductGrid;
