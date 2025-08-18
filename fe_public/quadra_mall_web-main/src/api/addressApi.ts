import { api } from '@/main';

// Lấy toàn bộ địa chỉ của user
export const getAllAddresses = async (): Promise<AddressDTO[]> => {
  const res = await api.get('/users/addresses');
  // Chuyển đổi field từ backend sang isDefault (boolean)
  return res.data.data.map((item: AddressDTO & { default?: boolean; is_default?: boolean }) => ({
    ...item,
    isDefault: !!(item.default || item.isDefault || item.is_default)
  }));
};
export const setDefaultAddress = async (addressId: number): Promise<AddressDTO> => {
  const res = await api.put(`/users/addresses/default/${addressId}`);
  return res.data.data;
};
export interface AddAddressRequest {
  receiverName: string;
  receiverPhone: string;
  detailAddress: string;
  ward: string;
  district: string;
  city: string;
  cityCode: string;
  wardCode: string;
  districtCode: string;
  isDefault: boolean;
}
export const createAddress = async (data: AddAddressRequest): Promise<AddressDTO> => {
  const res = await api.post('/users/addresses', data);
  return res.data.data;
};

export const updateAddress = async (id: number, data: AddAddressRequest): Promise<AddressDTO> => {
  const res = await api.put(`/users/addresses/${id}`, data);
  return res.data.data;
};

export const deleteAddress = async (id: number): Promise<void> => {
  await api.delete(`/users/addresses/${id}`);
};

export interface AddressDTO {
  id: number;
  receiverName: string;
  receiverPhone: string;
  detailAddress: string;
  ward: string;
  district: string;
  city: string;
  cityCode: string;
  wardCode: string;
  districtCode: string;
  isDefault: boolean;
}
