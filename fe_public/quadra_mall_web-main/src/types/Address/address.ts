export interface Address {
  id?: number;
  receiverName: string;
  receiverPhone: string;
  detailAddress: string;
  ward: string;
  district: string;
  city: string;
  wardCode: string;
  districtCode: string;
  cityCode: string;
  isDefault: boolean;
}