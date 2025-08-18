export interface ProductEditDto {
    id: number;
    name: string;
    description: string;
    slug: string;
    storeId: number;
    thumbnailUrl?: string;
    videoUrl?: string;
    itemTypeId: number;
    itemTypeName: string;
    isActive: boolean;
    variants: Variant[];
    addonGroups: AddonGroup[];
    specifications: Specification[];
    images: ProductImage[];
}

export interface Variant {
    id: number;
    sku: string;
    price: number;
    stockQuantity: number;
    isActive: boolean;
    imageUrl: string;
    productDetails: ProductDetail[];
}

export interface ProductDetail {
    attributeValueId: number;
    attributeName: string;
    value: string;
    typesValue: 'STRING' | 'NUMBER' | 'ALL';
}

export interface AddonGroup {
    id: number;
    name: string;
    maxChoice: number;
    addons: Addon[];
}

export interface Addon {
    id: number;
    name: string;
    price: number;
    active: boolean;
}

export interface Specification {
    id: number | null;
    specificationId: number;
    specificationName: string;
    value: string;
}

export interface ProductImage {
    id: number;
    url: string;
    altText: string;
}