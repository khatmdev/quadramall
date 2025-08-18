import apiClient from '@/api/config/apiClient';
import { Address } from '@/types/Order/interface';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface AddressState {
  addresses: Address[];
  defaultAddress: Address | null;
  loading: boolean;
  error: string | null;
}

// Hàm map 'default' → 'isDefault'
const mapAddress = (addr: any): Address => ({
  ...addr,
  isDefault: !!(addr.default || addr.isDefault || addr.is_default), // Chuyển đổi field từ backend
});

// Thunk: lấy danh sách địa chỉ
export const fetchAddresses = createAsyncThunk('address/fetchAddresses', async () => {
  const response = await apiClient.get('/users/addresses');
  const raw = response.data.data;
  const mapped = raw.map(mapAddress);
  return mapped;
});

// Thunk: lấy địa chỉ mặc định
export const fetchAddressesDefault = createAsyncThunk('address/fetchAddressesDefault', async () => {
  const response = await apiClient.get('/users/addresses/default');
  return mapAddress(response.data.data);
});

// Thunk: thêm địa chỉ mới
export const addAddress = createAsyncThunk('users/addresses/addAddress', async (address: any) => {
  const response = await apiClient.post('/users/addresses', address);
  return mapAddress(response.data.data);
});

// Thunk: cập nhật địa chỉ
export const updateAddress = createAsyncThunk(
  'address/updateAddress',
  async ({ id, address }: { id: number; address: any }) => {
    const response = await apiClient.put(`/users/addresses/${id}`, address);
    return mapAddress(response.data.data);
  }
);

// Thunk: xóa địa chỉ
export const deleteAddress = createAsyncThunk('address/deleteAddress', async (id: number) => {
  await apiClient.delete(`/users/addresses/${id}`);
  return id;
});

// Thunk: đặt địa chỉ mặc định
export const setDefaultAddress = createAsyncThunk('address/setDefaultAddress', async (id: number) => {
  const response = await apiClient.put(`/users/addresses/default/${id}`);
  return mapAddress(response.data.data);
});

const addressSlice = createSlice({
  name: 'address',
  initialState: {
    addresses: [],
    defaultAddress: null,
    loading: false,
    error: null,
  } as AddressState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchAddresses
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch addresses';
      })
      // fetchAddressesDefault
      .addCase(fetchAddressesDefault.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddressesDefault.fulfilled, (state, action) => {
        state.loading = false;
        state.defaultAddress = action.payload;
        // Đồng bộ với addresses nếu cần
        if (action.payload) {
          state.addresses = state.addresses.map(addr =>
            addr.id === action.payload.id
              ? { ...addr, isDefault: true }
              : { ...addr, isDefault: false }
          );
        }
      })
      .addCase(fetchAddressesDefault.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch default address';
      })
      // addAddress
      .addCase(addAddress.fulfilled, (state, action) => {
        state.addresses.push(action.payload);
        if (action.payload.isDefault) {
          // Set default duy nhất, tối ưu caching
          state.addresses = state.addresses.map(addr =>
            addr.id === action.payload.id ? action.payload : { ...addr, isDefault: false }
          );
          state.defaultAddress = action.payload;
        }
      })
      // updateAddress
      .addCase(updateAddress.fulfilled, (state, action) => {
        const index = state.addresses.findIndex(addr => addr.id === action.payload.id);
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
        if (action.payload.isDefault) {
          // Set default duy nhất
          state.addresses = state.addresses.map(addr =>
            addr.id === action.payload.id ? action.payload : { ...addr, isDefault: false }
          );
          state.defaultAddress = action.payload;
        }
      })
      // deleteAddress
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter(addr => addr.id !== action.payload);
        if (state.defaultAddress?.id === action.payload) {
          state.defaultAddress = null;
        }
      })
      // setDefaultAddress
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.map(addr =>
          addr.id === action.payload.id
            ? { ...addr, isDefault: true }
            : { ...addr, isDefault: false }
        );
        state.defaultAddress = action.payload;
      });
  },
});

export default addressSlice.reducer;