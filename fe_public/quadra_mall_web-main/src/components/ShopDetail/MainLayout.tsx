// src/components/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { storeService } from '@/api/storeService';
import { ShopDetailDto, ProductDto, Page } from '@/types/store_detail/interfaces';
import StoreHeader from './StoreHeader';
import VoucherSection from './VoucherSection';
import Filter from './Filter';
import ProductList from './ProductList';
import SidebarCategories from './SideBar';

interface MainLayoutProps {
  shopData: ShopDetailDto;
  storeSlug: string;
  userId?: number;
}

const MainLayout: React.FC<MainLayoutProps> = ({ shopData, storeSlug, userId }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categoryId, setCategoryId] = useState<number | undefined>(
    Number(searchParams.get('categoryId')) || undefined
  );
  const [sort, setSort] = useState<
    'comprehensive' | 'best_selling' | 'newest' | 'price_asc' | 'price_desc'
  >(searchParams.get('sort') as any || 'comprehensive');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 0);
  const [currentProducts, setCurrentProducts] = useState<ProductDto[] | undefined>(
    sort === 'comprehensive' && categoryId === undefined ? shopData.products : undefined
  );
  const [shopState, setShopState] = useState<ShopDetailDto>(shopData); // Quản lý trạng thái shopData

  // Lấy danh sách sản phẩm theo bộ lọc
  const { data: products, isLoading: productsLoading } = useQuery<Page<ProductDto>>({
    queryKey: ['storeProducts', storeSlug, categoryId, sort, page, userId],
    queryFn: () =>
      storeService.getStoreProducts(storeSlug, {
        categoryId,
        sort,
        page,
        size: 20,
        userId,
      }),
    enabled: sort !== 'comprehensive' || categoryId !== undefined,
  });

  // Cập nhật currentProducts khi products thay đổi
  useEffect(() => {
    if (products?.content) {
      setCurrentProducts(products.content);
    } else if (sort === 'comprehensive' && categoryId === undefined) {
      setCurrentProducts(shopData.products);
    }
  }, [products, sort, categoryId, shopData.products]);

  // Cập nhật bộ lọc và URL
  const updateFilters = (
    newFilters: Partial<{
      categoryId?: number | null;
      sort?: 'comprehensive' | 'best_selling' | 'newest' | 'price_asc' | 'price_desc';
      page?: number;
    }>
  ) => {
    const updatedCategoryId = newFilters.categoryId === null ? undefined : newFilters.categoryId !== undefined ? newFilters.categoryId : categoryId;
    setCategoryId(updatedCategoryId);
    setSort(newFilters.sort || sort);
    setPage(newFilters.page ?? page);
    setSearchParams({
      ...(updatedCategoryId !== undefined && {
        categoryId: String(updatedCategoryId),
      }),
      ...(newFilters.sort && { sort: newFilters.sort }),
      ...(newFilters.page !== undefined && { page: String(newFilters.page) }),
    });
  };

  // Callback để cập nhật trạng thái favorite
  const handleToggleFavorite = (isFavorite: boolean) => {
    setShopState((prev) => prev ? { ...prev, favorite: isFavorite } : prev);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-2 md:p-4">
        <div className="w-full mb-4 md:mb-6">
          <StoreHeader storeInfo={shopState} onToggleFavorite={handleToggleFavorite} />
          <VoucherSection discountCodes={shopState.discountCodes} userId={userId} />
        </div>
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <aside className="md:flex-shrink-0 md:block hidden w-full md:w-auto">
            <SidebarCategories
              categories={shopState.categories}
              selectedCategoryId={categoryId}
              onSelectCategory={(id) => updateFilters({ categoryId: id, page: 0 })}
            />
          </aside>
          <main className="flex-1">
            <Filter
              selectedSort={sort}
              onSelectSort={(newSort) => updateFilters({ sort: newSort, page: 0 })}
            />
            <ProductList
              products={currentProducts || []}
              sort={sort}
              isLoading={productsLoading && !currentProducts}
            />
          </main>
          <aside className="block md:hidden mt-4">
            <SidebarCategories
              categories={shopState.categories}
              selectedCategoryId={categoryId}
              onSelectCategory={(id) => updateFilters({ categoryId: id, page: 0 })}
            />
          </aside>
        </div>
        {(sort !== 'comprehensive' || categoryId !== undefined) && products && (
          <div className="mt-6 flex justify-center items-center gap-4">
            <button
              disabled={page === 0}
              onClick={() => updateFilters({ page: page - 1 })}
              className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span>Page {page + 1} of {products.totalPages}</span>
            <button
              disabled={page >= products.totalPages - 1}
              onClick={() => updateFilters({ page: page + 1 })}
              className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
