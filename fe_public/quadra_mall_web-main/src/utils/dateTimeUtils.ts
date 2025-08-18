/**
 * Utility functions for handling datetime conversion from backend
 */

/**
 * Convert backend datetime array to JavaScript Date object
 * Backend returns [year, month, day, hour, minute, second, nanosecond]
 * JavaScript Date expects month to be 0-based
 */
export const convertDateTimeArrayToDate = (dateArray: number[]): Date => {
  if (!dateArray || dateArray.length < 6) {
    return new Date();
  }
  
  const [year, month, day, hour, minute, second, nanosecond = 0] = dateArray;
  return new Date(year, month - 1, day, hour, minute, second, Math.floor(nanosecond / 1000000));
};

/**
 * Convert backend datetime array to ISO string
 */
export const convertDateTimeArrayToISO = (dateArray: number[]): string => {
  return convertDateTimeArrayToDate(dateArray).toISOString();
};

/**
 * Convert backend datetime array to formatted string
 */
export const convertDateTimeArrayToFormatted = (
  dateArray: number[], 
  locale: string = 'vi-VN'
): string => {
  const date = convertDateTimeArrayToDate(dateArray);
  return date.toLocaleString(locale);
};

/**
 * Handle both array and string datetime from backend
 */
export const normalizeDateTime = (datetime: number[] | string | undefined): string => {
  if (!datetime) {
    return new Date().toISOString();
  }
  
  if (Array.isArray(datetime)) {
    return convertDateTimeArrayToISO(datetime);
  }
  
  return datetime;
};

/**
 * Format datetime for display
 */
export const formatDisplayDateTime = (datetime: number[] | string | undefined): string => {
  if (!datetime) {
    return 'N/A';
  }
  
  const isoString = normalizeDateTime(datetime);
  const date = new Date(isoString);
  
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get time difference in minutes from now
 */
export const getTimeUntilPickup = (pickupTime: number[] | string | undefined): string => {
  if (!pickupTime) return 'N/A';
  
  const now = new Date();
  const pickup = Array.isArray(pickupTime) 
    ? convertDateTimeArrayToDate(pickupTime)
    : new Date(pickupTime);
    
  const diffInMinutes = Math.floor((pickup.getTime() - now.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 0) return 'Quá giờ';
  if (diffInMinutes < 60) return `${diffInMinutes} phút`;
  
  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;
  return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
};

/**
 * Check if a datetime is in the past
 */
export const isPastTime = (datetime: number[] | string | undefined): boolean => {
  if (!datetime) return false;
  
  const date = Array.isArray(datetime) 
    ? convertDateTimeArrayToDate(datetime)
    : new Date(datetime);
    
  return date.getTime() < Date.now();
};