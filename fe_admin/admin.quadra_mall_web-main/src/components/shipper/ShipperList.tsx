import React, { FC } from 'react';
import { Eye, Ban, Unlock, MoreVertical } from 'lucide-react';

// Define Shipper type
interface Shipper {
    id: number;
    full_name: string;
    phone: string;
    email: string;
    avatar_url: string;
    status: 'active' | 'inactive' | 'banned';
    delivery_areas: string[];
    total_deliveries: number;
    created_at: string;
}

interface ShipperListProps {
    shippers: Shipper[];
    handleViewShipper: (shipper: Shipper) => void;
    handleToggleLock: (shipperId: number, status: string) => void;
}

const getStatusColor = (status: Shipper['status']): string => {
    switch (status) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'inactive': return 'bg-yellow-100 text-yellow-800';
        case 'banned': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getStatusText = (status: Shipper['status']): string => {
    switch (status) {
        case 'active': return 'Hoạt động';
        case 'inactive': return 'Tạm dừng';
        case 'banned': return 'Bị khóa';
        default: return status;
    }
};

const ShipperList: FC<ShipperListProps> = ({ shippers, handleViewShipper, handleToggleLock }) => (
    <div className="space-y-4">
        {shippers.map(shipper => (
            <div key={shipper.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <img src={shipper.avatar_url} alt={shipper.full_name} className="w-12 h-12 rounded-full object-cover" />
                        <div>
                            <h3 className="font-semibold text-gray-900">{shipper.full_name}</h3>
                            <p className="text-sm text-gray-600">{shipper.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-gray-500">{shipper.phone}</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-sm text-gray-500">{shipper.delivery_areas.join(', ')}</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-sm text-blue-600">{shipper.total_deliveries} đơn</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipper.status)}`}>
              {getStatusText(shipper.status)}
            </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handleViewShipper(shipper)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Xem chi tiết"
                            >
                                <Eye size={16} />
                            </button>
                            {shipper.status === 'active' ? (
                                <button
                                    onClick={() => handleToggleLock(shipper.id, shipper.status)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    title="Khóa"
                                >
                                    <Ban size={16} />
                                </button>
                            ) : shipper.status === 'banned' ? (
                                <button
                                    onClick={() => handleToggleLock(shipper.id, shipper.status)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                    title="Mở khóa"
                                >
                                    <Unlock size={16} />
                                </button>
                            ) : null}
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
                                <MoreVertical size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export default ShipperList;