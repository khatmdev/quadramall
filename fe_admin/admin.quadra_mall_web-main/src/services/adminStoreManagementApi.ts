import { createApi } from '@/services/axios'; // Giả định đường dẫn tới createApi
import {
    ApiResponse,
    StoreManagementResponseDto,
} from '@/types/adminStoreManagementTypes';

const api = createApi();

export const getStoreManagementData = async (
    status?: string
): Promise<ApiResponse<StoreManagementResponseDto[]>> => {
    const response = await api.get<ApiResponse<StoreManagementResponseDto[]>>(
        '/admin/stores',
        {
            params: { status },
        }
    );
    return response.data;
};


export const lockUnlockStore = async (
    storeId: number,
    storeStatus: string,
    lockReason?: string
): Promise<ApiResponse<void>> => {
    const response = await api.patch<ApiResponse<void>>(
        `/admin/stores/${storeId}/lock`,
        {
            storeStatus,
            lockReason
        }
    );
    return response.data;
};
