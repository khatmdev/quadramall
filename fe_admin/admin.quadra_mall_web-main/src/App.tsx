import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminLayout from './components/common/Layout/AdminLayout';
import CategoryManagement from './components/categories/CategoryManagement';
import ShopApproval from './components/shops/ShopApproval';
import { ROUTES } from './utils/constants';
import Dashboard from './components/dashboard/Dashboard.tsx';
import ShopManagement from './components/shops/ShopManagement';
import ReportsContent from './components/report/ReportsContent';
import TransactionHistory from './components/transaction/TransactionHistory';
import UserManagement from './components/customer/UserManagement';
import BannerSliderManagement from '@/components/banner/BannerSliderManagement';
import CommissionRevenueManagement from '@/components/commissionRevenue/CommissionRevenueManagement';
import ShipperManagement from '@/components/shipper/ShipperManagement';
import NotificationsPage from './components/notification/NotificationsPage';
import Login from '@/components/auth/Login/Login';
import AdminRoute from '@/components/share/AdminRoute';

// Placeholder component cho các route chưa triển khai
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
    <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">{title} - Tính năng đang được phát triển...</p>
    </div>
);

const App: React.FC = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<string>(ROUTES.DASHBOARD);

    // Đồng bộ activeTab với URL
    useEffect(() => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        const currentTab = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : ROUTES.DASHBOARD;
        if (currentTab !== activeTab && Object.values(ROUTES).includes(currentTab as any)) {
            setActiveTab(currentTab);
        }
    }, [location.pathname, activeTab]);

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<AdminRoute />}>
                <Route
                    element={<AdminLayout activeTab={activeTab} onTabChange={setActiveTab} />}
                >
                    <Route path={`/${ROUTES.DASHBOARD}`} element={<Dashboard />} />
                    <Route path={`/${ROUTES.SHOPS}`} element={<ShopManagement />} />
                    <Route path={`/${ROUTES.CATEGORIES}`} element={<CategoryManagement />} />
                    <Route path={`/${ROUTES.SHOP_APPROVAL}`} element={<ShopApproval />} />
                    <Route path={`/${ROUTES.USERS}`} element={<UserManagement />} />
                    <Route path={`/${ROUTES.ORDERS}`} element={<PlaceholderPage title="Đơn hàng" />} />
                    <Route path={`/${ROUTES.REPORTS}`} element={<ReportsContent />} />
                    <Route path={`/${ROUTES.TRANSACTION}`} element={<TransactionHistory />} />
                    <Route path={`/${ROUTES.BANNER}`} element={<BannerSliderManagement />} />
                    <Route path={`/${ROUTES.COMMISSION_REVENUE}`} element={<CommissionRevenueManagement />} />
                    <Route path={`/${ROUTES.SHIPPER}`} element={<ShipperManagement />} />
                    <Route path={`/${ROUTES.NOTIFICATION}`} element={<NotificationsPage />} />
                    <Route path={`/${ROUTES.SETTINGS}`} element={<PlaceholderPage title="Cài đặt" />} />
                    <Route index element={<Navigate to={`/${ROUTES.DASHBOARD}`} replace />} />
                    <Route path="*" element={<Navigate to={`/${ROUTES.DASHBOARD}`} replace />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default App;