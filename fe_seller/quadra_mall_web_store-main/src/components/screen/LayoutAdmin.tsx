import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/share/Header';
import SidebarAdmin from '@/components/share/SideBar';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Các đường dẫn không cần layout (trang auth)
  const noLayoutRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/auth/success',
    '/auth/error',
    '/registration',
    '/select-store', // Thêm /select-store vào noLayoutRoutes
  ];

  // Nếu đang ở trang không cần layout => chỉ render nội dung
  if (noLayoutRoutes.includes(location.pathname)) {
    return <Outlet />;
  }

  // Xác định selectedPage dựa trên path hiện tại
  const getSelectedPage = () => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    if (path.startsWith('/seller/orders')) return 'orders';
    if (path === '/products') return 'products';
    if (path === '/categories') return 'categories';
    if (path === '/customers') return 'customers';
    if (path === '/coupons') return 'coupons';
    if (path === '/chat') return 'chat';
    if (path === '/knowledge-base') return 'knowledge-base';
    if (path === '/personal-settings') return 'personal-settings';
    if (path === '/global-settings') return 'global-settings';
    if (path.startsWith('/reviews')) return 'reviews';
    if (path === '/select-store') return 'change-store'; // Thêm cho Change Store
    return '';
  };

  return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-md z-10">
          <Header />
        </header>

        {/* Sidebar */}
        <aside className="fixed top-16 bottom-0 w-64 bg-gray-800 text-white z-10">
          <SidebarAdmin
              onItemClick={() => setIsSidebarOpen(false)}
              selectedId={getSelectedPage()}
              isOpen={isSidebarOpen}
              toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </aside>

        {/* Main content */}
        <main className="ml-64 pt-16 min-h-screen bg-gray-50 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
  );
};

export default Layout;