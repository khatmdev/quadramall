import React, { useState, useEffect } from 'react';
import {Plus, Filter, RefreshCw} from 'lucide-react';
import Header from './Header';
import SearchBar from './SearchBar';
import Tabs from './Tabs';
import UserList from './UserList';
import UserDetailModal from './UserDetailModal';

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

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [showUserDetail, setShowUserDetail] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        setTimeout(() => {
            setUsers([
                { id: 1, email: 'nguyen.van.a@email.com', full_name: 'Nguyễn Văn A', phone: '0987654321', avatar_url: 'https://via.placeholder.com/40', status: 'active', roles: ['customer'], created_at: '2024-06-15', store_count: 0 },
                { id: 2, email: 'tran.thi.b@email.com', full_name: 'Trần Thị B', phone: '0976543210', avatar_url: 'https://via.placeholder.com/40', status: 'active', roles: ['store_owner'], created_at: '2024-06-10', store_count: 1 },
                { id: 3, email: 'le.van.c@email.com', full_name: 'Lê Văn C', phone: '0965432109', avatar_url: 'https://via.placeholder.com/40', status: 'banned', roles: ['customer'], created_at: '2024-06-05', store_count: 0 },
                { id: 4, email: 'pham.thi.d@email.com', full_name: 'Phạm Thị D', phone: '0954321098', avatar_url: 'https://via.placeholder.com/40', status: 'inactive', roles: ['store_owner'], created_at: '2024-06-01', store_count: 2 },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredUsers = users.filter(user => {
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            if (!(user.full_name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query) || user.phone.includes(query))) {
                return false;
            }
        }
        if (activeTab === 'all') return true;
        if (activeTab === 'active') return user.status === 'active';
        if (activeTab === 'inactive') return user.status === 'inactive';
        if (activeTab === 'banned') return user.status === 'banned';
        if (activeTab === 'store_owners') return user.roles.includes('store_owner');
        return true;
    });

    const handleUserAction = (userId: number, action: string) => {
        console.log(`Action ${action} for user ${userId}`);
    };

    const handleViewUser = (user: User) => {
        setSelectedUser(user);
        setShowUserDetail(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw size={48} className="mx-auto text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Header />
                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
                    <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            <Filter size={16} />
                            Lọc
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Plus size={16} />
                            Thêm người dùng
                        </button>
                    </div>
                </div>
                <Tabs activeTab={activeTab} setActiveTab={setActiveTab} users={users} />
                <UserList users={filteredUsers} handleViewUser={handleViewUser} handleUserAction={handleUserAction} />
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{filteredUsers.length}</span> của <span className="font-medium">{users.length}</span> kết quả
                    </div>
                    <div className="flex space-x-2">
                        <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                            Trước
                        </button>
                        <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md">
                            1
                        </button>
                        <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                            Sau
                        </button>
                    </div>
                </div>
            </div>
            <UserDetailModal show={showUserDetail} user={selectedUser} onClose={() => setShowUserDetail(false)} />
        </div>
    );
};

export default UserManagement;