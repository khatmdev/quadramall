// src/hooks/useHome.ts
import {
  getActiveBanners,
  getIntroBanner,
  getItemTypes,
  getStores,
  getHomeProducts,
  getFlashSaleProducts,
} from "@/api/home/homeService";
import { useApiQuery } from "./useApiQuery";

export const useHome = () => {
  return {
    banners: useApiQuery({
      queryKey: ["banners"],
      queryFn: getActiveBanners,
      staleTime: 5 * 60 * 1000,
    }),
    introBanner: useApiQuery({
      queryKey: ["introBanner"],
      queryFn: getIntroBanner,
      staleTime: 5 * 60 * 1000,
    }),
    itemTypes: useApiQuery({
      queryKey: ["itemTypes"],
      queryFn: getItemTypes,
      staleTime: 5 * 60 * 1000,
    }),
    stores: useApiQuery({
      queryKey: ["stores"],
      queryFn: getStores,
      staleTime: 5 * 60 * 1000,
    }),
    flashSaleProducts: useApiQuery({
      queryKey: ["flashSaleProducts", 0, 5], // Default page=0, size=5 (theo HomeController)
      queryFn: () => getFlashSaleProducts(0, 5),
      staleTime: 5 * 60 * 1000, // 5 phút
    }),
  };
};
