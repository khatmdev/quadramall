// src/types/category.ts
export interface Category {
  id: number;
  name: string;
  level: number;
  children: Category[];
}

export interface PendingShop {
  id: number;
  shopName: string;
  ownerName: string;
  email: string;
  phone: string;
  taxId: string;
  idCardNumber: string; 
  idCardFront: string;
  idCardBack: string;
  registeredAt: string;
  status: 'pending' | 'approved' | 'rejected';
  isLocked?: boolean;
}