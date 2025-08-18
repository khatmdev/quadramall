import { ProductDto } from '@/types/store_detail/interfaces';

export function sortProducts(products: ProductDto[], sort: string): ProductDto[] {
  const sorted = [...products];
  switch (sort) {
    case 'comprehensive':
      return sorted; // Không sắp xếp, giữ nguyên thứ tự từ API
    case 'best_selling':
      sorted.sort((a, b) => b.soldCount - a.soldCount);
      break;
    case 'newest':
      sorted.sort((a, b) => b.id - a.id); // Giả định id lớn hơn là mới hơn
      break;
    case 'price_asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    default:
      return sorted;
  }
  return sorted;
}
