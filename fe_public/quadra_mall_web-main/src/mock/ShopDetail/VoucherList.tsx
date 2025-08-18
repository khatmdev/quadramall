// src/data/mockVouchers.ts

export interface Voucher {
  id: string;
  discount: string;
  description: string;
  stockText: string;
  validPeriod: string;
}

export const mockVouchers: Voucher[] = [
  {
    id: '1',
    discount: '50k',
    description: 'Áp dụng toàn bộ sản phẩm',
    stockText: 'Có sẵn trên 10',
    validPeriod: '2025.04.30 – 2025.05.31',
  },
  {
    id: '2',
    discount: '100k',
    description: 'Cho đơn từ 500k',
    stockText: 'Còn 5 lượt',
    validPeriod: '2025.04.30 – 2025.06.30',
  },
  {
    id: '3',
    discount: '30k',
    description: 'Áp dụng toàn bộ sản phẩm',
    stockText: 'Còn 20 lượt',
    validPeriod: '2025.05.01 – 2025.05.31',
  },
  {
    id: '4',
    discount: '20%',
    description: 'Giảm giá sản phẩm công nghệ',
    stockText: 'Còn 8 lượt',
    validPeriod: '2025.06.01 – 2025.06.30',
  },
];
