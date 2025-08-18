export interface Category {
    id: number;
    store_id: number;
    item_type_id: number;
    name: string;
    slug: string;
    description: string;
    parent_id: number | null;
    created_at: string;
    updated_at: string;
    itemCount?: number;
}

export interface ItemType {
    id: number;
    name: string;
    slug: string;
}