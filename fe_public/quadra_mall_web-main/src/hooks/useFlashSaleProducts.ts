import { getFlashSaleProducts } from "@/api/home/homeService";
import { useApiQuery } from "./useApiQuery";
import { ApiResponse } from "@/types/api";
import { FlashSaleProductDTO } from "@/types/home/flashSale";

export const useFlashSaleProducts = (page = 0, size = 10) => {
  return useApiQuery<ApiResponse<{ content: FlashSaleProductDTO[]; totalElements: number; }>>({  // Type mới
    queryKey: ['flashSaleProducts', page, size],
    queryFn: () => getFlashSaleProducts(page, size),
    staleTime: 5 * 60 * 1000,
  });
};