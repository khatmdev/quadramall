export const ROUTES = {
  DASHBOARD: 'dashboard',
  SHOPS: 'shops',
  CATEGORIES: 'categories',
  SHOP_APPROVAL: 'shop-approval',
  USERS: 'users',
  ORDERS: 'orders',
  REPORTS: 'reports',
  TRANSACTION: 'transaction',
  BANNER: 'banner',
  COMMISSION_REVENUE: 'commission-revenue',
  SHIPPER: 'shipper',
  NOTIFICATION: 'notification',
  SETTINGS: 'settings',
} as const;

export const SHOP_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  REJECTED: 'rejected',
} as const;

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success',
} as const;

export const CATEGORY_LEVELS = {
  LEVEL_1: 0,
  LEVEL_2: 1,
  LEVEL_3: 2,
} as const;

export const COLORS = {
  PRIMARY: '#10b981',
  SECONDARY: '#3b82f6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  PURPLE: '#8b5cf6',
  ORANGE: '#f97316',
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'DD/MM/YYYY HH:mm',
} as const;