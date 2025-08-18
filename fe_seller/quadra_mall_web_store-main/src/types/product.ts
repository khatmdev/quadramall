export interface Product {
    id: number;
    name: string;
    slug: string;
    image: string;
    totalStock: number;
    itemType: string;
    minPrice: number;
    maxPrice: number;
    status: boolean;
}

export interface ImageFile {
    id: number | null;
    file: File | null;
    url: string;
}
export interface VideoFile {
    id: number | null;
    file: File | null;
    url: string;
}