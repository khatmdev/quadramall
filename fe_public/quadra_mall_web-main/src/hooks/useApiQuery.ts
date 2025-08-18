// src/hooks/useApiQuery.ts
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import type { UseQueryOptions, QueryKey } from '@tanstack/react-query';
import type { ApiResponse } from '@/types/api';

type UnwrapApiResponse<T> = T extends ApiResponse<infer D> ? D : never;

export function useApiQuery<T extends ApiResponse<any>>(
  options: Omit<UseQueryOptions<T, Error, UnwrapApiResponse<T>, QueryKey>, 'queryFn'> & {
    queryFn: () => Promise<T>;
  }
) {
  return useQuery<T, Error, UnwrapApiResponse<T>>({
    ...options,
    queryFn: async () => {
      const res = await options.queryFn();
      if (res.status !== 'success') {
        toast.error(`[${res.errorCode || 'ERR'}] ${res.message || 'Lỗi không xác định'}`);
        throw new Error(res.message);
      }
      return res;
    },
    select: (res) => res.data,
  });
}
