import { BREAKPOINTS } from "./constants";

export const formatCurrency = (amount: number, currency = 'VNĐ'): string => {
  return `${amount.toLocaleString()} ${currency}`;
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatDate = (date: string | Date, format = 'DD/MM/YYYY'): string => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY HH:mm':
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    default:
      return `${day}/${month}/${year}`;
  }
};

export const getTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} giây trước`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} tuần trước`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} tháng trước`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(0|\+84)[3-9]\d{8}$/;
  return phoneRegex.test(phone);
};

// Define COLORS constant for status colors
const COLORS = {
  SUCCESS: '#4caf50',   // green
  WARNING: '#ff9800',   // orange
  ERROR: '#f44336',     // red
  INFO: '#2196f3',      // blue
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return COLORS.SUCCESS;
    case 'pending':
      return COLORS.WARNING;
    case 'suspended':
    case 'rejected':
      return COLORS.ERROR;
    default:
      return COLORS.INFO;
  }
};

export const getStatusText = (status: string): string => {
  switch (status) {
    case 'active':
      return 'Hoạt động';
    case 'pending':
      return 'Chờ duyệt';
    case 'suspended':
      return 'Tạm khóa';
    case 'rejected':
      return 'Từ chối';
    default:
      return 'Không xác định';
  }
};

export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const sortByDate = <T>(array: T[], dateKey: keyof T, order: 'asc' | 'desc' = 'desc'): T[] => {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[dateKey] as string).getTime();
    const dateB = new Date(b[dateKey] as string).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

export const downloadFile = (data: string, filename: string, type = 'text/plain'): void => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

export const isMobileDevice = (): boolean => {
  return window.innerWidth < BREAKPOINTS.MD;
};

export const scrollToTop = (): void => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// utils/validation.ts
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule[];
}

export interface ValidationErrors {
  [key: string]: string[];
}

export const validateField = (value: any, rules: ValidationRule[]): string[] => {
  const errors: string[] = [];

  for (const rule of rules) {
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors.push(rule.message || 'Trường này là bắt buộc');
      continue;
    }

    if (value && rule.minLength && value.length < rule.minLength) {
      errors.push(rule.message || `Tối thiểu ${rule.minLength} ký tự`);
    }

    if (value && rule.maxLength && value.length > rule.maxLength) {
      errors.push(rule.message || `Tối đa ${rule.maxLength} ký tự`);
    }

    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors.push(rule.message || 'Định dạng không hợp lệ');
    }

    if (value && rule.custom && !rule.custom(value)) {
      errors.push(rule.message || 'Giá trị không hợp lệ');
    }
  }

  return errors;
};

export const validateForm = (data: any, rules: ValidationRules): ValidationErrors => {
  const errors: ValidationErrors = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const fieldErrors = validateField(data[field], fieldRules);
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  }

  return errors;
};

// Common validation rules
export const commonValidationRules = {
  required: { required: true, message: 'Trường này là bắt buộc' },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email không hợp lệ'
  },
  phone: {
    pattern: /^(0|\+84)[3-9]\d{8}$/,
    message: 'Số điện thoại không hợp lệ'
  },
  minLength: (length: number) => ({
    minLength: length,
    message: `Tối thiểu ${length} ký tự`
  }),
  maxLength: (length: number) => ({
    maxLength: length,
    message: `Tối đa ${length} ký tự`
  }),
};