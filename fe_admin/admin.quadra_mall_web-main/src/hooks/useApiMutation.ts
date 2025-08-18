// src/hooks/useApiMutation.ts
import { useMutation, useQueryClient, type MutationOptions } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import type { ApiResponse } from '@/types/api';

interface UseApiMutationOptions<TVariables, TData> {
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>;
  onSuccessMessage?: string;
  invalidateQueryKey?: string[]; // hoặc QueryKey
  options?: MutationOptions<ApiResponse<TData>, Error, TVariables>;
}

export function useApiMutation<TVariables = any, TData = any>({
  mutationFn,
  onSuccessMessage,
  invalidateQueryKey,
  options,
}: UseApiMutationOptions<TVariables, TData>) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<TData>, Error, TVariables>({
    mutationFn: async (variables) => {
      const res = await mutationFn(variables);
      if (res.status !== 'success') {
        toast.error(`[${res.errorCode || 'ERR'}] ${res.message || 'Thao tác thất bại'}`);
        throw new Error(res.message);
      }
      return res;
    },
    onSuccess: (res, ...args) => {
      const msg = onSuccessMessage || res.message || 'Thao tác thành công';
      toast.success(msg);
      if (invalidateQueryKey) {
        queryClient.invalidateQueries({ queryKey: invalidateQueryKey });
      }
      options?.onSuccess?.(res, ...args);
    },
    onError: (err, ...args) => {
      toast.error(err.message || 'Lỗi không xác định');
      options?.onError?.(err, ...args);
    },
    ...options,
  });
}
