import { api } from '@/main';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types based on backend DTOs
export interface ShipperRegistration {
  id: number;
  userFullName: string;
  userEmail: string;
  vehicleType: 'MOTORBIKE' | 'CAR' | 'BICYCLE';
  licensePlate: string;
  idCardNumber: string;
  idCardFrontUrl: string;
  idCardBackUrl: string;
  driverLicenseUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApproveShipperRequest {
  note?: string;
}

export interface RejectShipperRequest {
  rejectionReason: string;
}

export interface ShipperState {
  pendingRegistrations: {
    content: ShipperRegistration[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
  };
  loading: boolean;
  error: string | null;
  selectedRegistration: ShipperRegistration | null;
  actionLoading: boolean;
}

const initialState: ShipperState = {
  pendingRegistrations: {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: true,
  },
  loading: false,
  error: null,
  selectedRegistration: null,
  actionLoading: false,
};

// Async thunks
export const fetchPendingRegistrations = createAsyncThunk(
  'shipper/fetchPendingRegistrations',
  async (params: { page?: number; size?: number; sort?: string } = {}) => {
    const { page = 0, size = 10, sort = 'createdAt,desc' } = params;
    const response = await api.get('/admin/shipper/registrations/pending', {
      params: { page, size, sort },
    });
    return response.data;
  }
);

export const approveShipper = createAsyncThunk(
  '/shipper/approveShipper',
  async ({
    registrationId,
    request,
  }: {
    registrationId: number;
    request?: ApproveShipperRequest;
  }) => {
    const response = await api.post(
      `/admin/shipper/approve/${registrationId}`,
      request || {}
    );
    return { registrationId, message: response.data };
  }
);

export const rejectShipper = createAsyncThunk(
  '/admin/shipper/rejectShipper',
  async ({
    registrationId,
    request,
  }: {
    registrationId: number;
    request: RejectShipperRequest;
  }) => {
    const response = await api.post(
      `/admin/shipper/reject/${registrationId}`,
      request
    );
    return { registrationId, message: response.data };
  }
);

const shipperSlice = createSlice({
  name: 'shipper',
  initialState,
  reducers: {
    setSelectedRegistration: (state, action: PayloadAction<ShipperRegistration | null>) => {
      state.selectedRegistration = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetShipperState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch pending registrations
      .addCase(fetchPendingRegistrations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingRegistrations.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingRegistrations = action.payload;
      })
      .addCase(fetchPendingRegistrations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Có lỗi xảy ra khi tải danh sách đăng ký';
      })
      
      // Approve shipper
      .addCase(approveShipper.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(approveShipper.fulfilled, (state, action) => {
        state.actionLoading = false;
        // Remove approved registration from pending list
        state.pendingRegistrations.content = state.pendingRegistrations.content.filter(
          (reg) => reg.id !== action.payload.registrationId
        );
        state.pendingRegistrations.totalElements -= 1;
      })
      .addCase(approveShipper.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message || 'Có lỗi xảy ra khi duyệt đăng ký';
      })
      
      // Reject shipper
      .addCase(rejectShipper.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(rejectShipper.fulfilled, (state, action) => {
        state.actionLoading = false;
        // Remove rejected registration from pending list
        state.pendingRegistrations.content = state.pendingRegistrations.content.filter(
          (reg) => reg.id !== action.payload.registrationId
        );
        state.pendingRegistrations.totalElements -= 1;
      })
      .addCase(rejectShipper.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message || 'Có lỗi xảy ra khi từ chối đăng ký';
      });
  },
});

export const { setSelectedRegistration, clearError, resetShipperState } = shipperSlice.actions;

// Selectors
export const selectPendingRegistrations = (state: { shipper: ShipperState }) => 
  state.shipper.pendingRegistrations;
export const selectShipperLoading = (state: { shipper: ShipperState }) => 
  state.shipper.loading;
export const selectShipperError = (state: { shipper: ShipperState }) => 
  state.shipper.error;
export const selectSelectedRegistration = (state: { shipper: ShipperState }) => 
  state.shipper.selectedRegistration;
export const selectActionLoading = (state: { shipper: ShipperState }) => 
  state.shipper.actionLoading;

export default shipperSlice.reducer;