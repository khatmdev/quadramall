// src/hooks/usePaginatedHomeProducts.ts
import { getHomeProducts } from '@/api/home/homeService';
import { useApiQuery } from './useApiQuery';
import { keepPreviousData } from '@tanstack/react-query';

export const usePaginatedHomeProducts = (page: number, size: number = 10) => {
  return useApiQuery({
    queryKey: ['home-products', page, size],
    queryFn: () => getHomeProducts(page, size),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData, // quan trọng
  });
};
