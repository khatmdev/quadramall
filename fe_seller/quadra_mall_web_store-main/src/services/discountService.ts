// services/discountService.ts - TIMEZONE FIXED VERSION
import { api } from '@/main';
import { format, parseISO, addDays, addWeeks, isAfter, isBefore } from 'date-fns';
import { vi } from 'date-fns/locale';

export interface CreateDiscountCodeRequest {
  storeId: number;
  quantity: number;
  maxUses: number;
  usagePerCustomer?: number;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountValue?: number;
  startDate: string; // ISO string for API
  endDate: string; // ISO string for API
  appliesTo: 'SHOP' | 'PRODUCTS';
  autoApply?: boolean;
  priority?: number;
  productIds?: number[];
}

export interface UpdateDiscountCodeRequest {
  description?: string;
  discountValue?: number;
  minOrderAmount?: number;
  maxDiscountValue?: number;
  startDate?: string;
  endDate?: string;
  autoApply?: boolean;
  priority?: number;
  productIds?: number[];
  isActive?: boolean;
}

// API Response structure
export interface DiscountCodeDTO {
  id: number;
  storeId: number;
  storeName?: string;
  quantity: number;
  maxUses: number;
  usedCount: number;
  usagePerCustomer: number;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountValue?: number;
  startDate: string; // Backend format từ LocalDateTime
  endDate: string;   // Backend format từ LocalDateTime
  appliesTo: 'SHOP' | 'PRODUCTS';
  autoApply: boolean;
  priority: number;
  createdBy: number;
  createdByName: string;
  productIds?: number[];
  productNames?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountCodeListResponse {
  discountCodes: DiscountCodeDTO[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isFirst: boolean;
  isLast: boolean;
}

export interface ProductDTO {
  id: number;
  name: string;
  image: string;
  totalStock: number;
  itemType: string;
  minPrice: number;
  maxPrice: number;
  status: boolean;
}

// ===== TIMEZONE AWARE DATETIME UTILITY FUNCTIONS =====

// Vietnam timezone offset: UTC+7
const VIETNAM_TIMEZONE_OFFSET = 7 * 60; // minutes

/**
 * Get Vietnam time offset in minutes
 */
const getVietnamTimezoneOffset = (): number => {
  return VIETNAM_TIMEZONE_OFFSET;
};

/**
 * Convert backend datetime string to local Vietnam time for datetime-local input
 * Backend sends: "2024-12-25T14:30:00" (treated as Vietnam local time)
 * Output: "2024-12-25T14:30" (for datetime-local input)
 */
export const parseBackendDateTimeToLocal = (backendDateTime: string): string => {
  if (!backendDateTime) return '';
  
  try {
    console.log('🔄 Parsing backend datetime:', backendDateTime);
    
    // Clean the datetime string - remove any timezone info if present
    let cleanDateTime = backendDateTime;
    if (cleanDateTime.includes('Z') || cleanDateTime.includes('+') || cleanDateTime.includes('T') && cleanDateTime.length > 19) {
      // If it has timezone info, parse as ISO and convert to Vietnam time
      const date = parseISO(backendDateTime);
      
      // Convert to Vietnam timezone (UTC+7)
      const vietnamTime = new Date(date.getTime() + (VIETNAM_TIMEZONE_OFFSET * 60 * 1000));
      cleanDateTime = format(vietnamTime, "yyyy-MM-dd'T'HH:mm:ss");
    }
    
    // Extract just the date and time part for datetime-local
    const datetimeLocal = cleanDateTime.substring(0, 16); // "2024-12-25T14:30"
    
    console.log('✅ Converted to datetime-local:', datetimeLocal);
    return datetimeLocal;
  } catch (error) {
    console.error('❌ Error parsing backend datetime:', backendDateTime, error);
    return '';
  }
};

/**
 * Convert datetime-local input to backend format (Vietnam local time)
 * Input: "2024-12-25T14:30" (Vietnam local time from user)
 * Output: "2024-12-25T14:30:00" (for backend, treated as Vietnam time)
 */
export const convertLocalToBackendDateTime = (dateTimeLocal: string): string => {
  if (!dateTimeLocal) return '';
  
  try {
    console.log('🔄 Converting local datetime to backend:', dateTimeLocal);
    
    // Add seconds if not present
    const fullDateTime = dateTimeLocal.includes(':') && dateTimeLocal.split(':').length === 2 
      ? dateTimeLocal + ':00' 
      : dateTimeLocal;
    
    console.log('✅ Backend datetime format:', fullDateTime);
    return fullDateTime;
  } catch (error) {
    console.error('❌ Error converting local to backend datetime:', dateTimeLocal, error);
    return '';
  }
};

/**
 * Format datetime for display in Vietnam timezone
 */
export const formatDateTimeDisplay = (backendDateTime: string): string => {
  if (!backendDateTime) return '';
  
  try {
    // Parse backend datetime as Vietnam local time
    let displayDate: Date;
    
    if (backendDateTime.includes('Z') || backendDateTime.includes('+')) {
      // Has timezone info - convert to Vietnam time
      displayDate = parseISO(backendDateTime);
      displayDate = new Date(displayDate.getTime() + (VIETNAM_TIMEZONE_OFFSET * 60 * 1000));
    } else {
      // No timezone info - treat as Vietnam local time
      const isoString = backendDateTime.includes('T') ? backendDateTime : backendDateTime + 'T00:00:00';
      displayDate = new Date(isoString);
    }
    
    if (isNaN(displayDate.getTime())) {
      return 'Invalid Date';
    }
    
    return format(displayDate, 'EEEE, dd/MM/yyyy HH:mm', { locale: vi });
  } catch (error) {
    console.error('❌ Error formatting datetime display:', backendDateTime, error);
    return 'Invalid Date';
  }
};

/**
 * Format date only for display
 */
export const formatDateOnly = (backendDateTime: string): string => {
  if (!backendDateTime) return '';
  
  try {
    let displayDate: Date;
    
    if (backendDateTime.includes('Z') || backendDateTime.includes('+')) {
      displayDate = parseISO(backendDateTime);
      displayDate = new Date(displayDate.getTime() + (VIETNAM_TIMEZONE_OFFSET * 60 * 1000));
    } else {
      const isoString = backendDateTime.includes('T') ? backendDateTime : backendDateTime + 'T00:00:00';
      displayDate = new Date(isoString);
    }
    
    if (isNaN(displayDate.getTime())) {
      return 'Invalid Date';
    }
    
    return format(displayDate, 'dd/MM/yyyy', { locale: vi });
  } catch (error) {
    console.error('❌ Error formatting date:', backendDateTime, error);
    return 'Invalid Date';
  }
};

/**
 * Create default datetime values for new discount (Vietnam time)
 */
export const createDefaultDateTimeValues = () => {
  // Get current Vietnam time
  const now = new Date();
  const vietnamNow = new Date(now.getTime() + (VIETNAM_TIMEZONE_OFFSET * 60 * 1000));
  
  // Start date: tomorrow at 00:00 Vietnam time
  const startDate = addDays(vietnamNow, 1);
  startDate.setHours(0, 0, 0, 0);
  
  // End date: next week at 23:59 Vietnam time
  const endDate = addWeeks(startDate, 1);
  endDate.setHours(23, 59, 0, 0);
  
  const startLocal = format(startDate, "yyyy-MM-dd'T'HH:mm");
  const endLocal = format(endDate, "yyyy-MM-dd'T'HH:mm");
  
  console.log('🕒 Created default Vietnam time values:', { startLocal, endLocal });
  
  return {
    startDate: startLocal,
    endDate: endLocal
  };
};

/**
 * Validate datetime range
 */
export const validateDateTimeRange = (startDateLocal: string, endDateLocal: string, isNewDiscount = true) => {
  const errors: { [key: string]: string } = {};
  
  if (!startDateLocal) {
    errors.startDate = 'Ngày giờ bắt đầu là bắt buộc';
    return errors;
  }
  
  if (!endDateLocal) {
    errors.endDate = 'Ngày giờ kết thúc là bắt buộc';
    return errors;
  }
  
  try {
    const startDate = new Date(startDateLocal);
    const endDate = new Date(endDateLocal);
    
    // Get current Vietnam time for comparison
    const now = new Date();
    const vietnamNow = new Date(now.getTime() + (VIETNAM_TIMEZONE_OFFSET * 60 * 1000));
    
    if (isNaN(startDate.getTime())) {
      errors.startDate = 'Ngày giờ bắt đầu không hợp lệ';
      return errors;
    }
    
    if (isNaN(endDate.getTime())) {
      errors.endDate = 'Ngày giờ kết thúc không hợp lệ';
      return errors;
    }
    
    if (!isAfter(endDate, startDate)) {
      errors.endDate = 'Ngày giờ kết thúc phải sau ngày giờ bắt đầu';
    }
    
    // Only validate future start date for new discounts (compare with Vietnam time)
    if (isNewDiscount && isBefore(startDate, vietnamNow)) {
      errors.startDate = 'Ngày giờ bắt đầu phải trong tương lai (giờ Việt Nam)';
    }
  } catch (error) {
    console.error('❌ Error validating datetime range:', error);
    errors.general = 'Có lỗi khi validate thời gian';
  }
  
  return errors;
};

/**
 * Get discount status with Vietnam timezone awareness
 */
export const getDiscountStatus = (discount: DiscountCodeDTO) => {
  try {
    const now = new Date();
    const vietnamNow = new Date(now.getTime() + (VIETNAM_TIMEZONE_OFFSET * 60 * 1000));
    
    // Parse dates as Vietnam local time
    const startDate = new Date(discount.startDate.includes('T') ? discount.startDate : discount.startDate + 'T00:00:00');
    const endDate = new Date(discount.endDate.includes('T') ? discount.endDate : discount.endDate + 'T00:00:00');
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return {
        status: 'invalid',
        text: 'Thời gian không hợp lệ',
        color: 'text-gray-600 bg-gray-100'
      };
    }
    
    if (!discount.isActive) {
      return {
        status: 'paused',
        text: 'Tạm dừng',
        color: 'text-yellow-600 bg-yellow-100'
      };
    }
    
    if (isBefore(vietnamNow, startDate)) {
      return {
        status: 'scheduled',
        text: 'Chưa bắt đầu',
        color: 'text-blue-600 bg-blue-100'
      };
    }
    
    if (isAfter(vietnamNow, endDate)) {
      return {
        status: 'expired',
        text: 'Hết hạn',
        color: 'text-red-600 bg-red-100'
      };
    }
    
    return {
      status: 'active',
      text: 'Đang hoạt động',
      color: 'text-green-600 bg-green-100'
    };
  } catch (error) {
    console.error('❌ Error getting discount status:', error);
    return {
      status: 'error',
      text: 'Lỗi trạng thái',
      color: 'text-gray-600 bg-gray-100'
    };
  }
};

/**
 * Preview datetime in Vietnam timezone
 */
export const previewDateTimeFromLocal = (dateTimeLocal: string): string => {
  if (!dateTimeLocal) return '';
  
  try {
    const date = new Date(dateTimeLocal);
    if (isNaN(date.getTime())) return 'Invalid DateTime';
    
    return format(date, 'EEEE, dd/MM/yyyy HH:mm', { locale: vi }) + ' (Giờ Việt Nam)';
  } catch (error) {
    console.error('❌ Error previewing datetime:', dateTimeLocal, error);
    return 'Invalid DateTime';
  }
};

// ===== API SERVICE FUNCTIONS =====

export const discountService = {
  // Create discount code
  createDiscountCode: async (data: CreateDiscountCodeRequest) => {
    console.log('🚀 Creating discount code with Vietnam timezone data:', data);
    const response = await api.post('/seller/discounts', data);
    return response.data;
  },

  // Update discount code
  updateDiscountCode: async (id: number, data: UpdateDiscountCodeRequest) => {
    console.log('🔄 Updating discount code with Vietnam timezone data:', data);
    const response = await api.put(`/seller/discounts/${id}`, data);
    return response.data;
  },

  // Get discount code by ID
  getDiscountCodeById: async (id: number) => {
    const response = await api.get(`/seller/discounts/${id}`);
    return response.data;
  },

  // Get discount codes by store
  getDiscountCodesByStore: async (
    storeId: number,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDirection: string = 'desc'
  ) => {
    const response = await api.get(`/seller/discounts/store/${storeId}`, {
      params: { page, size, sortBy, sortDirection }
    });
    return response.data;
  },

  // Search discount codes
  searchDiscountCodes: async (
    storeId: number,
    keyword: string,
    page: number = 0,
    size: number = 10
  ) => {
    const response = await api.get(`/seller/discounts/store/${storeId}/search`, {
      params: { keyword, page, size }
    });
    return response.data;
  },

  // Delete discount code
  deleteDiscountCode: async (id: number) => {
    const response = await api.delete(`/seller/discounts/${id}`);
    return response.data;
  },

  // Toggle discount code status
  toggleDiscountCodeStatus: async (id: number, isActive: boolean) => {
    const response = await api.patch(`/seller/discounts/${id}/toggle-status`, null, {
      params: { isActive }
    });
    return response.data;
  },

  // Get store products
  getStoreProducts: async (storeId: number) => {
    const response = await api.get(`/seller/products/${storeId}`);
    return response.data;
  }
};