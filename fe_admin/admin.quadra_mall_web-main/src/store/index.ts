import { configureStore, type Action, type ThunkDispatch } from '@reduxjs/toolkit';
import registerReducer from '@/store/Auth/registerSlice';
import orderReducer from './orderSlice';
import reviewReducer from './reviewSlice';
import notificationReducer from './notificationSlice';
import voucherReducer from '@/store/voucherSlice';
import seoReducer from './seoSlice';
import forgotPasswordReducer from '@/store/Auth/forgotPasswordSlice';
import authReducer from '@/store/Auth/authSlice';
import { useDispatch } from 'react-redux';
import shipperReducer from './Shipper/shipperSlice';
// Biến lưu trữ instance store duy nhất
let _store: any;

// Hàm getStore đảm bảo chỉ tạo một instance store
export const getStore = () => {
  if (!_store) {
    _store = configureStore({
      reducer: {
        register: registerReducer,
        forgotPassword: forgotPasswordReducer,
        orders: orderReducer,
        reviews: reviewReducer,
        notifications: notificationReducer,
        vouchers: voucherReducer,
        seo: seoReducer,
        auth: authReducer,

        // Shipper
        shipper: shipperReducer,
      },
    });
  }
  return _store;
};

export type RootState = ReturnType<ReturnType<typeof getStore>['getState']>;
export type AppDispatch = ThunkDispatch<RootState, unknown, Action>;

export const useAppDispatch = () => useDispatch<AppDispatch>();