import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { createApi } from '@/services/axios';
import { sellerRegistrationApi } from '@/services/sellerRegistrationService';
import { StoreInfoDto, StoreStatus } from '@/types/sellerRegistration';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    LockClosedIcon,
    FlagIcon,
    MapPinIcon,
    CalendarDaysIcon
} from '@heroicons/react/24/solid';

// Khởi tạo API
const api = createApi();
const sellerApi = sellerRegistrationApi(api);

const SelectStore: React.FC = () => {
    const { storeIds, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(localStorage.getItem('selectedStoreId') || null);
    const [stores, setStores] = useState<StoreInfoDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [canRegisterNew, setCanRegisterNew] = useState(false);

    // Load store data và check registration status
    useEffect(() => {
        const loadStoresAndCheckRegistration = async () => {
            if (!isAuthenticated) return;

            try {
                setLoading(true);

                // Load stores
                const storeData = await sellerApi.getCurrentUserStores();
                setStores(storeData);

                // Set default selected store if none selected
                if (storeData.length > 0 && !selectedStoreId) {
                    setSelectedStoreId(storeData[0].id.toString());
                }

                // Check registration status để xem có thể đăng ký mới không
                try {
                    const currentRegistration = await sellerApi.getCurrentUserRegistration();
                    // Nếu có registration PENDING hoặc REJECTED thì không cho đăng ký mới
                    setCanRegisterNew(!currentRegistration);
                } catch (error) {
                    // Nếu không có registration nào thì cho phép đăng ký mới
                    setCanRegisterNew(true);
                }

            } catch (error) {
                console.error('Error loading stores:', error);
                // Nếu lỗi, vẫn cho phép thử đăng ký
                setCanRegisterNew(true);
            } finally {
                setLoading(false);
            }
        };

        loadStoresAndCheckRegistration();
    }, [isAuthenticated, selectedStoreId]);

    const handleSelectStore = (storeId: number) => {
        setSelectedStoreId(storeId.toString());
    };

    const handleSubmit = async () => {
        if (!selectedStoreId) return;

        const selectedStore = stores.find(store => store.id.toString() === selectedStoreId);
        if (!selectedStore) return;

        // Kiểm tra trạng thái store
        if (selectedStore.status === StoreStatus.ACTIVE) {
            localStorage.setItem('selectedStoreId', selectedStoreId);
            navigate('/', { replace: true });
        } else {
            // Chuyển đến trang thông báo trạng thái
            navigate('/store-status', {
                state: {
                    status: selectedStore.status,
                    storeName: selectedStore.name,
                    lockReason: selectedStore.lockReason
                },
                replace: true
            });
        }
    };

    const handleRegisterNewStore = async () => {
        // Truyền state để ShopRegistration biết là từ SelectStore
        navigate('/registration', {
            state: { fromSelectStore: true },
            replace: false
        });
    };

    const getStatusIcon = (status: StoreStatus) => {
        switch (status) {
            case StoreStatus.ACTIVE:
                return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
            case StoreStatus.INACTIVE:
                return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
            case StoreStatus.LOCKED:
                return <LockClosedIcon className="w-5 h-5 text-red-600" />;
            case StoreStatus.REPORTED:
                return <FlagIcon className="w-5 h-5 text-orange-600" />;
            default:
                return <ExclamationTriangleIcon className="w-5 h-5 text-gray-600" />;
        }
    };

    const getStatusText = (status: StoreStatus) => {
        switch (status) {
            case StoreStatus.ACTIVE:
                return { text: 'Hoạt động', color: 'text-green-600' };
            case StoreStatus.INACTIVE:
                return { text: 'Tạm ngừng', color: 'text-yellow-600' };
            case StoreStatus.LOCKED:
                return { text: 'Bị khóa', color: 'text-red-600' };
            case StoreStatus.REPORTED:
                return { text: 'Đang xem xét', color: 'text-orange-600' };
            default:
                return { text: 'Không xác định', color: 'text-gray-600' };
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <p className="text-gray-600">Please log in to continue</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <p className="text-gray-600">Đang tải danh sách cửa hàng...</p>
                </div>
            </div>
        );
    }

    if (stores.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Chưa có cửa hàng</h2>
                    <p className="text-gray-600 mb-6">Bạn chưa có cửa hàng nào được duyệt.</p>
                    <button
                        onClick={handleRegisterNewStore}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                        Đăng ký cửa hàng đầu tiên
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Chọn cửa hàng</h1>
                    <p className="text-gray-600">Chọn cửa hàng để quản lý hoặc đăng ký cửa hàng mới</p>
                </div>

                {/* Store Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {stores.map((store) => {
                        const statusInfo = getStatusText(store.status);
                        return (
                            <div
                                key={store.id}
                                onClick={() => handleSelectStore(store.id)}
                                className={`bg-white p-6 rounded-lg shadow-md cursor-pointer transition-all hover:shadow-lg border-2 ${
                                    selectedStoreId === store.id.toString()
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                {/* Header */}
                                <div className="flex justify-between mb-4">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        {/* Store Logo */}
                                        {store.logoUrl ? (
                                            <img
                                                src={store.logoUrl}
                                                alt={store.name}
                                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-gray-500 font-semibold">
                                                    {store.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-lg font-semibold text-gray-800 leading-tight break-words">
                                                {store.name}
                                            </h3>
                                        </div>
                                    </div>

                                    {selectedStoreId === store.id.toString() && (
                                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Store Info */}
                                <div className="space-y-3">
                                    {/* Address */}
                                    {store.address && (
                                        <div className="flex items-start gap-2">
                                            <MapPinIcon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-gray-600 line-clamp-2">{store.address}</span>
                                        </div>
                                    )}

                                    {/* Created Date */}
                                    <div className="flex items-center gap-2">
                                        <CalendarDaysIcon className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">
                                            Tạo ngày: {formatDate(store.createdAt)}
                                        </span>
                                    </div>

                                    {/* Status */}
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(store.status)}
                                        <span className={`text-sm font-medium ${statusInfo.color}`}>
                                            {statusInfo.text}
                                        </span>
                                    </div>

                                    {/* Lock Reason (if locked) */}
                                    {store.status === StoreStatus.LOCKED && store.lockReason && (
                                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                                            <p className="text-xs text-red-700">
                                                <strong>Lý do khóa:</strong> {store.lockReason}
                                            </p>
                                        </div>
                                    )}

                                    {/* Description (if available) */}
                                    {store.description && (
                                        <div className="mt-3">
                                            <p className="text-xs text-gray-500 line-clamp-2">
                                                {store.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Add New Store Card */}
                    <div
                        onClick={handleRegisterNewStore}
                        className={`bg-white p-6 rounded-lg shadow-md cursor-pointer transition-all hover:shadow-lg border-2 border-dashed flex flex-col items-center justify-center ${
                            canRegisterNew
                                ? 'border-gray-300 hover:border-green-400 text-gray-500 hover:text-green-600'
                                : 'border-red-300 text-red-400 hover:border-red-400 hover:text-red-500'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                            canRegisterNew ? 'bg-gray-100' : 'bg-red-50'
                        }`}>
                            {canRegisterNew ? (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                            {canRegisterNew ? 'Đăng ký cửa hàng mới' : 'Kiểm tra trạng thái đăng ký'}
                        </h3>
                        <p className="text-sm text-center">
                            {canRegisterNew
                                ? 'Thêm cửa hàng mới vào tài khoản'
                                : 'Bạn có đăng ký đang chờ xử lý'
                            }
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedStoreId}
                        className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        Vào cửa hàng đã chọn
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectStore;