export interface FlashSaleProductDTO {
  id: number;
  name: string;
  originPrice: number;         // giá khuyến mãi
  price: number;      // giá gốc
  percentageDiscount: number;
  thumbnailUrl: string;  // ảnh thumbnail
  quantity: number;
  soldCount: number;          // đã bán
  slug: string;
  seller: {
    id: number;
    name: string;
    province: string;
    slug: string;
  };
  endTimeStr: string;
}
