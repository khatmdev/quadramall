import type { SellerRegistration } from '@/types/sellerRegistration';
import React from 'react';

interface ShopApprovalTabsProps {
  activeTab: 'PENDING' | 'APPROVED' | 'REJECTED';
  setActiveTab: (tab: 'PENDING' | 'APPROVED' | 'REJECTED') => void;
  shops: SellerRegistration[];
}

const ShopApprovalTabs: React.FC<ShopApprovalTabsProps> = ({ activeTab, setActiveTab, shops }) => {
  const getTabCount = (status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    return shops.filter((shop) => shop.status === status).length;
  };

  return (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
  activeTab === 'PENDING'
      ? 'border-yellow-500 text-yellow-600'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
}`}
          >
            Chờ phê duyệt ({getTabCount('PENDING')})
          </button>
          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
  activeTab === 'APPROVED'
      ? 'border-green-500 text-green-600'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
}`}
          >
            Đã phê duyệt ({getTabCount('APPROVED')})
          </button>
          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
  activeTab === 'REJECTED'
      ? 'border-red-500 text-red-600'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
}`}
          >
            Bị từ chối ({getTabCount('REJECTED')})
          </button>
        </nav>
      </div>
    </div>
  );
};

export default ShopApprovalTabs;
