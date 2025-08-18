import React from 'react';

interface ShipperTabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    shippers: any[];
}

const ShipperTabs: React.FC<ShipperTabsProps> = ({ activeTab, setActiveTab, shippers }) => (
    <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
            {[
                { id: 'shippers', label: 'Đội ngũ Shipper', count: shippers.length },
                { id: 'active', label: 'Đang hoạt động', count: shippers.filter(s => s.status === 'active').length },
                { id: 'banned', label: 'Bị khóa', count: shippers.filter(s => s.status === 'banned').length },
                { id: 'delivery_areas', label: 'Khu vực giao hàng' },
                { id: 'shipping_fees', label: 'Phí ship' },
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
                    {tab.label} {tab.count !== undefined && `(${tab.count})`}
                </button>
            ))}
        </nav>
    </div>
);

export default ShipperTabs;