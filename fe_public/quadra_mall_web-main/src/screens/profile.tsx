// src/pages/ProfilePage.tsx
import React, { useState } from 'react';
import SidebarCategories from '@/components/Profile/SideBar';
import ProfileForm from '@/components/Profile/ProfileForm';
import AddressForm from '@/components/Profile/Address/AddressForm';
import SecurityForm from '@/components/Profile/SecurityForm';
import BankPaymentForm from '@/components/Profile/Payment/PaymentForm';
import FavoriteProducts from '@/components/Profile/FavoriteProduct';
import NotificationsSettings from '@/components/Profile/Setting';
import OrderTabForm from '@/components/Profile/OrderForm';
import SupportCenter from '@/components/Profile/Support';


const ProfilePage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('profile');

  const renderForm = () => {
    switch (selectedTab) {
      case 'payment':
        return <BankPaymentForm/>;
      case 'order':
        return <OrderTabForm/>;
      case 'profile':
        return <ProfileForm />;
      case 'address':
        return <AddressForm />;
      case 'security':
        return <SecurityForm />;
      case 'favorites':
        return <FavoriteProducts />;
      case 'notifications':
        return <NotificationsSettings />;
      case 'support':
        return <SupportCenter />;
      default:
        return <ProfileForm />;
    }
  };

  return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 py-10">
        <div className="flex flex-col md:flex-row bg-white p-10 rounded-xl shadow-lg w-full max-w-6xl min-h-[700px] gap-3">
          <div className="w-72">
            <SidebarCategories onSelect={setSelectedTab} />
          </div>
          <div className="flex-1">{renderForm()}</div>
        </div>
      </div>
  );
};

export default ProfilePage;
