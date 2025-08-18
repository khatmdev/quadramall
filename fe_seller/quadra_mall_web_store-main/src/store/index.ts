import { configureStore, type Action, type ThunkDispatch } from '@reduxjs/toolkit';
import registerReducer from '@/store/Auth/registerSlice';
import orderReducer from '@/store/OrderManagement/orderManagementSlice';
import reviewReducer from './reviewSlice';
import notificationReducer from './notificationSlice';
import seoReducer from './seoSlice';
import forgotPasswordReducer from '@/store/Auth/forgotPasswordSlice';
import discountReducer from '@/store/Discount/discountSlice';
import authReducer from '@/store/Auth/authSlice';
import { useDispatch } from 'react-redux';
import { discountService } from '@/services/discountService';

// Biến lưu trữ instance store duy nhất
let _store : any;

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
        discounts: discountReducer,
        seo: seoReducer,
        auth: authReducer,
      },
    });
  }
  return _store;
};

export type RootState = ReturnType<ReturnType<typeof getStore>['getState']>;
export type AppDispatch = ThunkDispatch<RootState, unknown, Action>;

export const useAppDispatch = () => useDispatch<AppDispatch>();