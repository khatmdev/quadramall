import React, { FC } from 'react'; // Import FC từ React
import { Eye, Ban, Unlock, MoreVertical } from 'lucide-react';

// Define User type
interface User {
    id: number;
    email: string;
    full_name: string;
    phone: string;
    avatar_url: string;
    status: 'active' | 'inactive' | 'banned';
    roles: string[];
    created_at: string;
    store_count: number;
}

interface UserListProps {
    users: User[];
    handleViewUser: (user: User) => void;
    handleUserAction: (userId: number, action: string) => void;
}

// Define roleMap with index signature to fix TS7053
const roleMap: { [key: string]: string } & { customer: string; store_owner: string; admin: string } = {
    customer: 'Khách hàng',
    store_owner: 'Chủ shop',
    admin: 'Quản trị viên'
};

const getStatusColor = (status: User['status']): string => {
    switch (status) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'inactive': return 'bg-yellow-100 text-yellow-800';
        case 'banned': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getStatusText = (status: User['status']): string => {
    switch (status) {
        case 'active': return 'Hoạt động';
        case 'inactive': return 'Tạm dừng';
        case 'banned': return 'Bị khóa';
        default: return status;
    }
};

const getRoleText = (roles: string[]): string => {
    return roles.map(role => roleMap[role] || role).join(', ');
};

const UserList: FC<UserListProps> = ({ users, handleViewUser, handleUserAction }) => (
    <div className="space-y-4">
        {users.map(user => (
            <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <img src={user.avatar_url} alt={user.full_name} className="w-12 h-12 rounded-full object-cover" />
                        <div>
                            <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-gray-500">{user.phone}</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-sm text-gray-500">{getRoleText(user.roles)}</span>
                                {user.store_count > 0 && (
                                    <>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-sm text-blue-600">{user.store_count} cửa hàng</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
              {getStatusText(user.status)}
            </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handleViewUser(user)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Xem chi tiết"
                            >
                                <Eye size={16} />
                            </button>
                            {user.status === 'active' ? (
                                <button
                                    onClick={() => handleUserAction(user.id, 'ban')}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                    title="Khóa tài khoản"
                                >
                                    <Ban size={16} />
                                </button>
                            ) : user.status === 'banned' ? (
                                <button
                                    onClick={() => handleUserAction(user.id, 'unban')}
                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
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

export default UserList; // Đảm bảo export default