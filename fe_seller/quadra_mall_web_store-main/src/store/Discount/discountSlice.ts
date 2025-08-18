// store/discountSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  discountService, 
  CreateDiscountCodeRequest, 
  UpdateDiscountCodeRequest,
  DiscountCodeDTO,
  DiscountCodeListResponse,
  ProductDTO
} from '@/services/discountService';

interface DiscountState {
  discounts: DiscountCodeDTO[];
  products: ProductDTO[];
  pagination: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
    isFirst: boolean;
    isLast: boolean;
  };
  isLoading: boolean;
  error: string | null;
  filters: {
    search: string;
    appliesTo: 'all' | 'SHOP' | 'PRODUCTS';
    isActive: 'all' | 'active' | 'inactive';
    sortBy: string;
    sortDirection: 'asc' | 'desc';
  };
  selectedDiscount: DiscountCodeDTO | null;
  isModalOpen: boolean;
}

// Async thunks
export const fetchDiscountCodes = createAsyncThunk(
  'discounts/fetchAll',
  async ({ 
    storeId, 
    page = 0, 
    size = 10, 
    sortBy = 'createdAt', 
    sortDirection = 'desc' 
  }: {
    storeId: number;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }) => {
    const response = await discountService.getDiscountCodesByStore(storeId, page, size, sortBy, sortDirection);
    return response;
  }
);

export const searchDiscountCodes = createAsyncThunk(
  'discounts/search',
  async ({ 
    storeId, 
    keyword, 
    page = 0, 
    size = 10 
  }: {
    storeId: number;
    keyword: string;
    page?: number;
    size?: number;
  }) => {
    const response = await discountService.searchDiscountCodes(storeId, keyword, page, size);
    return response;
  }
);

export const fetchProducts = createAsyncThunk(
  'discounts/fetchProducts',
  async (storeId: number) => {
    const response = await discountService.getStoreProducts(storeId);
    return response.data || response;
  }
);

export const fetchDiscountDetail = createAsyncThunk(
  'discounts/fetchDetail',
  async (discountId: number) => {
    const response = await discountService.getDiscountCodeById(discountId);
    return response.data || response;
  }
);

export const createDiscountCode = createAsyncThunk(
  'discounts/create',
  async (data: CreateDiscountCodeRequest) => {
    const response = await discountService.createDiscountCode(data);
    return response.data || response;
  }
);

export const updateDiscountCode = createAsyncThunk(
  'discounts/update',
  async ({ id, data }: { id: number; data: UpdateDiscountCodeRequest }) => {
    const response = await discountService.updateDiscountCode(id, data);
    return response.data || response;
  }
);

export const deleteDiscountCode = createAsyncThunk(
  'discounts/delete',
  async (id: number) => {
    await discountService.deleteDiscountCode(id);
    return id;
  }
);

export const toggleDiscountStatus = createAsyncThunk(
  'discounts/toggleStatus',
  async ({ id, isActive }: { id: number; isActive: boolean }) => {
    await discountService.toggleDiscountCodeStatus(id, isActive);
    return { id, isActive };
  }
);

const initialState: DiscountState = {
  discounts: [],
  products: [],
  pagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
    isFirst: true,
    isLast: true,
  },
  isLoading: false,
  error: null,
  filters: {
    search: '',
    appliesTo: 'all',
    isActive: 'all',
    sortBy: 'createdAt',
    sortDirection: 'desc'
  },
  selectedDiscount: null,
  isModalOpen: false
};

const discountSlice = createSlice({
  name: 'discounts',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<DiscountState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedDiscount: (state, action: PayloadAction<DiscountCodeDTO | null>) => {
      state.selectedDiscount = action.payload;
    },
    setModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isModalOpen = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Helper function to handle API response structure
    const handleApiResponse = (response: any): DiscountCodeListResponse => {
      if (response.data) {
        return response.data;
      }
      return response;
    };

    // Fetch discount codes
    builder
      .addCase(fetchDiscountCodes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDiscountCodes.fulfilled, (state, action) => {
        state.isLoading = false;
        const response = handleApiResponse(action.payload);
        
        console.log('Raw API Response:', response); // Debug log
        
        state.discounts = response.discountCodes || [];
        state.pagination = {
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0,
          currentPage: response.currentPage || 0,
          pageSize: response.pageSize || 10,
          hasNext: response.hasNext || false,
          hasPrevious: response.hasPrevious || false,
          isFirst: response.isFirst !== undefined ? response.isFirst : true,
          isLast: response.isLast !== undefined ? response.isLast : true,
        };
        state.error = null;
        
        console.log('Updated state discounts:', state.discounts); // Debug log
      })
      .addCase(fetchDiscountCodes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Có lỗi xảy ra khi tải danh sách mã giảm giá';
        console.error('Fetch discounts error:', action.error);
      })

      // Search discount codes
      .addCase(searchDiscountCodes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchDiscountCodes.fulfilled, (state, action) => {
        state.isLoading = false;
        const response = handleApiResponse(action.payload);
        state.discounts = response.discountCodes || [];
        state.pagination = {
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0,
          currentPage: response.currentPage || 0,
          pageSize: response.pageSize || 10,
          hasNext: response.hasNext || false,
          hasPrevious: response.hasPrevious || false,
          isFirst: response.isFirst !== undefined ? response.isFirst : true,
          isLast: response.isLast !== undefined ? response.isLast : true,
        };
        state.error = null;
      })
      .addCase(searchDiscountCodes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Có lỗi xảy ra khi tìm kiếm mã giảm giá';
      })

      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        // Don't set loading for products
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload || [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        console.error('Fetch products error:', action.error);
        // Don't set error for products as it's optional
      })

      // Fetch discount detail
      .addCase(fetchDiscountDetail.fulfilled, (state, action) => {
        state.selectedDiscount = action.payload;
      })

      // Create discount code
      .addCase(createDiscountCode.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createDiscountCode.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.discounts.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(createDiscountCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Có lỗi xảy ra khi tạo mã giảm giá';
      })

      // Update discount code
      .addCase(updateDiscountCode.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateDiscountCode.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          const index = state.discounts.findIndex(d => d.id === action.payload.id);
          if (index !== -1) {
            state.discounts[index] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(updateDiscountCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Có lỗi xảy ra khi cập nhật mã giảm giá';
      })

      // Delete discount code
      .addCase(deleteDiscountCode.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteDiscountCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.discounts = state.discounts.filter(d => d.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteDiscountCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Có lỗi xảy ra khi xóa mã giảm giá';
      })

      // Toggle status
      .addCase(toggleDiscountStatus.fulfilled, (state, action) => {
        const discount = state.discounts.find(d => d.id === action.payload.id);
        if (discount) {
          discount.isActive = action.payload.isActive;
        }
      })
      .addCase(toggleDiscountStatus.rejected, (state, action) => {
        state.error = action.error.message || 'Có lỗi xảy ra khi thay đổi trạng thái mã giảm giá';
      });
  }
});

export const {
  setFilters,
  setSelectedDiscount,
  setModalOpen,
  clearError
} = discountSlice.actions;

export default discountSlice.reducer;

// Export types
export type { DiscountCodeDTO, ProductDTO };