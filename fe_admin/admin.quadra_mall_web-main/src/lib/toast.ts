// src/lib/toast.ts
import { toast as hotToast } from 'react-hot-toast';

export const toast = {
  success: (msg: string) => hotToast.success(msg),
  error: (msg: string) => hotToast.error(msg),
};