import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import React from 'react'
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Layout from '@/components/screen/LayoutAdmin';
import Dashboard from '@/components/layout/Dashboard/Dashboard';
import OrderDetailPage from '@/components/layout/Order/OrderDetailPage';
import Products from '@/components/screen/Products';
import Categories from '@/components/layout/Category/Category';
import Customers from '@/components/layout/Customer/Customer';
import Chat from '@/components/layout/Chat/Chat';
import KnowledgeBase from '@/components/layout/KnowledgeBase/KnowledgeBase';
import PersonalSettings from '@/components/layout/PersonalSetting/PersonalSettings';
import GlobalSettings from '@/components/layout/GobalSettings/GobalSetting';
import ReviewManagement from '@/components/layout/Review/ReviewManagement';
import ProductReviewDetail from '@/components/layout/Review/ProductReviewDetail';
import ShopRegistration from './components/screen/ShopRegistration';
import Login from './components/auth/Login/Login';
import Register from './components/auth/Register/Register';
import ForgotPassword from './components/auth/Forgot/ForgotPassword';
import ResetPassword from './components/auth/Forgot/ResetPassword';
import OAuth2Callback from './components/auth/OAuth2Callback';
import SellerRoute from '@/components/share/SellerRoute';
import SelectStore from '@/components/share/SelectStore';
import FlashSaleManagement from './components/screen/FlashSaleManagement';
import DiscountManagement from '@/components/layout/Coupon/DiscountManagement';
import OrderManagementPage from './components/layout/Order/OrderManagementPage';

function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, storeIds } = useSelector((state: RootState) => state.auth);
    const selectedStoreId = localStorage.getItem('selectedStoreId');

    useEffect(() => {
        console.log('[App] useEffect triggered:', { isAuthenticated, storeIds, selectedStoreId, pathname: location.pathname });
        if (isAuthenticated) {
            if (storeIds.length > 0 && !selectedStoreId && location.pathname !== '/select-store') {
                console.log('[App] Redirecting to /select-store: no selectedStoreId');
                navigate('/select-store', { replace: true });
            } else if (storeIds.length === 0 && location.pathname !== '/registration') {
                console.log('[App] Redirecting to /registration: no storeIds');
                navigate('/registration', { replace: true });
            } else if (selectedStoreId && (location.pathname === '/login' || location.pathname === '/register')) {
                navigate('/', { replace: false });
            }
        } else {
            console.log('[App] User not authenticated, no redirect');
        }
    }, [isAuthenticated, storeIds, selectedStoreId, location.pathname, navigate]);

    return (
        <>
            <Routes>
                <Route path="/registration" element={<ShopRegistration />} />
                <Route path="/login" element={<Login />} />
                <Route path="/seller" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth/success" element={<OAuth2Callback />} />
                <Route path="/auth/error" element={<OAuth2Callback />} />
                <Route path="/select-store" element={<SelectStore />} />
                <Route element={<Layout />}>
                    <Route element={<SellerRoute />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/seller/orders" element={<OrderManagementPage />} />
                        <Route path="/seller/orders/:orderId" element={<OrderDetailPage />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/coupons" element={<DiscountManagement />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/knowledge-base" element={<KnowledgeBase />} />
                        <Route path="/personal-settings" element={<PersonalSettings />} />
                        <Route path="/global-settings" element={<GlobalSettings />} />
                        <Route path="/reviews" element={<ReviewManagement />} />
                        <Route path="/reviews/:productId" element={<ProductReviewDetail />} />
                        <Route path="/flashsale" element={<FlashSaleManagement/>}/>
                        
                    </Route>
                </Route>
            </Routes>
        </>
    );
}

export default App;