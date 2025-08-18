import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "@/api/config/apiClient";
import apiBuyer from "@/api/config/apiBuyer";
import { ProductCardDTO } from "@/types/home/product";
import { toast } from "react-toastify";
import useRequireAuth from "@/hooks/security/useRequireAuth";
import { useSearch } from "../context/SearchContext";
import SidebarFilter from "./SidebarFilter";
import ProductGrid from "./ProductGrid";
import Pagination from "./Pagination";
import SortBar from "./SortBar";
import FeaturedStoresSlider from "./FeaturedStoresSlider";
import LoginPrompt from "./LoginPrompt";
import NoProductsFound from "./NoProductsFound";

const ProductListingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuery } = useSearch();
  const { user, requireAuth } = useRequireAuth();

  const [products, setProducts] = useState<ProductCardDTO[]>([]);
  const [favorites, setFavorites] = useState<{ [key: number]: boolean }>({});
  const [itemTypes, setItemTypes] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [featuredStores, setFeaturedStores] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const keyword = searchQuery || queryParams.get("q") || "";
  const itemTypeId = queryParams.get("itemTypeId") || "";
  const sortBy = queryParams.get("sortBy") || "newest";
  const province = queryParams.get("province") || "";
  const page = parseInt(queryParams.get("page") || "1");
  const size = 20;

  // ✅ Khi mount, lấy giá trị từ query (không cần useEffect phức tạp)
  useEffect(() => {
    setPriceMin(queryParams.get("priceMin") || "");
    setPriceMax(queryParams.get("priceMax") || "");
  }, [location.search]);

  // ✅ Hàm cập nhật query đơn giản
  const updateQuery = (updates: Record<string, string | null>) => {
    const query = new URLSearchParams(location.search);
    for (const key in updates) {
      const val = updates[key];
      if (!val) query.delete(key);
      else query.set(key, val);
    }
    query.set("page", "1");
    navigate({ search: query.toString() });
  };

  // ✅ Update cho filter (rating, province, itemType, sort)
  const handleFilterChange = (filterName: string, value: string) => {
    updateQuery({ [filterName]: value });
  };

  // ✅ Update cho giá khi bấm Áp dụng
  const handleApplyPrice = (min: string, max: string) => {
    updateQuery({ priceMin: min || null, priceMax: max || null });
  };

  const handleSortChange = (val: string) => {
    updateQuery({ sortBy: val });
  };

  const handlePageChange = (p: number) => {
    updateQuery({ page: p.toString() });
  };

  // ✅ Toggle yêu thích
  const toggleFavorite = async (id: number) => {
    if (!requireAuth("Hãy đăng nhập để thêm vào mục yêu thích.")) return;
    try {
      const isFav = favorites[id];
      if (isFav) {
        await apiBuyer.delete(`/favorites/${id}`);
        toast.success("Đã xóa khỏi yêu thích");
      } else {
        await apiBuyer.post(`/favorites`, { productId: id });
        toast.success("Đã thêm vào yêu thích");
      }
      setFavorites((prev) => ({ ...prev, [id]: !isFav }));
    } catch {
      toast.error("Không thể thay đổi trạng thái yêu thích");
    }
  };

  // ✅ Fetch dữ liệu
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [prod, cats, provs, stores] = await Promise.all([
        apiClient.get("/search/products", {
          params: {
            keyword,
            itemTypeId,
            sortBy,
            province,
            priceMin,
            priceMax,
            page,
            size,
          },
        }),
        apiClient.get("/search/item-types-tree"),
        apiClient.get("/search/filters/provinces"),
        apiClient.get("/search/featured-stores", { params: { itemTypeId } }),
      ]);
      const content = prod.data.data.content || [];
      setProducts(content);
      setItemTypes(cats.data.data);
      setProvinces(provs.data.data);
      setFeaturedStores(stores.data.data);
      setTotalPages(prod.data.totalPages || 1);
      setCurrentPage(page);

      const newFavs = content.reduce((acc: any, p: ProductCardDTO) => {
        acc[p.id] = favorites[p.id] ?? p.isFav ?? false;
        return acc;
      }, {});
      setFavorites(newFavs);
    } catch {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  }, [keyword, itemTypeId, sortBy, province, priceMin, priceMax, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="container mx-auto p-4">
      {isLoading && <div className="text-center py-4">Đang tải...</div>}
      {featuredStores.length > 0 && (
        <div className="mb-6">
          <FeaturedStoresSlider
            stores={featuredStores}
            onViewStore={(slug) =>
              window.open(`/shopdetail/${slug}`, "_blank")
            }
          />
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-4">
        <SidebarFilter
          itemTypes={itemTypes}
          provinces={provinces}
          onFilterChange={handleFilterChange}
          onApplyPrice={handleApplyPrice}
          initialPriceMin={priceMin}
          initialPriceMax={priceMax}
          selectedItemTypeId={itemTypeId}
        />

        <div className="flex-1">
          <SortBar onSortChange={handleSortChange} />
          {products.length > 0 ? (
            <>
              <ProductGrid
                products={products}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <NoProductsFound />
          )}
          {!user && products.length > 60 && <LoginPrompt />}
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;
