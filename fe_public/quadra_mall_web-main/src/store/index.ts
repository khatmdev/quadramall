import {type Action, configureStore, type ThunkDispatch} from '@reduxjs/toolkit';
import authReducer from '@/store/Auth/authSlice';
import registerReducer from '@/store/Auth/registerSlice';
import forgotPasswordReducer from '@/store/Auth/forgotPasswordSlice';
import profileReducer from '@/store/Profile/profileSlice';
import walletReducer from '@/store/Wallet/walletSlice';
import transactionHistoryReducer from '@/store/Wallet/transactionHistorySlice';
import addressReducer from '@/store/Address/AddressSile';
import orderReducer from '@/store/Order/OrderSlice';
import notificationReducer from '@/store/Notification/notificationSlice';
import {useDispatch} from "react-redux";
import shipperReducer from '@/store/Shipper/shipperSlice';
import shipperOrderReducer from '@/store/Shipper/orderSlice';
import availableOrderReducer from '@/store/Shipper/availableOrdersSlice';
import chatReducer from '@/store/ChatBot/chatBotSlice';

let _store : any;

// Hàm getStore đảm bảo chỉ tạo một instance store
export const getStore = () => {
  if (!_store) {
    _store = configureStore({
      reducer: {
        // Auth 
        register: registerReducer,
        forgotPassword: forgotPasswordReducer,
        auth: authReducer,

        // Profile
        profile: profileReducer,
        
        // Wallet
        wallet : walletReducer,
        transactionsHistory : transactionHistoryReducer,

        // Address
        address : addressReducer,

        // Order
        order : orderReducer,

        // Notifications
        notifications : notificationReducer,

        // Shipper
        shipper : shipperReducer,
        shipperOrder: shipperOrderReducer,
        availableOrders : availableOrderReducer,

           // ✅ Chat
        chat: chatReducer,

      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            // Ignore these action types
            ignoredActions: [
              'chat/sendStreamMessage/pending',
              'chat/sendStreamMessage/fulfilled',
              'chat/sendStreamMessage/rejected',
            ],
            // Ignore these field paths in all actions
            ignoredActionsPaths: ['payload.onChunk'],
            // Ignore these paths in the state
            ignoredPaths: ['chat.streamingCallbacks'],
          },
        }),
    });
  }
  return _store;
};

export type RootState = ReturnType<ReturnType<typeof getStore>['getState']>;
export type AppDispatch = ThunkDispatch<RootState, unknown, Action>;
export const useAppDispatch = () => useDispatch<AppDispatch>();