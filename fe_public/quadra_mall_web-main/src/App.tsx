import { Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/utils/queryClient';
import Layout from '@/components/share/Layout';
import PrivateRoute from './hooks/security/PrivateRoute';
import VNPayOrderResult from './components/order/OrderResult';
import Index from '@/screens/index';
import Login from "@/components/auth/Login/Login";
import Register from "@/components/auth/Register/Register";
import ForgotPassword from './components/auth/Forgot/ForgotPassword';
import ResetPassword from './components/auth/Forgot/ResetPassword';
import OAuth2Callback from './components/auth/OAuth2Callback';
import ProductDetailScreen from "@/components/screen/ProductDetailScreen";
import Category from './screens/category';
import WalletPage from "@/components/screen/wallet";
import { WalletDashboard } from './components/wallet/Dashboard/WalletDashboard';
import { Stats } from './components/wallet/Stats/Stats';
import { DepositResult } from './components/wallet/DepositResult';
import TransactionHistory from './components/wallet/TransactionHistory/TransactionHistory';
import ProfilePage from './screens/profile';
import AddressPage from './components/address/AddressPage';
import ChangePassword from './components/auth/ChangePassword/ChangePassword';
import EnhancedCheckout from './components/order/CheckoutPage';
import NotificationsPage from './components/notification/NotificationPage';
import ChatInterface from "@/components/chat/ChatInterface";
import Cart from '@/screens/Cart';
import Shopdetail from '@/screens/Shopdetail';
import VoucherScreen from '@/screens/voucher';
import VoucherHistoryMainLayout from '@/components/VoucherHistory/VoucherHistoryMainLayout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';
import React, { useEffect } from 'react';
import { useWebSocket } from './hooks/useWebSocket';

import { ToastContainer } from 'react-toastify';
import { FlashSalePage } from './components/screen/FlashSale';
import ProductListPage from './components/PLP/ProductListingPage';
import { SearchProvider } from "./components/context/SearchContext";
import { ShipperRegistrationForm } from './components/Shipper/ShipperRegistrationForm';
import { RegistrationStatus } from './components/Shipper/RegistrationStatus';
import { ProtectedRoute } from './hooks/security/ProtectedRoute';
import { ShipperMyOrders } from './components/Shipper/ShipperMyOrders';
import { ShipperRoutes } from './components/Shipper/ShipperRoutes';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const { sendReadReceipt } = useWebSocket();

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const closeAllDropdowns = () => {
    setShowNotifications(false);
  };


  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <SearchProvider>
        <Routes>
          {/* Các trang không cần layout */}
          <Route path="/order" element={<VNPayOrderResult />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/success" element={<OAuth2Callback />} />
          <Route path="/auth/error" element={<OAuth2Callback />} />

        {/* Shipper registration - protected by guard */}
            <Route path="/shipper-register" element={<ShipperRegistrationForm />} />

            {/* Protected routes */}
            <Route path="/shipper-registration-status" element={
                <ProtectedRoute>
                  <RegistrationStatus />

                </ProtectedRoute>
              }
            />

        {/* Shipper routes */}
        <Route path="/shipper/*" element={<ShipperRoutes />} />


        {/* Các trang dùng layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/products/:slug" element={<ProductDetailScreen />} />
          <Route path="/category" element={<Category />} />
          <Route path='/flash-sale' element={<FlashSalePage/>}/>
          <Route path='/search' element={<ProductListPage/>}/>
          <Route path="/shopdetail/:storeSlug" element={<Shopdetail />} />

          {/* Các route cần bảo vệ */}
          <Route element={<PrivateRoute />}>
            <Route path="/wallet/deposit/result" element={<DepositResult />} />
            <Route path="/wallet" element={<WalletPage />}>
              <Route index element={<WalletDashboard />} />
              <Route path="dashboard" element={<WalletDashboard />} />
              <Route path="history" element={<TransactionHistory />} />
              <Route path="stats" element={<Stats />} />
            </Route>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/addresses" element={<AddressPage />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/checkout" element={<EnhancedCheckout />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/ChatInterface" element={<ChatInterface />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/voucher" element={<VoucherScreen />} />
            <Route path="/voucherhistory" element={<VoucherHistoryMainLayout />} />
          </Route>
        </Route>
      </Routes>
      </SearchProvider>
    </QueryClientProvider>
  );
}

export default App;
