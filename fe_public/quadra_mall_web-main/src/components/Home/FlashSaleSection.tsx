import { useFlashSaleProducts } from "@/hooks/useFlashSaleProducts";
import { useHome } from "@/hooks/useHome";
import { FlashSaleProductDTO } from "@/types/home/flashSale";
import { useEffect, useState } from "react";
import { FaBolt } from "react-icons/fa";

function formatTime(seconds: number): string {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export const FlashSaleSection = () => {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [remainings, setRemainings] = useState<{ [key: number]: number }>({});

  const { flashSaleProducts } = useHome();
  const { data: flashSaleResponse, isLoading } = flashSaleProducts;
  const products: FlashSaleProductDTO[] = flashSaleResponse?.content || [];

  useEffect(() => {
    if (products.length > 0) {
      const initialRemainings = products.reduce((acc, p) => {
        const endTime = new Date(p.endTimeStr).getTime();
        acc[p.id] = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        return acc;
      }, {} as { [key: number]: number });

      setRemainings(initialRemainings);

      const timer = setInterval(() => {
        setRemainings((prev) => {
          const newRemainings = { ...prev };
          let shouldClear = true;
          for (const id in newRemainings) {
            if (newRemainings[id] > 0) {
              newRemainings[id] = Math.max(0, newRemainings[id] - 1);
              shouldClear = false;
            }
          }
          if (shouldClear) {
            clearInterval(timer);
          }
          return newRemainings;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [products]);

  const handleViewDetail = (slug: string) => {
    window.open(`/products/${slug}`, "_blank");
  };

  if (isLoading) {
    return (
      <section className="bg-green-50 pb-8">
        <div className="bg-green-500 text-white py-4 px-6 mb-6 rounded-lg shadow-md flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-extrabold flex items-center gap-2">
              <FaBolt className="text-yellow-300" /> FLASH SALE
            </h2>
          </div>
          <a
            href="/flash-sale"
            className="text-lg font-bold text-white hover:underline"
          >
            Xem tất cả
          </a>
        </div>
        <div className="flex overflow-x-auto gap-6 px-6 scrollbar-hide">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="w-56 bg-white shadow-lg rounded-2xl overflow-hidden flex-shrink-0 animate-pulse"
            >
              <div className="w-full h-40 bg-gray-200" />
              <div className="p-4">
                <div className="h-12 bg-gray-200 rounded mb-2" />
                <div className="h-6 bg-gray-200 rounded mb-2" />
                <div className="h-2 bg-gray-200 rounded mb-1" />
                <div className="h-3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-green-50 pb-8">
      <div className="bg-green-500 text-white py-4 px-6 mb-6 rounded-lg shadow-md flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-extrabold flex items-center gap-2">
            <FaBolt className="text-yellow-300" /> FLASH SALE
          </h2>
        </div>
        <a
          href="/flash-sale"
          className="text-lg font-bold text-white hover:underline"
        >
          Xem tất cả
        </a>
      </div>
      <div className="flex overflow-x-auto gap-6 px-6 scrollbar-hide">
        {products.map((p) => {
          const discountPercent = p.percentageDiscount;
          const remaining = remainings[p.id] || 0;
          const soldPercent =
            p.quantity > 0
              ? Math.min(100, (p.soldCount / p.quantity) * 100)
              : 0;
          const isLowStock = soldPercent > 80;
          return (
            <div
              key={p.id}
              className="w-56 bg-white shadow-lg rounded-2xl overflow-hidden flex-shrink-0 hover:shadow-xl transition-shadow duration-300"
            >
              <div
                className="relative"
                onMouseEnter={() => setHoveredProduct(p.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <a href={`/products/${p.slug}`} onClick={(e) => { e.preventDefault(); handleViewDetail(p.slug); }}>
                  <img
                    src={p.thumbnailUrl}
                    alt={p.name}
                    className="w-full h-40 object-cover"
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
                <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-br-lg">
                  -{discountPercent}%
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-base font-semibold line-clamp-2 h-12 text-gray-800">
                  {p.name}
                </h3>
                <p className="text-green-500 font-bold text-lg">
                  {p.price.toLocaleString()}₫
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-400 line-through">
                    {p.originPrice.toLocaleString()}₫
                  </p>
                  <span className="text-xs bg-green-100 text-green-600 font-semibold px-1 rounded">
                    {discountPercent}% Giảm
                  </span>
                </div>
                <div className="mt-2">
                  <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500 h-full"
                      style={{ width: `${soldPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Đã bán {p.soldCount} / {p.quantity}
                  </p>
                </div>
                {isLowStock && (
                  <p className="text-xs text-red-500 font-bold mt-1">
                    Sắp cháy hàng!
                  </p>
                )}
                <div className="flex justify-between items-center mt-1">
                  <a
                    href={`/shopdetail/${p.seller.slug}`}
                    className="text-xs font-semibold text-gray-500 hover:text-green-500"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(`/shopdetail/${p.seller.slug}`, "_blank");
                    }}
                  >
                    {p.seller.name}
                  </a>
                  <p className="text-xs text-gray-500">{p.seller.province}</p>
                </div>
                {remaining > 0 && (
                  <p className="text-xs text-red-500 font-bold mt-1">
                    Kết thúc sau {formatTime(remaining)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
