import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { api } from '@/main';
import { ShipperRegistrationRequest, ShipperRegistrationResponse, ShipperRegistrationStatusResponse } from '@/types/Shipper/shipper';

interface ShipperState {
  registration: ShipperRegistrationResponse | null;
  registrationStatus: ShipperRegistrationStatusResponse | null;
  stats: any | null;
  loading: boolean;
  uploadingImages: boolean;
  error: string | null;
}

const initialState: ShipperState = {
  registration: null,
  registrationStatus: null,
  stats: null,
  loading: false,
  uploadingImages: false,
  error: null,
};

// Async thunks
export const registerShipper = createAsyncThunk<
  ShipperRegistrationResponse,
  ShipperRegistrationRequest,
  { rejectValue: string }
>('shipper/register', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post('/api/shipper/register', payload);
    return response.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      return rejectWithValue(err.response?.data?.message || 'Đăng ký thất bại');
    }
    return rejectWithValue('Đăng ký thất bại do lỗi không xác định');
  }
});

export const getShipperStats = createAsyncThunk<
  any,
  void,
  { rejectValue: string }
>('shipper/getStats', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/api/shipper/stats');
    return response.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      return rejectWithValue(err.response?.data?.message || 'Lấy thống kê thất bại');
    }
    return rejectWithValue('Lấy thống kê thất bại do lỗi không xác định');
  }
});

// ✅ Get registration status (works for all registered users)
export const getRegistrationStatus = createAsyncThunk<
  ShipperRegistrationStatusResponse,
  void,
  { rejectValue: string }
>('shipper/getRegistrationStatus', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/api/shipper/registration-status');
    return response.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      // Nếu là lỗi 404 (chưa đăng ký), return null thay vì reject
      if (err.response?.status === 404) {
        return rejectWithValue('NOT_REGISTERED');
      }
      const message = err.response?.data?.message || 'Lấy trạng thái đăng ký thất bại';
      return rejectWithValue(message);
    }
    return rejectWithValue('Lấy trạng thái đăng ký thất bại do lỗi không xác định');
  }
});

const shipperSlice = createSlice({
  name: 'shipper',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUploadingImages: (state, action: PayloadAction<boolean>) => {
      state.uploadingImages = action.payload;
    },
    clearRegistrationStatus: (state) => {
      state.registrationStatus = null;
    },
    clearRegistration: (state) => {
      state.registration = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register shipper
      .addCase(registerShipper.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerShipper.fulfilled, (state, action) => {
        state.loading = false;
        state.registration = action.payload;
        // Cập nhật registrationStatus nếu có response từ register
        if (action.payload) {
          state.registrationStatus = {
            registrationId: action.payload.id,
            userFullName: action.payload.userFullName,
            userEmail: action.payload.userEmail,
            vehicleType: action.payload.vehicleType,
            licensePlate: action.payload.licensePlate,
            idCardNumber: action.payload.idCardNumber,
            status: action.payload.status,
            rejectionReason: action.payload.rejectionReason,
            registrationCreatedAt: action.payload.createdAt,
            registrationUpdatedAt: action.payload.updatedAt,
          };
        }
        state.error = null;
      })
      .addCase(registerShipper.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get stats (only for approved shippers)
      .addCase(getShipperStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getShipperStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(getShipperStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get registration status
      .addCase(getRegistrationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRegistrationStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationStatus = action.payload;
        state.error = null;
      })
      .addCase(getRegistrationStatus.rejected, (state, action) => {
        state.loading = false;
        // Nếu chưa đăng ký, set registrationStatus = null
        if (action.payload === 'NOT_REGISTERED') {
          state.registrationStatus = null;
          state.error = null; // Không hiển thị error cho trường hợp chưa đăng ký
        } else {
          state.error = action.payload as string;
        }
      });
  },
});

export const { 
  clearError, 
  setUploadingImages, 
  clearRegistrationStatus, 
  clearRegistration 
} = shipperSlice.actions;

export default shipperSlice.reducer;