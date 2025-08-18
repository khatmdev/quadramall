// Định nghĩa các kiểu dữ liệu (interface) cho TypeScript
export interface Store {
    id: number;
    owner_id: number;
    name: string;
    slug: string;
    address: string;
    description: string;
    logo_url: string;
    rating: number;
    product_count: number;
    chat_response_rate: number;
    created_at: string;
    updated_at: string;
}

export interface ItemType {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon_url: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

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
}

export interface Attribute {
    id: number;
    product_id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface AttributeValue {
    id: number;
    attribute_id: number;
    value: string;
    created_at: string;
    updated_at: string;
}

export interface ProductVariant {
    id: number;
    product_id: number;
    sku: string;
    price: number;
    stock_quantity: number;
    created_at: string;
    updated_at: string;
}

export interface VariantAttributeValue {
    variant_id: number;
    attribute_id: number;
    value_id: number;
}

export interface VariantAddon {
    id: number;
    variant_id: number;
    attribute_id: number;
    value_id: number;
    price_adjust: number;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: number;
    store_id: number;
    category_id: number;
    name: string;
    slug: string;
    product_type: string;
    description: string;
    highlights: string[];
    base_price: number;
    stock_quantity: number;
    thumbnail_url: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    rating: number;
    sold_count: number;
}

export interface RelatedProduct {
    id: number;
    name: string;
    base_price: number;
    store_id: number;
    category_id: number;
    description: string;
    stock_quantity: number;
    thumbnail_url: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    rating: number;
    sold_count: number;
}

export interface ProductImage {
    id: number;
    product_id: number;
    image_url: string;
    is_thumbnail: boolean;
    created_at: string;
    updated_at: string;
}

export interface VariantImage {
    id: number;
    variant_id: number;
    image_url: string;
    is_thumbnail: boolean;
}

export interface RatingDistribution {
    rating: number;
    count: number;
    percentage: number;
}

export interface ReviewsData {
    average_rating: number;
    total_reviews: string;
    rating_distribution: RatingDistribution[];
}

export interface Review {
    id: number;
    product_id: number;
    user_id: number;
    user_name: string;
    avatar_url: string;
    rating: number;
    comment: string;
    date: string;
    likes: number;
    has_photos: boolean;
    has_videos: boolean;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar_url: string;
    created_at: string;
    updated_at: string;
}

export interface DiscountCode {
    id: number;
    store_id: number;
    quantity: number;
    max_uses: number;
    used_count: number;
    code: string;
    description: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_amount: number;
    max_discount_value: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Dữ liệu mock
export const mockData = {
    stores: [
        {
            id: 1,
            owner_id: 1,
            name: 'Cửa Hàng Điện Tử ABC',
            slug: 'dien-tu-abc',
            address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
            description: 'Chuyên bán điện thoại và phụ kiện',
            logo_url: 'assets/images/shop_voi_cf_jpg',
            rating: 4.9,
            product_count: 286,
            chat_response_rate: 96,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 2,
            owner_id: 2,
            name: 'Nhà Hàng Gà Rán XYZ',
            slug: 'nha-hang-ga-ran-xyz',
            address: '45 Đường Nguyễn Huệ, Quận 1, TP.HCM',
            description: 'Chuyên cung cấp các món gà rán và cơm Hàn Quốc',
            logo_url: 'assets/images/shop_van_fashion.jpg',
            rating: 4.7,
            product_count: 150,
            chat_response_rate: 90,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 3,
            owner_id: 3,
            name: 'Quán Trà Sữa 123',
            slug: 'quan-tra-sua-123',
            address: '78 Đường Trần Hưng Đạo, Quận 5, TP.HCM',
            description: 'Trà sữa thơm ngon, trân châu dai giòn',
            logo_url: 'assets/images/avata_store_1.jpg',
            rating: 4.8,
            product_count: 200,
            chat_response_rate: 95,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ] as Store[],

    itemTypes: [
        {
            id: 1,
            name: 'Điện tử',
            slug: 'dien-tu',
            description: 'Các sản phẩm điện tử như điện thoại, máy tính bảng',
            icon_url: 'assets/icons/electronics.png',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 2,
            name: 'Thời trang',
            slug: 'thoi-trang',
            description: 'Quần áo, phụ kiện thời trang',
            icon_url: 'assets/icons/clothing.png',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 3,
            name: 'Đồ ăn',
            slug: 'do-an',
            description: 'Các món ăn như cơm gà, gà rán',
            icon_url: 'assets/icons/food.png',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 4,
            name: 'Đồ uống',
            slug: 'do-uong',
            description: 'Trà sữa, cà phê, nước giải khát',
            icon_url: 'assets/icons/beverage.png',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ] as ItemType[],

    categories: [
        {
            id: 1,
            store_id: 1,
            item_type_id: 1,
            name: 'Điện thoại thông minh',
            slug: 'dien-thoai-thong-minh',
            description: 'Danh mục các dòng điện thoại mới nhất',
            parent_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 2,
            store_id: 1,
            item_type_id: 2,
            name: 'Áo thun',
            slug: 'ao-thun',
            description: 'Danh mục áo thun thời trang',
            parent_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 3,
            store_id: 2,
            item_type_id: 3,
            name: 'Cơm gà',
            slug: 'com-ga',
            description: 'Danh mục các món cơm gà',
            parent_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 4,
            store_id: 3,
            item_type_id: 4,
            name: 'Trà sữa',
            slug: 'tra-sua',
            description: 'Danh mục các loại trà sữa',
            parent_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ] as Category[],

    attributes: [
        {
            id: 1,
            product_id: 1,
            name: 'Dung lượng',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 2,
            product_id: 1,
            name: 'Màu sắc',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 3,
            product_id: 2,
            name: 'Kích thước',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 4,
            product_id: 2,
            name: 'Màu sắc',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 5,
            product_id: 3,
            name: 'Kích thước khẩu phần',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 6,
            product_id: 3,
            name: 'Độ cay',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 7,
            product_id: 4,
            name: 'Kích thước',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 8,
            product_id: 4,
            name: 'Hương vị',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 9,
            product_id: 4,
            name: 'Topping',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 10,
            product_id: 5,
            name: 'Kích thước khẩu phần',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 11,
            product_id: 5,
            name: 'Độ cay',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 12,
            product_id: 6,
            name: 'Kích thước',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 13,
            product_id: 6,
            name: 'Hương vị',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 14,
            product_id: 6,
            name: 'Topping',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ] as Attribute[],

    attributeValues: [
        { id: 1, attribute_id: 1, value: '128GB', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 2, attribute_id: 1, value: '256GB', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 3, attribute_id: 1, value: '512GB', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 4, attribute_id: 1, value: '1TB', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 5, attribute_id: 2, value: 'Đen Space Black', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 6, attribute_id: 2, value: 'Bạc Silver', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 7, attribute_id: 2, value: 'Vàng Gold', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 8, attribute_id: 2, value: 'Tím Deep Purple', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 9, attribute_id: 3, value: 'S', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 10, attribute_id: 3, value: 'M', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 11, attribute_id: 3, value: 'L', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 12, attribute_id: 3, value: 'XL', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 13, attribute_id: 3, value: 'XXL', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 14, attribute_id: 4, value: 'Trắng', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 15, attribute_id: 4, value: 'Đen', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 16, attribute_id: 4, value: 'Xanh Navy', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 17, attribute_id: 4, value: 'Xám', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 18, attribute_id: 5, value: 'Nhỏ', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 19, attribute_id: 5, value: 'Vừa', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 20, attribute_id: 5, value: 'Lớn', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 21, attribute_id: 6, value: 'Ít cay', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 22, attribute_id: 6, value: 'Vừa', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 23, attribute_id: 6, value: 'Cay', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 24, attribute_id: 6, value: 'Rất cay', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 25, attribute_id: 7, value: 'S', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 26, attribute_id: 7, value: 'M', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 27, attribute_id: 7, value: 'L', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 28, attribute_id: 8, value: 'Vị truyền thống', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 29, attribute_id: 8, value: 'Ít ngọt', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 30, attribute_id: 8, value: 'Không đường', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 31, attribute_id: 9, value: 'Thêm trân châu', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 32, attribute_id: 9, value: 'Thêm thạch', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 33, attribute_id: 9, value: 'Thêm kem', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 34, attribute_id: 9, value: 'Thêm pudding', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 35, attribute_id: 10, value: 'Nhỏ', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 36, attribute_id: 10, value: 'Vừa', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 37, attribute_id: 10, value: 'Lớn;', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 38, attribute_id: 11, value: 'Không cay', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 39, attribute_id: 11, value: 'Cay nhẹ', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 40, attribute_id: 11, value: 'Cay vừa', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 41, attribute_id: 12, value: 'S', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 42, attribute_id: 12, value: 'M', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 43, attribute_id: 12, value: 'L', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 44, attribute_id: 13, value: 'Ngọt đậm', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 45, attribute_id: 13, value: 'Ngọt nhẹ', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 46, attribute_id: 13, value: 'Không đường', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 47, attribute_id: 14, value: 'Thêm trân châu', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 48, attribute_id: 14, value: 'Thêm thạch', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ] as AttributeValue[],

    productVariants: [
        { id: 1, product_id: 1, sku: 'IPH14PM-128-BLK', price: 29990000.00, stock_quantity: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 2, product_id: 1, sku: 'IPH14PM-256-SLV', price: 31990000.00, stock_quantity: 15, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 3, product_id: 1, sku: 'IPH14PM-512-GLD', price: 35990000.00, stock_quantity: 8, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 4, product_id: 1, sku: 'IPH14PM-1TB-PUR', price: 39990000.00, stock_quantity: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 5, product_id: 2, sku: 'TSHIRT-SPY-S-WHT', price: 150000.00, stock_quantity: 50, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 6, product_id: 2, sku: 'TSHIRT-SPY-M-BLK', price: 150000.00, stock_quantity: 40, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 7, product_id: 2, sku: 'TSHIRT-SPY-L-NVY', price: 150000.00, stock_quantity: 30, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 8, product_id: 2, sku: 'TSHIRT-SPY-XL-GRY', price: 150000.00, stock_quantity: 20, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 9, product_id: 3, sku: 'CHICKEN-SM-LOWSP', price: 45000.00, stock_quantity: 30, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 10, product_id: 3, sku: 'CHICKEN-MD-MEDSP', price: 55000.00, stock_quantity: 25, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 11, product_id: 3, sku: 'CHICKEN-LG-HISP', price: 65000.00, stock_quantity: 20, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 12, product_id: 4, sku: 'BUBTEA-S-TRAD', price: 30000.00, stock_quantity: 50, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 13, product_id: 4, sku: 'BUBTEA-M-LESS', price: 35000.00, stock_quantity: 40, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 14, product_id: 4, sku: 'BUBTEA-L-NOSUG', price: 40000.00, stock_quantity: 30, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 15, product_id: 5, sku: 'CHICKEN-SM-NOSP', price: 40000.00, stock_quantity: 40, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 16, product_id: 5, sku: 'CHICKEN-MD-LOWSP', price: 48000.00, stock_quantity: 30, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 17, product_id: 5, sku: 'CHICKEN-LG-MEDSP', price: 55000.00, stock_quantity: 20, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 18, product_id: 6, sku: 'MATCHA-S-FULL', price: 35000.00, stock_quantity: 60, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 19, product_id: 6, sku: 'MATCHA-M-LIGHT', price: 40000.00, stock_quantity: 50, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 20, product_id: 6, sku: 'MATCHA-L-NOSUG', price: 45000.00, stock_quantity: 40, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ] as ProductVariant[],

    variantAttributeValues: [
        { variant_id: 1, attribute_id: 1, value_id: 1 },
        { variant_id: 1, attribute_id: 2, value_id: 5 },
        { variant_id: 2, attribute_id: 1, value_id: 2 },
        { variant_id: 2, attribute_id: 2, value_id: 6 },
        { variant_id: 3, attribute_id: 1, value_id: 3 },
        { variant_id: 3, attribute_id: 2, value_id: 7 },
        { variant_id: 4, attribute_id: 1, value_id: 4 },
        { variant_id: 4, attribute_id: 2, value_id: 8 },
        { variant_id: 5, attribute_id: 3, value_id: 9 },
        { variant_id: 5, attribute_id: 4, value_id: 14 },
        { variant_id: 6, attribute_id: 3, value_id: 10 },
        { variant_id: 6, attribute_id: 4, value_id: 15 },
        { variant_id: 7, attribute_id: 3, value_id: 11 },
        { variant_id: 7, attribute_id: 4, value_id: 16 },
        { variant_id: 8, attribute_id: 3, value_id: 12 },
        { variant_id: 8, attribute_id: 4, value_id: 17 },
        { variant_id: 9, attribute_id: 5, value_id: 18 },
        { variant_id: 9, attribute_id: 6, value_id: 21 },
        { variant_id: 10, attribute_id: 5, value_id: 19 },
        { variant_id: 10, attribute_id: 6, value_id: 22 },
        { variant_id: 11, attribute_id: 5, value_id: 20 },
        { variant_id: 11, attribute_id: 6, value_id: 23 },
        { variant_id: 12, attribute_id: 7, value_id: 25 },
        { variant_id: 12, attribute_id: 8, value_id: 28 },
        { variant_id: 13, attribute_id: 7, value_id: 26 },
        { variant_id: 13, attribute_id: 8, value_id: 29 },
        { variant_id: 14, attribute_id: 7, value_id: 27 },
        { variant_id: 14, attribute_id: 8, value_id: 30 },
        { variant_id: 15, attribute_id: 10, value_id: 35 },
        { variant_id: 15, attribute_id: 11, value_id: 38 },
        { variant_id: 16, attribute_id: 10, value_id: 36 },
        { variant_id: 16, attribute_id: 11, value_id: 39 },
        { variant_id: 17, attribute_id: 10, value_id: 37 },
        { variant_id: 17, attribute_id: 11, value_id: 40 },
        { variant_id: 18, attribute_id: 12, value_id: 41 },
        { variant_id: 18, attribute_id: 13, value_id: 44 },
        { variant_id: 19, attribute_id: 12, value_id: 42 },
        { variant_id: 19, attribute_id: 13, value_id: 45 },
        { variant_id: 20, attribute_id: 12, value_id: 43 },
        { variant_id: 20, attribute_id: 13, value_id: 46 },
    ] as VariantAttributeValue[],

    variantAddons: [
        { id: 1, variant_id: 12, attribute_id: 9, value_id: 31, price_adjust: 5000.0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 2, variant_id: 12, attribute_id: 9, value_id: 32, price_adjust: 5000.0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 3, variant_id: 12, attribute_id: 9, value_id: 33, price_adjust: 7000.0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 4, variant_id: 12, attribute_id: 9, value_id: 34, price_adjust: 8000.0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 5, variant_id: 13, attribute_id: 9, value_id: 31, price_adjust: 5000.0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 6, variant_id: 13, attribute_id: 9, value_id: 32, price_adjust: 5000.0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 7, variant_id: 13, attribute_id: 9, value_id: 33, price_adjust: 7000.0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 8, variant_id: 13, attribute_id: 9, value_id: 34, price_adjust: 8000.0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 9, variant_id: 14, attribute_id: 9, value_id: 31, price_adjust: 5000.0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 10, variant_id: 14, attribute_id: 9, value_id: 32, price_adjust: 5000.0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 11, variant_id: 14, attribute_id: 9, value_id: 33, price_adjust: 7000.0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 12, variant_id: 14, attribute_id: 9, value_id: 34, price_adjust: 8000.0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 13, variant_id: 18, attribute_id: 14, value_id: 47, price_adjust: 5000.0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 14, variant_id: 18, attribute_id: 14, value_id: 48, price_adjust: 5000.0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 15, variant_id: 19, attribute_id: 14, value_id: 47, price_adjust: 5000.0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 16, variant_id: 19, attribute_id: 14, value_id: 48, price_adjust: 5000.0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 17, variant_id: 20, attribute_id: 14, value_id: 47, price_adjust: 5000.0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 18, variant_id: 20, attribute_id: 14, value_id: 48, price_adjust: 5000.0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ] as VariantAddon[],

    products: [
        {
            id: 1,
            store_id: 1,
            category_id: 1,
            name: 'iPhone 14 Pro Max',
            slug: 'iphone-14-pro-max',
            product_type: 'electronics',
            description: 'iPhone 14 Pro Max là chiếc điện thoại cao cấp nhất từ Apple với nhiều tính năng vượt trội...',
            highlights: [
                'Màn hình 6.7" Super Retina XDR với ProMotion và Always-On',
                'Camera chính 48MP với Quad-Pixel và Photonic Engine',
                'Dynamic Island - cách mới để tương tác với iPhone',
                'Thời lượng pin cả ngày và SOS khẩn cấp qua vệ tinh',
                'Chip A16 Bionic - chip smartphone nhanh nhất thế giới',
            ],
            base_price: 29990000.00,
            stock_quantity: 50,
            thumbnail_url: 'avata_store_1.jpg',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            rating: 4.9,
            sold_count: 500,
        },
        {
            id: 2,
            store_id: 1,
            category_id: 2,
            name: 'Áo thun in hình Spy × Family',
            slug: 'ao-thun-spy-family',
            product_type: 'clothing',
            description: 'Áo thun in hình anime Spy × Family chất liệu cotton 100%, thoáng mát, thấm hút mồ hôi tốt.',
            highlights: [
                'Chất liệu cotton 100%',
                'Hình in sắc nét, không bong tróc',
                'Thoáng mát, thấm hút mồ hôi tốt',
                'Phong cách anime thời thượng',
            ],
            base_price: 150000.00,
            stock_quantity: 200,
            thumbnail_url: 'assets/images/wardrobe_banner.jpg',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            rating: 4.7,
            sold_count: 300,
        },
        {
            id: 3,
            store_id: 2,
            category_id: 3,
            name: 'Cơm gà Tender Phô Mai Hàn Quốc',
            slug: 'com-ga-tender-pho-mai-han-quoc',
            product_type: 'food',
            description: 'Cơm gà Tender phô mai Hàn Quốc với các miếng gà giòn phủ phô mai béo ngậy.',
            highlights: [
                'Gà rán giòn tan, phủ phô mai',
                'Cơm dẻo thơm',
                'Rau củ tươi ngon',
                'Nước sốt đặc biệt',
            ],
            base_price: 45000.00,
            stock_quantity: 100,
            thumbnail_url: 'assets/images/com-ga-xoi-mo.jpg',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            rating: 4.8,
            sold_count: 250,
        },
        {
            id: 4,
            store_id: 3,
            category_id: 4,
            name: 'Trà sữa trân châu đường đen',
            slug: 'tra-sua-tran-chau-duong-den',
            product_type: 'beverage',
            description: 'Trà sữa trân châu đường đen thơm ngon, trân châu dai mềm, hương vị đậm đà.',
            highlights: [
                'Trân châu dai mềm',
                'Đường đen thơm béo',
                'Trà tươi hảo hạng',
                'Ngọt vừa phải, đậm đà',
            ],
            base_price: 30000.00,
            stock_quantity: 150,
            thumbnail_url: 'assets/images/cf_sua.png',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            rating: 4.6,
            sold_count: 400,
        },
        {
            id: 5,
            store_id: 2,
            category_id: 3,
            name: 'Cơm Gà Xối Mỡ',
            slug: 'com-ga-xoi-mo',
            product_type: 'food',
            description: 'Cơm gà xối mỡ thơm ngon với lớp da gà giòn rụm, cơm dẻo mềm.',
            highlights: [
                'Da gà giòn rụm',
                'Cơm dẻo mềm',
                'Nước mắm pha đặc biệt',
                'Rau kèm tươi ngon',
            ],
            base_price: 40000.00,
            stock_quantity: 120,
            thumbnail_url: 'assets/images/com-ga-xoi-mo.jpg',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            rating: 4.7,
            sold_count: 300,
        },
        {
            id: 6,
            store_id: 3,
            category_id: 4,
            name: 'Trà Sữa Matcha',
            slug: 'tra-sua-matcha',
            product_type: 'beverage',
            description: 'Trà sữa matcha thơm ngon với vị trà xanh đậm đà, kết hợp trân châu mềm.',
            highlights: [
                'Vị matcha đậm đà',
                'Trân châu mềm dai',
                'Sữa tươi béo ngậy',
                'Ngọt thanh, dễ uống',
            ],
            base_price: 35000.00,
            stock_quantity: 180,
            thumbnail_url: 'https://example.com/matcha-bubble-tea.jpg',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            rating: 4.8,
            sold_count: 350,
        },
    ] as Product[],

    relatedProducts: [
        {
            id: 101,
            name: 'Spy × Family T-shirt',
            base_price: 260000.00,
            store_id: 1,
            category_id: 2,
            description: 'Áo phông họa tiết Spy × Family',
            stock_quantity: 100,
            thumbnail_url: 'https://example.com/spy-family-tshirt.jpg',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            rating: 4.8,
            sold_count: 1238,
        },
        {
            id: 102,
            name: 'Green Man Jacket',
            base_price: 490000.00,
            store_id: 1,
            category_id: 2,
            description: 'Áo khoác xanh lá cho nam',
            stock_quantity: 80,
            thumbnail_url: 'https://example.com/green-jacket.jpg',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            rating: 4.8,
            sold_count: 1238,
        },
        {
            id: 103,
            name: 'iPhone 14 Pro Max',
            base_price: 29990000.00,
            store_id: 1,
            category_id: 1,
            description: 'Điện thoại iPhone 14 Pro Max mới nhất',
            stock_quantity: 50,
            thumbnail_url: 'https://example.com/iphone14.jpg',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            rating: 4.8,
            sold_count: 1238,
        },
        {
            id: 104,
            name: 'Oversized Tshirt',
            base_price: 480000.00,
            store_id: 1,
            category_id: 2,
            description: 'Áo phông rộng phong cách Hàn Quốc',
            stock_quantity: 120,
            thumbnail_url: 'https://example.com/oversized-tshirt.jpg',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            rating: 4.8,
            sold_count: 1238,
        },
    ] as RelatedProduct[],

    productImages: [
        {
            id: 1,
            product_id: 1,
            image_url: 'avata_store_1.jpg',
            is_thumbnail: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 2,
            product_id: 1,
            image_url: 'cf_sua.png',
            is_thumbnail: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 3,
            product_id: 2,
            image_url: 'assets/images/avata_store_1.jpg',
            is_thumbnail: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 4,
            product_id: 3,
            image_url: 'assets/images/banh_tran_tron.png',
            is_thumbnail: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 5,
            product_id: 4,
            image_url: 'assets/images/banh_tran_tron.png',
            is_thumbnail: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 6,
            product_id: 5,
            image_url: 'https://example.com/fried-chicken-rice-1.jpg',
            is_thumbnail: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 7,
            product_id: 6,
            image_url: 'https://example.com/matcha-bubble-tea-1.jpg',
            is_thumbnail: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ] as ProductImage[],

    variantImages: [
        {
            id: 1,
            variant_id: 1,
            image_url: 'assets/images/iphone14_black.jpg',
            is_thumbnail: true,
        },
        {
            id: 2,
            variant_id: 2,
            image_url: 'assets/images/iphone14_silver.jpg',
            is_thumbnail: true,
        },
        {
            id: 3,
            variant_id: 3,
            image_url: 'assets/images/iphone14_gold.jpg',
            is_thumbnail: true,
        },
        {
            id: 4,
            variant_id: 4,
            image_url: 'assets/images/cf_sua.png',
            is_thumbnail: true,
        },
        {
            id: 5,
            variant_id: 5,
            image_url: 'assets/images/spy-family-tshirt_white.jpg',
            is_thumbnail: true,
        },
        {
            id: 6,
            variant_id: 6,
            image_url: 'assets/images/spy-family-tshirt_black.jpg',
            is_thumbnail: true,
        },
        {
            id: 7,
            variant_id: 7,
            image_url: 'assets/images/spy-family-tshirt_navy.jpg',
            is_thumbnail: true,
        },
        {
            id: 8,
            variant_id: 8,
            image_url: 'assets/images/spy-family-tshirt_grey.jpg',
            is_thumbnail: true,
        },
    ] as VariantImage[],

    reviewsData: {
        average_rating: 4.5,
        total_reviews: '1.25k',
        rating_distribution: [
            { rating: 5.0, count: 2823, percentage: 0.95 },
            { rating: 4.0, count: 4, percentage: 0.05 },
            { rating: 3.0, count: 0, percentage: 0.0 },
            { rating: 2.0, count: 0, percentage: 0.0 },
            { rating: 1.0, count: 0, percentage: 0.0 },
        ],
    } as ReviewsData,

    reviews: [
        {
            id: 1,
            product_id: 1,
            user_id: 1,
            user_name: 'Darrell Steward',
            avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg',
            rating: 5,
            comment: 'This is amazing product I have.',
            date: 'July 2, 2020 03:29 PM',
            likes: 128,
            has_photos: false,
            has_videos: false,
            created_at: '2020-07-02T15:29:00',
            updated_at: '2020-07-02T15:29:00',
        },
        {
            id: 2,
            product_id: 1,
            user_id: 2,
            user_name: 'Darlene Robertson',
            avatar_url: 'https://randomuser.me/api/portraits/women/2.jpg',
            rating: 5,
            comment: 'This is amazing product I have.',
            date: 'July 2, 2020 1:06 PM',
            likes: 82,
            has_photos: false,
            has_videos: false,
            created_at: '2020-07-02T13:06:00',
            updated_at: '2020-07-02T13:06:00',
        },
        {
            id: 3,
            product_id: 1,
            user_id: 3,
            user_name: 'Kathryn Murphy',
            avatar_url: 'https://randomuser.me/api/portraits/women/3.jpg',
            rating: 5,
            comment: 'This is amazing product I have.',
            date: 'June 26, 2020 10:05 PM',
            likes: 9,
            has_photos: true,
            has_videos: false,
            created_at: '2020-06-26T22:05:00',
            updated_at: '2020-06-26T22:05:00',
        },
        {
            id: 4,
            product_id: 1,
            user_id: 4,
            user_name: 'Ronald Richards',
            avatar_url: 'https://randomuser.me/api/portraits/men/4.jpg',
            rating: 5,
            comment: 'This is amazing product I have.',
            date: 'July 7, 2020 10:14 AM',
            likes: 124,
            has_photos: false,
            has_videos: true,
            created_at: '2020-07-07T10:14:00',
            updated_at: '2020-07-07T10:14:00',
        },
        {
            id: 5,
            product_id: 1,
            user_id: 5,
            user_name: 'Leslie Alexander',
            avatar_url: 'https://randomuser.me/api/portraits/women/5.jpg',
            rating: 5,
            comment: 'Đây là một sản phẩm tuyệt vời. Tôi đã sử dụng được vài tháng và rất hài lòng với hiệu suất của nó. Pin kéo dài cả ngày và camera chụp ảnh rất đẹp.',
            date: 'August 12, 2020 08:45 AM',
            likes: 76,
            has_photos: true,
            has_videos: true,
            created_at: '2020-08-12T08:45:00',
            updated_at: '2020-08-12T08:45:00',
        },
        {
            id: 6,
            product_id: 1,
            user_id: 6,
            user_name: 'Jacob Jones',
            avatar_url: 'https://randomuser.me/api/portraits/men/6.jpg',
            rating: 4,
            comment: 'Sản phẩm tốt nhưng giá hơi cao. Tính năng hoạt động tốt nhưng tôi nghĩ có thể cải thiện thêm về thời lượng pin.',
            date: 'September 3, 2020 11:22 AM',
            likes: 45,
            has_photos: false,
            has_videos: false,
            created_at: '2020-09-03T11:22:00',
            updated_at: '2020-09-03T11:22:00',
        },
    ] as Review[],

    users: [
        {
            id: 1,
            name: 'Darrell Steward',
            email: 'darrell.steward@example.com',
            avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg',
            created_at: '2020-01-15T10:30:00',
            updated_at: '2020-01-15T10:30:00',
        },
        {
            id: 2,
            name: 'Darlene Robertson',
            email: 'darlene.robertson@example.com',
            avatar_url: 'https://randomuser.me/api/portraits/women/2.jpg',
            created_at: '2020-02-20T14:45:00',
            updated_at: '2020-02-20T14:45:00',
        },
        {
            id: 3,
            name: 'Kathryn Murphy',
            email: 'kathryn.murphy@example.com',
            avatar_url: 'https://randomuser.me/api/portraits/women/3.jpg',
            created_at: '2020-03-10T09:15:00',
            updated_at: '2020-03-10T09:15:00',
        },
        {
            id: 4,
            name: 'Ronald Richards',
            email: 'ronald.richards@example.com',
            avatar_url: 'https://randomuser.me/api/portraits/men/4.jpg',
            created_at: '2020-04-05T16:20:00',
            updated_at: '2020-04-05T16:20:00',
        },
        {
            id: 5,
            name: 'Leslie Alexander',
            email: 'leslie.alexander@example.com',
            avatar_url: 'https://randomuser.me/api/portraits/women/5.jpg',
            created_at: '2020-05-12T11:40:00',
            updated_at: '2020-05-12T11:40:00',
        },
        {
            id: 6,
            name: 'Jacob Jones',
            email: 'jacob.jones@example.com',
            avatar_url: 'https://randomuser.me/api/portraits/men/6.jpg',
            created_at: '2020-06-18T13:50:00',
            updated_at: '2020-06-18T13:50:00',
        },
    ] as User[],


    discount_codes: [
        {
            id: 1,
            store_id: 1, // Cửa Hàng Điện Tử ABC
            quantity: 100,
            max_uses: 100,
            used_count: 20,
            code: "ELECTRO20",
            description: "Giảm 20% cho đơn hàng điện tử từ 1,000,000 VNĐ",
            discount_type: "percentage",
            discount_value: 20.00,
            min_order_amount: 1000000.00,
            max_discount_value: 500000.00,
            start_date: "2025-06-01",
            end_date: "2025-12-31",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 2,
            store_id: 2, // Nhà Hàng Gà Rán XYZ
            quantity: 200,
            max_uses: 200,
            used_count: 50,
            code: "CHICKEN10",
            description: "Giảm 10,000 VNĐ cho đơn hàng từ 50,000 VNĐ",
            discount_type: "fixed",
            discount_value: 10000.00,
            min_order_amount: 50000.00,
            max_discount_value: 10000.00,
            start_date: "2025-06-01",
            end_date: "2025-09-30",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 3,
            store_id: 3, // Quán Trà Sữa 123
            quantity: 150,
            max_uses: 150,
            used_count: 30,
            code: "MILKTEA15",
            description: "Giảm 15% cho đơn hàng trà sữa từ 30,000 VNĐ",
            discount_type: "percentage",
            discount_value: 15.00,
            min_order_amount: 30000.00,
            max_discount_value: 15000.00,
            start_date: "2025-06-01",
            end_date: "2025-11-30",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 4,
            store_id: 2, // Nhà Hàng Gà Rán XYZ
            quantity: 50,
            max_uses: 50,
            used_count: 10,
            code: "FRIEDCHICKEN50",
            description: "Giảm 50% cho đơn hàng từ 100,000 VNĐ, tối đa 30,000 VNĐ",
            discount_type: "percentage",
            discount_value: 50.00,
            min_order_amount: 100000.00,
            max_discount_value: 30000.00,
            start_date: "2025-06-01",
            end_date: "2025-08-31",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 5,
            store_id: 3, // Quán Trà Sữa 123
            quantity: 80,
            max_uses: 80,
            used_count: 15,
            code: "BUBBLETEA5K",
            description: "Giảm 5,000 VNĐ cho mọi đơn hàng trà sữa",
            discount_type: "fixed",
            discount_value: 5000.00,
            min_order_amount: 0.00,
            max_discount_value: 5000.00,
            start_date: "2025-06-01",
            end_date: "2025-10-31",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 6,
            store_id: 1, // Cửa Hàng Điện Tử ABC
            quantity: 100,
            max_uses: 100,
            used_count: 20,
            code: "ELECTRO30",
            description: "Giảm 30%",
            discount_type: "percentage",
            discount_value: 20.00,
            min_order_amount: 1000000.00,
            max_discount_value: 500000.00,
            start_date: "2025-06-01",
            end_date: "2025-12-31",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ] as DiscountCode[],
};
