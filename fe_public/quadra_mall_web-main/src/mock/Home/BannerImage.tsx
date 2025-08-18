export interface Banner {
  id: number;
  image: string;
  description?: string;
  toUrl?: string;
  emoji?: string; // ✅ Trường emoji mới
}

export const bannerImages: Banner[] = [
  {
    id: 1,
    image: "/assets/banner.jpg",
    description: "Nâng tầm phong cách với bộ sưu tập thời trang nữ mới nhất. Mua ngay để nhận ưu đãi hấp dẫn!",
    toUrl: "/danh-muc/thoi-trang-nu",
    emoji: "👗" // 👗 Váy - thời trang nữ
  },
  {
    id: 2,
    image: "/assets/banner2.jpg",
    description: "Chào hè rực rỡ với những món đồ không thể thiếu! Khám phá ngay bộ sưu tập mùa hè 2025.",
    toUrl: "/khuyen-mai/mua-he-2025",
    emoji: "🌞" // 🌞 Mùa hè
  },
  {
    id: 3,
    image: "/assets/anh-doanh-nhan.webp",
    description: "Trang phục công sở cao cấp - Định hình phong thái chuyên nghiệp và đẳng cấp.",
    toUrl: "/danh-muc/thoi-trang-cong-so",
    emoji: "💼" // 💼 Cặp công sở
  }
];

