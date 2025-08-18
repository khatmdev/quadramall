export interface ProductUpdateDto {
    id: number;
    name: string;
    slug: string;
    thumbnailUrl: string;
    videoUrl?: string;
    description: string;
    storeId: number;
    itemTypeId: number;
    variants: ProductVariantUpdateDto[];
    addonGroups: AddonGroupUpdateDto[];
    specifications: SpecificationValueUpdateDto[];
    images: ProductImageUpdateDto[];
}

export interface ProductVariantUpdateDto {
    id?: number;
    sku: string;
    price: number;
    stockQuantity: number;
    isActive: boolean;
    imageUrl?: string;
    altText?: string;
    productDetails: ProductDetailUpdateDto[];
}

export interface ProductDetailUpdateDto {
    attributeValue: AttributeValueUpdateDto;
}

export interface AttributeValueUpdateDto {
    attributeName: string;
    value: string;
    typesValue?: string;
}

export interface AddonGroupUpdateDto {
    id?: number;
    name: string;
    maxChoice: number;
    addons: AddonUpdateDto[];
}

export interface AddonUpdateDto {
    id?: number;
    name: string;
    priceAdjust: number;
    active: boolean;
}

export interface SpecificationValueUpdateDto {
    id?: number;
    specificationName: string;
    value: string;
}

export interface ProductImageUpdateDto {
    id: number | null;
    imageUrl: string;
    altText?: string;
    isThumbnail?: boolean;
}