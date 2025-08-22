// Layout.tsx - Tích hợp chat vào layout hiện tại
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/share/header/Header';
import Footer from '@/components/share/Footer';
import Breadcrumb from '@/components/share/Breadcrumb';
import MiniChat from '@/components/chatBot/MiniChat';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
// Import CSS file cho chat
import '@/styles/chat-style.css';

const Layout: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Breadcrumb />
      <main className="flex-grow">
        <Outlet /> 
      </main>
      <Footer />
      
      {/* ✅ Enhanced MiniChat - chỉ hiển thị khi đã đăng nhập */}
      {isAuthenticated && <MiniChat />}
    </div>
  );
};

export default Layout;