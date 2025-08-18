// src/hooks/useFlashSale.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  getFlashSales,
  createFlashSale,
  updateFlashSale,
  deleteFlashSale,
  getProductsForStore,
} from '@/services/flashSaleService'; // Import services cập nhật
import type {
  SellerFlashSaleProductDTO,
  CreateFlashSaleDTO,
  UpdateFlashSaleDTO,
  ProductSellerDTO,
} from '@/types/flashSale';

// Helper để extract message từ error (AxiosError)
const getErrorMessage = (error: any): string => {
  return error?.response?.data?.message || error?.message || 'Lỗi không xác định';
};

// Hook cho getFlashSales
export const useGetFlashSales = (page: number = 0, size: number = 10) => {
  return useQuery<SellerFlashSaleProductDTO[]>({
    queryKey: ['flashSales', page, size],
    queryFn: () => getFlashSales(page, size),
  });
};

// Hook cho createFlashSale (mutation)
export const useCreateFlashSale = () => {
  const queryClient = useQueryClient();
  return useMutation<SellerFlashSaleProductDTO, Error, CreateFlashSaleDTO>({
    mutationFn: createFlashSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashSales'] }); // Refresh list
      toast.success('Flash sale đã tạo thành công'); // Optional: success toast
    },
    onError: (error) => {
      console.error('Error creating flash sale:', error);
      toast.error(getErrorMessage(error));
    },
  });
};

// Hook cho updateFlashSale (mutation)
export const useUpdateFlashSale = () => {
  const queryClient = useQueryClient();
  return useMutation<SellerFlashSaleProductDTO, Error, { id: number; data: UpdateFlashSaleDTO }>({
    mutationFn: ({ id, data }) => updateFlashSale(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashSales'] }); // Refresh list
      toast.success('Flash sale đã cập nhật thành công'); // Optional
    },
    onError: (error) => {
      console.error('Error updating flash sale:', error);
      toast.error(getErrorMessage(error));
    },
  });
};

// Hook cho deleteFlashSale (mutation)
export const useDeleteFlashSale = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteFlashSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashSales'] }); // Refresh list
      toast.success('Flash sale đã xóa thành công'); // Optional
    },
    onError: (error) => {
      console.error('Error deleting flash sale:', error);
      toast.error(getErrorMessage(error));
    },
  });
};

// Hook cho getProductsForStore
export const useGetProductsForStore = (page: number = 0, size: number = 10, searchQuery: string = '') => {
  return useQuery<{ data: ProductSellerDTO[]; total: number }>({
    queryKey: ['productsForStore', page, size, searchQuery],
    queryFn: () => getProductsForStore(page, size, searchQuery),
  });
};