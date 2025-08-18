export interface ItemType {
    id: number; // Bắt buộc vì backend luôn trả id
    name: string;
    slug: string;
    description?: string;
    iconUrl?: string;
    isActive: boolean;
    parent?: ItemType;
    children?: ItemType[];
}

export type CreateItemTypePayload = {
    name: string;
    description?: string;
    iconUrl?: string;
    isActive: boolean;
    parent?: { id: number };
};