export interface ItemType {
    id: number;
    name: string;
    parent_id: number | null;
    children?: ItemType[];
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

export interface Specification {
    name: string;
    value: string;
}

export interface AttributeValue {
    attributeName: string;
    value: string;
}

export interface Attribute {
    id: number;
    name: string;
    typesValue: 'STRING' | 'NUMBER' | 'ALL';
    values: AttributeValue[];
}

export interface ProductVariant {
    id: number;
    combination: AttributeValue[];
    price: number;
    stock: number;
    sku: string;
    image: { file: File | null; url: string } | null;
    altText: string;
    isActive: boolean;
    isSelected: boolean;
}

export interface Addon {
    id: number;
    name: string;
    priceAdjust: number;
    active: boolean;
}

export interface AddonGroup {
    id: number;
    name: string;
    maxChoice: number;
    addons: Addon[];
}

export interface DefaultValues {
    price: number;
    stock: number;
}

export interface DescriptionItem {
    type: string;
    url?: string;
    content?: string;
}

export interface ProductDetailCreateDto {
    attributeValue: {
        attributeName: string;
        value: string;
        typesValue?: 'STRING' | 'NUMBER' | 'ALL';
    };
}

export interface AddonCreateDto {
    name: string;
    priceAdjust: number;
    active: boolean;
}

export interface AddonGroupCreateDto {
    name: string;
    maxChoice: number;
    addons: AddonCreateDto[];
}

export interface SpecificationValueCreateDto {
    specificationName: string;
    value: string;
}

export interface ProductImageCreateDto {
    imageUrl: string;
    altText: string;
    isThumbnail: boolean;
}

export interface ProductVariantCreateDto {
    sku: string;
    price: number;
    stockQuantity: number;
    isActive: boolean;
    imageUrl: string;
    altText: string;
    productDetails: ProductDetailCreateDto[];
}

export interface ProductCreateDto {
    name: string;
    slug: string;
    description: string;
    thumbnailUrl: string;
    videoUrl: string;
    storeId: number;
    itemTypeId: number;
    isActive: boolean;
    variants: ProductVariantCreateDto[];
    addonGroups: AddonGroupCreateDto[];
    specifications: SpecificationValueCreateDto[];
    images: ProductImageCreateDto[];
}

export interface ProductResponse {
    id: number;
    name: string;
    itemTypeId: number;
    itemTypeName: string;
    description: string;
    specifications: { specificationName: string; value: string }[];
    images: { id: number; url: string }[];
    variants: {
        id: number;
        sku: string;
        price: number;
        stockQuantity: number;
        imageUrl?: string;
        isActive: boolean;
        productDetails: { attributeName: string; value: string; attributeValueId: number; typesValue: 'STRING' | 'NUMBER' | 'ALL' }[];
    }[];
    addonGroups: {
        id: number;
        name: string;
        addons: { id: number; name: string; price: number; isActive: boolean }[];
    }[];
}

export interface ProductCreatedResponse {
    id: number; // Đồng bộ với ProductResponse
    name: string;
    thumbnailUrl: string;
    videoUrls: string[];
    storeId: string;
    isActive: boolean;
}