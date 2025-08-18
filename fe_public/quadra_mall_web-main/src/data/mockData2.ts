// mockData.ts
export interface Store {
  id: number;
  owner_id: number;
  name: string;
  slug: string;
  address: string | null;
  description: string | null;
  logo_url: string | null;
  isActive: boolean;
  status: 'active' | 'inactive' | 'waiting';

  created_at: string;
  updated_at: string;
}

export interface ItemType {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  is_active: boolean;
}

export interface Category {
  id: number;
  store_id: number;
  item_type_id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Attribute {
  id: number;
  name: string;
}

export interface AttributeValue {
  id: number;
  attributes_id: number;
  value: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  alt_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductDetail {
  id: number;
  variant_id: number;
  value_id: number;
}

export interface AddonGroup {
  id: number;
  product_id: number;
  name: string;
  max_choice: number;
  created_at: string;
  updated_at: string;
}

export interface Addon {
  id: number;
  addon_group_id: number;
  name: string;
  price_adjust: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  store_id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text: string | null;
  is_thumbnail: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductReview {
  id: number;
  user_id: number;
  variant_id: number;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  password: string;
  full_name: string;
  phone: string;
  avatar_url: string | null;
  status: 'active' | 'inactive' | 'banned';
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface UserRole {
  user_id: number;
  role_id: number;
}

export interface Address {
  id: number;
  user_id: number;
  receiver_name: string;
  receiver_phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DiscountCode {
  id: number;
  store_id: number;
  max_uses: number;
  used_count: number;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_value: number | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  variant_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface CartItemAddon {
  id: number;
  cart_item_id: number;
  addon_id: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  customer_id: number;
  store_id: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_method: 'standard' | 'express';
  payment_method: 'cod' | 'online';
  discount_code_id: number | null;
  total_amount: number;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  variant_id: number;
  order_id: number;
  quantity: number;
  price_at_time: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItemAddon {
  id: number;
  order_item_id: number;
  addon_id: number;
  price_adjust_at_time: number;
  created_at: string;
}

export interface PaymentTransaction {
  id: number;
  order_id: number;
  gateway_name: string;
  method: 'cod' | 'online';
  type: 'payment' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  amount: number;
  currency_code: string;
  transaction_code: string | null;
  gateway_response: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShippingPartner {
  id: number;
  name: string;
  api_endpoint: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderShipping {
  id: number;
  order_id: number;
  shipping_partner_id: number;
  tracking_number: string | null;
  estimated_delivery: string | null;
  shipping_status: 'pending' | 'shipped' | 'delivered';
  shipping_cost: number;
  pickup_name: string;
  pickup_phone: string;
  pickup_address: string;
  pickup_province: string;
  pickup_district: string;
  pickup_ward: string;
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_province: string;
  delivery_district: string;
  delivery_ward: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: number;
  customer_id: number;
  store_id: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  message_text: string;
  created_at: string;
  imageUrl: string;
  videoUrl: string;
}

export const mockData = {
  users: [
    {
      id: 1,
      email: 'darrell.steward@example.com',
      password: '$2b$10$hashedpassword1',
      full_name: 'Darrell Steward',
      phone: '0901234567',
      status: 'active',
      avatar_url: 'wardrobe_banner.jpg',
      created_at: '2020-01-15T10:30:00Z',
      updated_at: '2020-01-15T10:30:00Z',
    },
    {
      id: 2,
      email: 'darlene.robertson@example.com',
      password: '$2b$10$hashedpassword2',
      full_name: 'Darlene Robertson',
      phone: '0901234568',
      avatar_url: 'anh-doanh-nhan.webp',
      status: 'active',
      created_at: '2020-02-20T14:45:00Z',
      updated_at: '2020-02-20T14:45:00Z',
    },
    {
      id: 3,
      email: 'kathryn.murphy@example.com',
      password: '$2b$10$hashedpassword3',
      full_name: 'Kathryn Murphy',
      phone: '0901234569',
      avatar_url: 'anh-doanh-nhan.webp',
      status: 'active',
      created_at: '2020-03-10T09:15:00Z',
      updated_at: '2020-03-10T09:15:00Z',
    },
    {
      id: 4,
      email: 'ronald.richards@example.com',
      password: '$2b$10$hashedpassword4',
      full_name: 'Ronald Richards',
      phone: '0901234570',
      status: 'active',
      created_at: '2020-04-05T16:20:00Z',
      updated_at: '2020-04-05T16:20:00Z',
    },
    {
      id: 5,
      email: 'leslie.alexander@example.com',
      password: '$2b$10$hashedpassword5',
      full_name: 'Leslie Alexander',
      phone: '0901234571',
      status: 'active',
      created_at: '2020-05-12T11:40:00Z',
      updated_at: '2020-05-12T11:40:00Z',
    },
    {
      id: 6,
      email: 'jacob.jones@example.com',
      password: '$2b$10$hashedpassword6',
      full_name: 'Jacob Jones',
      phone: '0901234572',
      status: 'active',
      created_at: '2020-06-18T13:50:00Z',
      updated_at: '2020-06-18T13:50:00Z',
    },
  ] as User[],

  roles: [
    {
      id: 1,
      name: 'customer',
      description: 'Khách hàng',
      created_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'store_owner',
      description: 'Chủ cửa hàng',
      created_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 3,
      name: 'admin',
      description: 'Quản trị viên',
      created_at: '2025-01-01T00:00:00Z',
    },
  ] as Role[],

  user_roles: [
    { user_id: 1, role_id: 1 },
    { user_id: 2, role_id: 1 },
    { user_id: 3, role_id: 1 },
    { user_id: 4, role_id: 2 },
    { user_id: 5, role_id: 2 },
    { user_id: 6, role_id: 3 },
  ] as UserRole[],

  stores: [
    {
      id: 1,
      owner_id: 4,
      name: 'Cửa Hàng Điện Tử ABC',
      slug: 'dien-tu-abc',
      address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
      description: 'Chuyên bán điện thoại và phụ kiện',
      logo_url: 'shop_voi_cf.jpg',
      status: 'active',
      isActive: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      owner_id: 5,
      name: 'Nhà Hàng Gà Rán XYZ',
      slug: 'nha-hang-ga-ran-xyz',
      address: '45 Đường Nguyễn Huệ, Quận 1, TP.HCM',
      description: 'Chuyên cung cấp các món gà rán và cơm Hàn Quốc',
      logo_url: 'shop_van_fashion.jpg',
      status: 'active',
      isActive: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 3,
      owner_id: 4,
      name: 'Quán Trà Sữa 123',
      slug: 'quan-tra-sua-123',
      address: '78 Đường Trần Hưng Đạo, Quận 5, TP.HCM',
      description: 'Trà sữa thơm ngon, trân châu dai giòn',
      logo_url: 'avata_store_1.jpg',
      status: 'active',
      isActive: false,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 4,
      owner_id: 5,
      name: 'Thời Trang Unisex DEF',
      slug: 'thoi-trang-unisex-def',
      address: '56 Đường Phạm Ngọc Thạch, Quận 3, TP.HCM',
      description: 'Quần áo thời trang phong cách unisex',
      logo_url: 'assets/images/unisex_fashion.jpg',
      status: 'waiting',
      created_at: '2025-02-01T00:00:00Z',
      updated_at: '2025-02-01T00:00:00Z',
    },
  ] as Store[],

  item_types: [
    {
      id: 1,
      parent_id: null,
      name: 'Điện tử',
      slug: 'dien-tu',
      description: 'Các sản phẩm điện tử như điện thoại, máy tính bảng',
      icon_url: 'assets/icons/electronics.png',
      is_active: true,
    },
    {
      id: 2,
      parent_id: null,
      name: 'Thời trang',
      slug: 'thoi-trang',
      description: 'Quần áo, phụ kiện thời trang',
      icon_url: 'assets/icons/clothing.png',
      is_active: true,
    },
    {
      id: 3,
      parent_id: null,
      name: 'Đồ ăn',
      slug: 'do-an',
      description: 'Các món ăn như cơm gà, gà rán',
      icon_url: 'assets/icons/food.png',
      is_active: true,
    },
    {
      id: 4,
      parent_id: null,
      name: 'Đồ uống',
      slug: 'do-uong',
      description: 'Trà sữa, cà phê, nước giải khát',
      icon_url: 'assets/icons/beverage.png',
      is_active: true,
    },
    {
      id: 5,
      parent_id: 2,
      name: 'Phụ kiện thời trang',
      slug: 'phu-kien-thoi-trang',
      description: 'Túi xách, mũ, kính mắt',
      icon_url: 'assets/icons/accessories.png',
      is_active: true,
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
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      store_id: 1,
      item_type_id: 2,
      name: 'Áo thun',
      slug: 'ao-thun',
      description: 'Danh mục áo thun thời trang',
      parent_id: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 3,
      store_id: 2,
      item_type_id: 3,
      name: 'Cơm gà',
      slug: 'com-ga',
      description: 'Danh mục các món cơm gà',
      parent_id: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 4,
      store_id: 3,
      item_type_id: 4,
      name: 'Trà sữa',
      slug: 'tra-sua',
      description: 'Danh mục các loại trà sữa',
      parent_id: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 5,
      store_id: 4,
      item_type_id: 5,
      name: 'Túi xách',
      slug: 'tui-xach',
      description: 'Danh mục túi xách thời trang',
      parent_id: null,
      created_at: '2025-02-01T00:00:00Z',
      updated_at: '2025-02-01T00:00:00Z',
    },
  ] as Category[],

  attributes: [
    { id: 1, name: 'Dung lượng' },
    { id: 2, name: 'Màu sắc' },
    { id: 3, name: 'Kích thước' },
    { id: 4, name: 'Độ cay' },
    { id: 5, name: 'Hương vị' },
    { id: 6, name: 'Topping' },
  ] as Attribute[],

  attributes_value: [
    { id: 1, attributes_id: 1, value: '128GB' },
    { id: 2, attributes_id: 1, value: '256GB' },
    { id: 3, attributes_id: 1, value: '512GB' },
    { id: 4, attributes_id: 1, value: '1TB' },
    { id: 5, attributes_id: 2, value: 'Đen Space Black' },
    { id: 6, attributes_id: 2, value: 'Bạc Silver' },
    { id: 7, attributes_id: 2, value: 'Vàng Gold' },
    { id: 8, attributes_id: 2, value: 'Tím Deep Purple' },
    { id: 9, attributes_id: 3, value: 'S' },
    { id: 10, attributes_id: 3, value: 'M' },
    { id: 11, attributes_id: 3, value: 'L' },
    { id: 12, attributes_id: 3, value: 'XL' },
    { id: 13, attributes_id: 3, value: 'XXL' },
    { id: 14, attributes_id: 2, value: 'Trắng' },
    { id: 15, attributes_id: 2, value: 'Đen' },
    { id: 16, attributes_id: 2, value: 'Xanh Navy' },
    { id: 17, attributes_id: 2, value: 'Xám' },
    { id: 18, attributes_id: 3, value: 'Nhỏ' },
    { id: 19, attributes_id: 3, value: 'Vừa' },
    { id: 20, attributes_id: 3, value: 'Lớn' },
    { id: 21, attributes_id: 4, value: 'Ít cay' },
    { id: 22, attributes_id: 4, value: 'Vừa' },
    { id: 23, attributes_id: 4, value: 'Cay' },
    { id: 24, attributes_id: 4, value: 'Rất cay' },
    { id: 25, attributes_id: 5, value: 'Vị truyền thống' },
    { id: 26, attributes_id: 5, value: 'Ít ngọt' },
    { id: 27, attributes_id: 5, value: 'Không đường' },
    { id: 28, attributes_id: 6, value: 'Thêm trân châu' },
    { id: 29, attributes_id: 6, value: 'Thêm thạch' },
    { id: 30, attributes_id: 6, value: 'Thêm kem' },
    { id: 31, attributes_id: 6, value: 'Thêm pudding' },
    { id: 32, attributes_id: 4, value: 'Không cay' },
    { id: 33, attributes_id: 4, value: 'Cay nhẹ' },
    { id: 34, attributes_id: 5, value: 'Ngọt đậm' },
    { id: 35, attributes_id: 5, value: 'Ngọt nhẹ' },
  ] as AttributeValue[],

  products: [
    {
      id: 1,
      store_id: 1,
      category_id: 1,
      name: 'iPhone 14 Pro Max',
      slug: 'iphone-14-pro-max',
      description: 'iPhone 14 Pro Max là chiếc điện thoại cao cấp nhất từ Apple với nhiều tính năng vượt trội...',
      thumbnail_url: 'assets/images/iphone14.jpg',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      store_id: 1,
      category_id: 2,
      name: 'Áo thun in hình Spy × Family',
      slug: 'ao-thun-spy-family',
      description: 'Áo thun in hình anime Spy × Family chất liệu cotton 100%, thoáng mát, thấm hút mồ hôi tốt.',
      thumbnail_url: 'assets/images/spy-family-tshirt.jpg',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 3,
      store_id: 2,
      category_id: 3,
      name: 'Cơm gà Tender Phô Mai Hàn Quốc',
      slug: 'com-ga-tender-pho-mai-han-quoc',
      description: 'Cơm gà Tender phô mai Hàn Quốc với các miếng gà giòn phủ phô mai béo ngậy.',
      thumbnail_url: 'assets/images/com-ga-pho-mai.jpg',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 4,
      store_id: 3,
      category_id: 4,
      name: 'Trà sữa trân châu đường đen',
      slug: 'tra-sua-tran-chau-duong-den',
      description: 'Trà sữa trân châu đường đen thơm ngon, trân châu dai mềm, hương vị đậm đà.',
      thumbnail_url: 'assets/images/tra-sua-duong-den.jpg',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 5,
      store_id: 2,
      category_id: 3,
      name: 'Cơm Gà Xối Mỡ',
      slug: 'com-ga-xoi-mo',
      description: 'Cơm gà xối mỡ thơm ngon với lớp da gà giòn rụm, cơm dẻo mềm.',
      thumbnail_url: 'assets/images/com-ga-xoi-mo.jpg',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 6,
      store_id: 3,
      category_id: 4,
      name: 'Trà Sữa Matcha',
      slug: 'tra-sua-matcha',
      description: 'Trà sữa matcha thơm ngon với vị trà xanh đậm đà, kết hợp trân châu mềm.',
      thumbnail_url: 'assets/images/tra-sua-matcha.jpg',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 7,
      store_id: 4,
      category_id: 5,
      name: 'Túi xách da thời trang',
      slug: 'tui-xach-da-thoi-trang',
      description: 'Túi xách da cao cấp, phong cách unisex, phù hợp mọi dịp.',
      thumbnail_url: 'assets/images/tui-xach-da.jpg',
      is_active: true,
      created_at: '2025-02-01T00:00:00Z',
      updated_at: '2025-02-01T00:00:00Z',
    },
  ] as Product[],

  product_variants: [
    {
      id: 1,
      product_id: 1,
      sku: 'IPH14PM-128-BLK',
      price: 29990000.00,
      stock_quantity: 10,
      image_url: 'assets/images/iphone14_black.jpg',
      alt_text: 'iPhone 14 Pro Max Black',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      product_id: 1,
      sku: 'IPH14PM-256-SLV',
      price: 31990000.00,
      stock_quantity: 15,
      image_url: 'assets/images/iphone14_silver.jpg',
      alt_text: 'iPhone 14 Pro Max Silver',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 3,
      product_id: 1,
      sku: 'IPH14PM-512-GLD',
      price: 35990000.00,
      stock_quantity: 8,
      image_url: 'assets/images/iphone14_gold.jpg',
      alt_text: 'iPhone 14 Pro Max Gold',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 4,
      product_id: 1,
      sku: 'IPH14PM-1TB-PUR',
      price: 39990000.00,
      stock_quantity: 5,
      image_url: 'assets/images/iphone14_purple.jpg',
      alt_text: 'iPhone 14 Pro Max Purple',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 5,
      product_id: 2,
      sku: 'TSHIRT-SPY-S-WHT',
      price: 150000.00,
      stock_quantity: 50,
      image_url: 'assets/images/spy-family-tshirt_white.jpg',
      alt_text: 'Spy × Family T-shirt White',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 6,
      product_id: 2,
      sku: 'TSHIRT-SPY-M-BLK',
      price: 150000.00,
      stock_quantity: 40,
      image_url: 'assets/images/spy-family-tshirt_black.jpg',
      alt_text: 'Spy × Family T-shirt Black',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 7,
      product_id: 2,
      sku: 'TSHIRT-SPY-L-NVY',
      price: 150000.00,
      stock_quantity: 30,
      image_url: 'assets/images/spy-family-tshirt_navy.jpg',
      alt_text: 'Spy × Family T-shirt Navy',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 8,
      product_id: 2,
      sku: 'TSHIRT-SPY-XL-GRY',
      price: 150000.00,
      stock_quantity: 20,
      image_url: 'assets/images/spy-family-tshirt_grey.jpg',
      alt_text: 'Spy × Family T-shirt Grey',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 9,
      product_id: 3,
      sku: 'CHICKEN-SM-LOWSP',
      price: 45000.00,
      stock_quantity: 30,
      image_url: 'assets/images/com-ga-pho-mai_sm.jpg',
      alt_text: 'Cơm gà Tender Phô Mai Small',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 10,
      product_id: 3,
      sku: 'CHICKEN-MD-MEDSP',
      price: 55000.00,
      stock_quantity: 25,
      image_url: 'assets/images/com-ga-pho-mai_md.jpg',
      alt_text: 'Cơm gà Tender Phô Mai Medium',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 11,
      product_id: 3,
      sku: 'CHICKEN-LG-HISP',
      price: 65000.00,
      stock_quantity: 20,
      image_url: 'assets/images/com-ga-pho-mai_lg.jpg',
      alt_text: 'Cơm gà Tender Phô Mai Large',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 12,
      product_id: 4,
      sku: 'BUBTEA-S-TRAD',
      price: 30000.00,
      stock_quantity: 50,
      image_url: 'assets/images/tra-sua-duong-den_s.jpg',
      alt_text: 'Trà sữa trân châu đường đen Small',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 13,
      product_id: 4,
      sku: 'BUBTEA-M-LESS',
      price: 35000.00,
      stock_quantity: 40,
      image_url: 'assets/images/tra-sua-duong-den_m.jpg',
      alt_text: 'Trà sữa trân châu đường đen Medium',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 14,
      product_id: 4,
      sku: 'BUBTEA-L-NOSUG',
      price: 40000.00,
      stock_quantity: 30,
      image_url: 'assets/images/tra-sua-duong-den_l.jpg',
      alt_text: 'Trà sữa trân châu đường đen Large',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 15,
      product_id: 5,
      sku: 'CHICKEN-SM-NOSP',
      price: 40000.00,
      stock_quantity: 40,
      image_url: 'assets/images/com-ga-xoi-mo_sm.jpg',
      alt_text: 'Cơm Gà Xối Mỡ Small',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 16,
      product_id: 5,
      sku: 'CHICKEN-MD-LOWSP',
      price: 48000.00,
      stock_quantity: 30,
      image_url: 'assets/images/com-ga-xoi-mo_md.jpg',
      alt_text: 'Cơm Gà Xối Mỡ Medium',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 17,
      product_id: 5,
      sku: 'CHICKEN-LG-MEDSP',
      price: 55000.00,
      stock_quantity: 20,
      image_url: 'assets/images/com-ga-xoi-mo_lg.jpg',
      alt_text: 'Cơm Gà Xối Mỡ Large',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 18,
      product_id: 6,
      sku: 'MATCHA-S-FULL',
      price: 35000.00,
      stock_quantity: 60,
      image_url: 'assets/images/tra-sua-matcha_s.jpg',
      alt_text: 'Trà Sữa Matcha Small',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 19,
      product_id: 6,
      sku: 'MATCHA-M-LIGHT',
      price: 40000.00,
      stock_quantity: 50,
      image_url: 'assets/images/tra-sua-matcha_m.jpg',
      alt_text: 'Trà Sữa Matcha Medium',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 20,
      product_id: 6,
      sku: 'MATCHA-L-NOSUG',
      price: 45000.00,
      stock_quantity: 40,
      image_url: 'assets/images/tra-sua-matcha_l.jpg',
      alt_text: 'Trà Sữa Matcha Large',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 21,
      product_id: 7,
      sku: 'BAG-LEATHER-BLK',
      price: 1200000.00,
      stock_quantity: 15,
      image_url: 'assets/images/tui-xach-da_black.jpg',
      alt_text: 'Túi xách da Black',
      created_at: '2025-02-01T00:00:00Z',
      updated_at: '2025-02-01T00:00:00Z',
    },
  ] as ProductVariant[],

  product_details: [
    { id: 1, variant_id: 1, value_id: 1 },
    { id: 2, variant_id: 1, value_id: 5 },
    { id: 3, variant_id: 2, value_id: 2 },
    { id: 4, variant_id: 2, value_id: 6 },
    { id: 5, variant_id: 3, value_id: 3 },
    { id: 6, variant_id: 3, value_id: 7 },
    { id: 7, variant_id: 4, value_id: 4 },
    { id: 8, variant_id: 4, value_id: 8 },
    { id: 9, variant_id: 5, value_id: 9 },
    { id: 10, variant_id: 5, value_id: 14 },
    { id: 11, variant_id: 6, value_id: 10 },
    { id: 12, variant_id: 6, value_id: 15 },
    { id: 13, variant_id: 7, value_id: 11 },
    { id: 14, variant_id: 7, value_id: 16 },
    { id: 15, variant_id: 8, value_id: 12 },
    { id: 16, variant_id: 8, value_id: 17 },
    { id: 17, variant_id: 9, value_id: 18 },
    { id: 18, variant_id: 9, value_id: 21 },
    { id: 19, variant_id: 10, value_id: 19 },
    { id: 20, variant_id: 10, value_id: 22 },
    { id: 21, variant_id: 11, value_id: 20 },
    { id: 22, variant_id: 11, value_id: 23 },
    { id: 23, variant_id: 12, value_id: 18 },
    { id: 24, variant_id: 12, value_id: 25 },
    { id: 25, variant_id: 13, value_id: 19 },
    { id: 26, variant_id: 13, value_id: 26 },
    { id: 27, variant_id: 14, value_id: 20 },
    { id: 28, variant_id: 14, value_id: 27 },
    { id: 29, variant_id: 15, value_id: 18 },
    { id: 30, variant_id: 15, value_id: 32 },
    { id: 31, variant_id: 16, value_id: 19 },
    { id: 32, variant_id: 16, value_id: 33 },
    { id: 33, variant_id: 17, value_id: 20 },
    { id: 34, variant_id: 17, value_id: 22 },
    { id: 35, variant_id: 18, value_id: 18 },
    { id: 36, variant_id: 18, value_id: 34 },
    { id: 37, variant_id: 19, value_id: 19 },
    { id: 38, variant_id: 19, value_id: 35 },
    { id: 39, variant_id: 20, value_id: 20 },
    { id: 40, variant_id: 20, value_id: 27 },
    { id: 41, variant_id: 21, value_id: 15 },
  ] as ProductDetail[],

  addon_groups: [
    {
      id: 1,
      product_id: 4,
      name: 'Topping',
      max_choice: 2,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      product_id: 6,
      name: 'Topping',
      max_choice: 2,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ] as AddonGroup[],

  addons: [
    {
      id: 1,
      addon_group_id: 1,
      name: 'Thêm trân châu',
      price_adjust: 5000.00,
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      addon_group_id: 1,
      name: 'Thêm thạch',
      price_adjust: 5000.00,
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 3,
      addon_group_id: 1,
      name: 'Thêm kem',
      price_adjust: 7000.00,
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 4,
      addon_group_id: 1,
      name: 'Thêm pudding',
      price_adjust: 8000.00,
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 5,
      addon_group_id: 2,
      name: 'Thêm trân châu',
      price_adjust: 5000.00,
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 6,
      addon_group_id: 2,
      name: 'Thêm thạch',
      price_adjust: 5000.00,
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ] as Addon[],

  product_images: [
    {
      id: 1,
      product_id: 1,
      image_url: 'assets/images/iphone14_main.jpg',
      alt_text: 'iPhone 14 Pro Max Main',
      is_thumbnail: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      product_id: 1,
      image_url: 'assets/images/iphone14_side.jpg',
      alt_text: 'iPhone 14 Pro Max Side',
      is_thumbnail: false,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 3,
      product_id: 2,
      image_url: 'assets/images/spy-family-tshirt_main.jpg',
      alt_text: 'Spy × Family T-shirt Main',
      is_thumbnail: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 4,
      product_id: 3,
      image_url: 'assets/images/com-ga-pho-mai_main.jpg',
      alt_text: 'Cơm gà Tender Phô Mai Main',
      is_thumbnail: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 5,
      product_id: 4,
      image_url: 'assets/images/tra-sua-duong-den_main.jpg',
      alt_text: 'Trà sữa trân châu đường đen Main',
      is_thumbnail: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 6,
      product_id: 5,
      image_url: 'assets/images/com-ga-xoi-mo_main.jpg',
      alt_text: 'Cơm Gà Xối Mỡ Main',
      is_thumbnail: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 7,
      product_id: 6,
      image_url: 'assets/images/tra-sua-matcha_main.jpg',
      alt_text: 'Trà Sữa Matcha Main',
      is_thumbnail: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 8,
      product_id: 7,
      image_url: 'assets/images/tui-xach-da_main.jpg',
      alt_text: 'Túi xách da Main',
      is_thumbnail: true,
      created_at: '2025-02-01T00:00:00Z',
      updated_at: '2025-02-01T00:00:00Z',
    },
  ] as ProductImage[],

  product_reviews: [
    {
      id: 1,
      user_id: 1,
      variant_id: 1,
      rating: 5,
      comment: 'This is an amazing product!',
      created_at: '2020-07-02T15:29:00Z',
      updated_at: '2020-07-02T15:29:00Z',
    },
    {
      id: 2,
      user_id: 2,
      variant_id: 1,
      rating: 5,
      comment: 'Really satisfied with the performance.',
      created_at: '2020-07-02T13:06:00Z',
      updated_at: '2020-07-02T13:06:00Z',
    },
    {
      id: 3,
      user_id: 3,
      variant_id: 1,
      rating: 5,
      comment: 'Great camera and battery life.',
      created_at: '2020-06-26T22:05:00Z',
      updated_at: '2020-06-26T22:05:00Z',
    },
    {
      id: 4,
      user_id: 4,
      variant_id: 2,
      rating: 4,
      comment: 'Good product but a bit expensive.',
      created_at: '2020-07-07T10:14:00Z',
      updated_at: '2020-07-07T10:14:00Z',
    },
    {
      id: 5,
      user_id: 5,
      variant_id: 5,
      rating: 5,
      comment: 'Love the design and quality of the t-shirt.',
      created_at: '2020-08-12T08:45:00Z',
      updated_at: '2020-08-12T08:45:00Z',
    },
    {
      id: 6,
      user_id: 6,
      variant_id: 12,
      rating: 4,
      comment: 'Tasty bubble tea, but could be less sweet.',
      created_at: '2020-09-03T11:22:00Z',
      updated_at: '2020-09-03T11:22:00Z',
    },
  ] as ProductReview[],

  addresses: [
    {
      id: 1,
      user_id: 1,
      receiver_name: 'Darrell Steward',
      receiver_phone: '0901234567',
      street: '123 Đường Lê Lợi',
      ward: 'Bến Nghé',
      district: 'Quận 1',
      city: 'TP.HCM',
      is_default: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      user_id: 2,
      receiver_name: 'Darlene Robertson',
      receiver_phone: '0901234568',
      street: '45 Đường Nguyễn Huệ',
      ward: 'Bến Nghé',
      district: 'Quận 1',
      city: 'TP.HCM',
      is_default: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ] as Address[],

  discount_codes: [
    {
      id: 1,
      store_id: 1,
      max_uses: 100,
      used_count: 20,
      code: 'ELECTRO20',
      description: 'Giảm 20% cho đơn hàng điện tử từ 1,000,000 VNĐ',
      discount_type: 'percentage',
      discount_value: 20.00,
      min_order_amount: 1000000.00,
      max_discount_value: 500000.00,
      start_date: '2025-06-01',
      end_date: '2025-12-31',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      store_id: 2,
      max_uses: 200,
      used_count: 50,
      code: 'CHICKEN10',
      description: 'Giảm 10,000 VNĐ cho đơn hàng từ 50,000 VNĐ',
      discount_type: 'fixed',
      discount_value: 10000.00,
      min_order_amount: 50000.00,
      max_discount_value: 10000.00,
      start_date: '2025-06-01',
      end_date: '2025-09-30',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 3,
      store_id: 3,
      max_uses: 150,
      used_count: 30,
      code: 'MILKTEA15',
      description: 'Giảm 15% cho đơn hàng trà sữa từ 30,000 VNĐ',
      discount_type: 'percentage',
      discount_value: 15.00,
      min_order_amount: 30000.00,
      max_discount_value: 15000.00,
      start_date: '2025-06-01',
      end_date: '2025-11-30',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 4,
      store_id: 2,
      max_uses: 50,
      used_count: 10,
      code: 'FRIEDCHICKEN50',
      description: 'Giảm 50% cho đơn hàng từ 100,000 VNĐ, tối đa 30,000 VNĐ',
      discount_type: 'percentage',
      discount_value: 50.00,
      min_order_amount: 100000.00,
      max_discount_value: 30000.00,
      start_date: '2025-06-01',
      end_date: '2025-08-31',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 5,
      store_id: 3,
      max_uses: 80,
      used_count: 15,
      code: 'BUBBLETEA5K',
      description: 'Giảm 5,000 VNĐ cho mọi đơn hàng trà sữa',
      discount_type: 'fixed',
      discount_value: 5000.00,
      min_order_amount: 0.00,
      max_discount_value: 5000.00,
      start_date: '2025-06-01',
      end_date: '2025-10-31',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ] as DiscountCode[],

  cart_items: [
    {
      id: 1,
      user_id: 1,
      variant_id: 12,
      quantity: 2,
      created_at: '2025-06-01T00:00:00Z',
      updated_at: '2025-06-01T00:00:00Z',
    },
    {
      id: 2,
      user_id: 2,
      variant_id: 5,
      quantity: 1,
      created_at: '2025-06-01T00:00:00Z',
      updated_at: '2025-06-01T00:00:00Z',
    },
  ] as CartItem[],

  cart_item_addons: [
    {
      id: 1,
      cart_item_id: 1,
      addon_id: 1,
      created_at: '2025-06-01T00:00:00Z',
      updated_at: '2025-06-01T00:00:00Z',
    },
  ] as CartItemAddon[],

  orders: [
    {
      id: 1,
      customer_id: 1,
      store_id: 3,
      status: 'pending',
      shipping_method: 'standard',
      payment_method: 'cod',
      discount_code_id: 3,
      total_amount: 65000.00,
      note: 'Giao hàng trước 12h',
      created_at: '2025-06-01T00:00:00Z',
      updated_at: '2025-06-01T00:00:00Z',
    },
    {
      id: 2,
      customer_id: 2,
      store_id: 1,
      status: 'delivered',
      shipping_method: 'express',
      payment_method: 'online',
      discount_code_id: null,
      total_amount: 150000.00,
      note: null,
      created_at: '2025-05-01T00:00:00Z',
      updated_at: '2025-05-05T00:00:00Z',
    },
  ] as Order[],

  order_items: [
    {
      id: 1,
      variant_id: 12,
      order_id: 1,
      quantity: 2,
      price_at_time: 30000.00,
      created_at: '2025-06-01T00:00:00Z',
      updated_at: '2025-06-01T00:00:00Z',
    },
    {
      id: 2,
      variant_id: 5,
      order_id: 2,
      quantity: 1,
      price_at_time: 150000.00,
      created_at: '2025-05-01T00:00:00Z',
      updated_at: '2025-05-01T00:00:00Z',
    },
  ] as OrderItem[],

  order_item_addons: [
    {
      id: 1,
      order_item_id: 1,
      addon_id: 1,
      price_adjust_at_time: 5000.00,
      created_at: '2025-06-01T00:00:00Z',
    },
  ] as OrderItemAddon[],

  payment_transactions: [
    {
      id: 1,
      order_id: 2,
      gateway_name: 'momo',
      method: 'online',
      type: 'payment',
      status: 'completed',
      amount: 150000.00,
      currency_code: 'VND',
      transaction_code: 'MOMO20250501001',
      gateway_response: 'Payment successful',
      paid_at: '2025-05-01T01:00:00Z',
      created_at: '2025-05-01T00:00:00Z',
      updated_at: '2025-05-01T01:00:00Z',
    },
  ] as PaymentTransaction[],

  shipping_partners: [
    {
      id: 1,
      name: 'Giao Hàng Nhanh',
      api_endpoint: 'https://api.ghn.vn',
      logo_url: 'assets/images/ghn_logo.jpg',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Giao Hàng Tiết Kiệm',
      api_endpoint: 'https://api.ghtk.vn',
      logo_url: 'assets/images/ghtk_logo.jpg',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ] as ShippingPartner[],

  order_shipping: [
    {
      id: 1,
      order_id: 1,
      shipping_partner_id: 1,
      tracking_number: 'GHN123456789',
      estimated_delivery: '2025-06-03',
      shipping_status: 'pending',
      shipping_cost: 20000.00,
      pickup_name: 'Quán Trà Sữa 123',
      pickup_phone: '0901234569',
      pickup_address: '78 Đường Trần Hưng Đạo',
      pickup_province: 'TP.HCM',
      pickup_district: 'Quận 5',
      pickup_ward: 'Phường 2',
      delivery_name: 'Darrell Steward',
      delivery_phone: '0901234567',
      delivery_address: '123 Đường Lê Lợi',
      delivery_province: 'TP.HCM',
      delivery_district: 'Quận 1',
      delivery_ward: 'Bến Nghé',
      created_at: '2025-06-01T00:00:00Z',
      updated_at: '2025-06-01T00:00:00Z',
    },
    {
      id: 2,
      order_id: 2,
      shipping_partner_id: 2,
      tracking_number: 'GHTK987654321',
      estimated_delivery: '2025-05-03',
      shipping_status: 'delivered',
      shipping_cost: 25000.00,
      pickup_name: 'Cửa Hàng Điện Tử ABC',
      pickup_phone: '0901234570',
      pickup_address: '123 Đường Lê Lợi',
      pickup_province: 'TP.HCM',
      pickup_district: 'Quận 1',
      pickup_ward: 'Bến Nghé',
      delivery_name: 'Darlene Robertson',
      delivery_phone: '0901234568',
      delivery_address: '45 Đường Nguyễn Huệ',
      delivery_province: 'TP.HCM',
      delivery_district: 'Quận 1',
      delivery_ward: 'Bến Nghé',
      created_at: '2025-05-01T00:00:00Z',
      updated_at: '2025-05-05T00:00:00Z',
    },
  ] as OrderShipping[],

  conversations: [
    {
      id: 1,
      customer_id: 1,
      store_id: 3,
      created_at: '2025-06-01T00:00:00Z',
      updated_at: '2025-06-01T00:00:00Z',
    },
    {
      id: 2,
      customer_id: 1,
      store_id: 2,
      created_at: '2025-06-01T00:00:00Z',
      updated_at: '2025-06-01T00:00:00Z',
    },
    {
      id: 3,
      customer_id: 1,
      store_id: 1,
      created_at: '2025-06-01T00:00:00Z',
      updated_at: '2025-06-01T00:00:00Z',
    },
  ] as Conversation[],

  messages: [
    {
      id: 1,
      conversation_id: 1,
      sender_id: 1,
      message_text: 'Cho hỏi trà sữa có giao nhanh không?',
      created_at: '2025-06-01T00:05:00Z',
      imageUrl: 'cf_sua.png'
    },
    {
      id: 2,
      conversation_id: 1,
      sender_id: 4,
      message_text: 'Dạ, bên em có giao nhanh trong vòng 30 phút ạ!',
      created_at: '2025-06-01T00:10:00Z',
    },
    {
      id: 3,
      conversation_id: 1,
      sender_id: 1,
      message_text: 'Tuyệt vời, vậy mình đặt 2 ly trà sữa trân châu đường đen size M nhé!',
      created_at: '2025-06-01T00:12:00Z',
    },
    {
      id: 4,
      conversation_id: 1,
      sender_id: 4,
      message_text: 'Dạ, được ạ! Bạn muốn thêm topping không? Có trân châu, thạch, kem, pudding với giá 5k-8k ạ.',
      created_at: '2025-06-01T00:15:00Z',
    },
    {
      id: 5,
      conversation_id: 1,
      sender_id: 1,
      message_text: 'Thêm trân châu cho cả 2 ly nhé, cảm ơn shop!',
      created_at: '2025-06-01T00:17:00Z',
    },
    {
      id: 6,
      conversation_id: 1,
      sender_id: 4,
      message_text: 'Dạ, đã ghi nhận. Tổng cộng là 85k (70k + 15k topping). Bạn thanh toán COD hay online ạ?',
      created_at: '2025-06-01T00:20:00Z',
    },
    {
      id: 7,
      conversation_id: 1,
      sender_id: 1,
      message_text: 'COD nhé, giao đến 123 Đường Lê Lợi, Quận 1, TP.HCM.',
      created_at: '2025-06-01T00:22:00Z',
    },
    {
      id: 8,
      conversation_id: 1,
      sender_id: 4,
      message_text: 'Dạ, đã ghi nhận địa chỉ. Đơn hàng sẽ giao trong 30 phút nữa ạ. Có mã giảm giá MILKTEA15 nếu bạn muốn dùng!',
      created_at: '2025-06-01T00:25:00Z',
    },
    {
      id: 9,
      conversation_id: 1,
      sender_id: 1,
      message_text: 'Cảm ơn, mình dùng mã đó nhé. Có thể giao trước 1h không?',
      created_at: '2025-06-01T00:27:00Z',
    },
    {
      id: 10,
      conversation_id: 1,
      sender_id: 4,
      message_text: 'Dạ, bên em sẽ cố gắng giao trước 1h ạ. Sau khi giảm giá, tổng là 72.25k. Cảm ơn bạn!',
      created_at: '2025-06-01T00:30:00Z',
    },
    {
      id: 11,
      conversation_id: 1,
      sender_id: 1,
      message_text: 'Ok, mình chờ nhé. Có thể gửi ảnh thực tế của trà sữa không?',
      created_at: '2025-06-01T00:32:00Z',
    },
    {
      id: 12,
      conversation_id: 1,
      sender_id: 4,
      message_text: 'Dạ, đây là ảnh thực tế ạ:',
      created_at: '2025-06-01T00:35:00Z',
    },
    {
      id: 13,
      conversation_id: 1,
      sender_id: 1,
      message_text: 'Nhìn ngon quá, mong chờ quá! 😊',
      created_at: '2025-06-01T00:37:00Z',
    },
    {
      id: 14,
      conversation_id: 1,
      sender_id: 4,
      message_text: 'Cảm ơn bạn ạ! Đơn hàng đang được chuẩn bị, sẽ giao sớm nhất có thể!',
      created_at: '2025-06-01T00:40:00Z',
    },
    {
      id: 15,
      conversation_id: 1,
      sender_id: 1,
      message_text: 'Được, mình sẽ theo dõi. Có thể check trạng thái đơn không?',
      created_at: '2025-06-01T00:45:00Z',
    },
    {
      id: 16,
      conversation_id: 1,
      sender_id: 4,
      message_text: 'Dạ, hiện tại đơn hàng đang ở trạng thái chuẩn bị. Sẽ cập nhật khi shipper nhận ạ!',
      created_at: '2025-06-01T00:50:00Z',
    },
  ] as Message[],
};
