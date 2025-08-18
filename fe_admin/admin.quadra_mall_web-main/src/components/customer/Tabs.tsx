import React from 'react';

interface TabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    users: any[]; // Bạn có thể thay bằng interface User nếu cần
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab, users }) => (
    <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
            {[
                { id: 'all', label: 'Tất cả', count: users.length },
                { id: 'active', label: 'Đang hoạt động', count: users.filter(u => u.status === 'active').length },
                { id: 'inactive', label: 'Tạm dừng', count: users.filter(u => u.status === 'inactive').length },
                { id: 'banned', label: 'Bị khóa', count: users.filter(u => u.status === 'banned').length },
                { id: 'store_owners', label: 'Chủ cửa hàng', count: users.filter(u => u.roles.includes('store_owner')).length }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                        activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    {tab.label} ({tab.count})
                </button>
            ))}
        </nav>
    </div>
);

export default Tabs;