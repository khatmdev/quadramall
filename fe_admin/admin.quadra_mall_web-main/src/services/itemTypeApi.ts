import { createApi } from '@/services/axios';
import type {CreateItemTypePayload, ItemType} from '@/types/itemType';
import type { AxiosInstance } from 'axios';

const api: AxiosInstance = createApi();

export const itemTypeApi = {
    getAllActiveItemTypes: async (): Promise<ItemType[]> => {
        const response = await api.get<ItemType[]>('/api/item-types');
        return response.data;
    },

    getItemTypeBySlug: async (slug: string): Promise<ItemType> => {
        const response = await api.get<ItemType>(`/api/item-types/${slug}`);
        return response.data;
    },

    getItemTypesByParentId: async (parentId: number): Promise<ItemType[]> => {
        const response = await api.get<ItemType[]>(`/api/item-types/parent/${parentId}`);
        return response.data;
    },

    createItemType: async (itemType: CreateItemTypePayload): Promise<ItemType> => {
        const response = await api.post<ItemType>('/api/item-types', itemType);
        return response.data;
    },

    updateItemType: async (id: number, itemType: ItemType): Promise<ItemType> => {
        const response = await api.put<ItemType>(`/api/item-types/${id}`, itemType);
        return response.data;
    },

    getAllWithHierarchy: async (): Promise<ItemType[]> => {
        const response = await api.get<ItemType[]>('/api/item-types/hierarchy');
        return response.data;
    },
};