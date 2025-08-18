import React from 'react';
import { Ban, Unlock, Edit, Trash2 } from 'lucide-react';

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

interface UserDetailModalProps {
    show: boolean;
    user: User | null;
    onClose: () => void;
}

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
    const roleMap = { 'customer': 'Khách hàng', 'store_owner': 'Chủ shop', 'admin': 'Quản trị viên' };
    return roles.map(role => roleMap[role] || role).join(', ');
};

const UserDetailModal: React.FC<UserDetailModalProps> = ({ show, user, onClose }) => {
    if (!show || !user) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Chi tiết người dùng</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="text-center">
                                <img src={user.avatar_url} alt={user.full_name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover" />
                                <h3 className="font-semibold text-lg">{user.full_name}</h3>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                  {getStatusText(user.status)}
                </span>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Email:</label>
                                    <p className="text-gray-900">{user.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Số điện thoại:</label>
                                    <p className="text-gray-900">{user.phone}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Vai trò:</label>
                                    <p className="text-gray-900">{getRoleText(user.roles)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Ngày tham gia:</label>
                                    <p className="text-gray-900">{user.created_at}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Số cửa hàng:</label>
                                    <p className="text-gray-900">{user.store_count}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Thao tác</h4>
                            <div className="space-y-2">
                                {user.status === 'active' ? (
                                    <button
                                        onClick={() => handleUserAction(user.id, 'ban')}
                                        className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center gap-2"
                                    >
                                        <Ban size={16} />
                                        Khóa tài khoản
                                    </button>
                                ) : user.status === 'banned' ? (
                                    <button
                                        onClick={() => handleUserAction(user.id, 'unban')}
                                        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
                                    >
                                        <Unlock size={16} />
                                        Mở khóa tài khoản
                                    </button>
                                ) : null}
                                <button
                                    onClick={() => handleUserAction(user.id, 'edit')}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                                >
                                    <Edit size={16} />
                                    Chỉnh sửa thông tin
                                </button>
                                <button
                                    onClick={() => handleUserAction(user.id, 'delete')}
                                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Xóa người dùng
                                </button>
                            </div>
                            {user.roles.includes('store_owner') && (
                                <div className="pt-4 border-t">
                                    <h4 className="font-medium text-gray-900 mb-2">Quản lý cửa hàng</h4>
                                    <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                                        Xem danh sách cửa hàng
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;