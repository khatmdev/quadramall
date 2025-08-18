import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ShipperLayout } from './ShipperLayout';
import { ShipperDashboard } from './ShipperDashboard';
import { ShipperMyOrders } from './ShipperMyOrders';
import { ShipperAvailableOrders } from './ShipperAvailableOrders';
import { RegistrationStatus } from './RegistrationStatus';
import { ShipperRegistrationForm } from './ShipperRegistrationForm';

// Placeholder components for other routes
const ShipperStats: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Thống kê</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">Trang thống kê chi tiết - Coming soon...</p>
    </div>
  </div>
);

const ShipperSettings: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Cài đặt</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">Cài đặt tài khoản shipper - Coming soon...</p>
    </div>
  </div>
);

export const ShipperRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Registration routes (outside layout) */}
      <Route path="/register" element={<ShipperRegistrationForm />} />
      <Route path="/registration-status" element={<RegistrationStatus />} />
      
      {/* Shipper dashboard routes (inside layout) */}
      <Route path="/" element={<ShipperLayout />}>
        <Route index element={<Navigate to="/shipper/dashboard" replace />} />
        <Route path="dashboard" element={<ShipperDashboard />} />
        <Route path="my-orders" element={<ShipperMyOrders />} />
        <Route path="available-orders" element={<ShipperAvailableOrders />} />
        <Route path="stats" element={<ShipperStats />} />
        <Route path="settings" element={<ShipperSettings />} />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/shipper/dashboard" replace />} />
    </Routes>
  );
};