export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    parentId: number | null;
    children: Category[];
    totalCategories: number;
    totalProducts: number;
    totalProductsWithCategory: number;
    isExpanded?: boolean;
}

export interface CategoryDetailData {
    id: number;
    name: string;
    totalProductsWithCategory: number;
    products: Product[];
    uncategorizedProducts: Product[];
}

export interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    categoryId: number | null;
}

export interface CreateCategoryRequest {
    name: string;
    description?: string;
    parentId?: number;
    storeId: number;
}

export interface UpdateCategoryRequest {
    name?: string;
    slug?: string;
    description?: string;
    parentId?: number | null;
}