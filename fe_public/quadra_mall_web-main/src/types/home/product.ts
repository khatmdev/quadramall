export interface ProductCardDTO {
  id: number;
  name: string;
  slug: string;
  price: number;
  thumbnailUrl: string;
  rating: number;
  soldCount: number;
  isFav: boolean;
  seller: {
    id: number;
    name: string;
    province: string;
    slug: string;
  };
}