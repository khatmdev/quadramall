import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { sellerRegistrationService } from '@/services/sellerRegistration';
import type { SellerRegistration, RejectSellerRegistrationRequest } from '@/types/sellerRegistration';
import SearchBar from './SearchBar';
import ShopApprovalTabs from './ShopApprovalTabsProps';
import ShopApprovalCard from './ShopApprovalCard';
import Modal from '../common/Modal/Modal';

interface ModalState {
    open: boolean;
    type: 'success' | 'error' | 'warning' | 'info' | 'input' | 'loading';
    title: string;
    message: string;
    onConfirm: (inputValue?: string) => void;
    onCancel?: () => void;
    errorMessage?: string;
}

const ShopApproval: React.FC = () => {
    const [shops, setShops] = useState<SellerRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [modal, setModal] = useState<ModalState>({
        open: false,
        type: 'info',
        title: '',
        message: '',
        onConfirm: () => {},
    });

    useEffect(() => {
        const fetchShops = async () => {
            try {
                setLoading(true);
                const registrations = await sellerRegistrationService.getAllRegistrations(activeTab);
                setShops(registrations);
            } catch (error) {
                console.error('Fetch shops error:', error);
                setModal({
                    open: true,
                    type: 'error',
                    title: 'Lỗi',
                    message: 'Không thể tải danh sách shop. Vui lòng thử lại sau.',
                    onConfirm: () => setModal((prev) => ({ ...prev, open: false })),
                });
            } finally {
                setLoading(false);
            }
        };
        fetchShops();
    }, [activeTab]);

    const showModal = (
        type: ModalState['type'],
        title: string,
        message: string,
        onConfirm: (inputValue?: string) => void = () => {},
        onCancel?: () => void,
        errorMessage: string = ''
    ) => {
        setModal({
            open: true,
            type,
            title,
            message,
            onConfirm: (inputValue?: string) => {
                onConfirm(inputValue);
                if (type !== 'input') {
                    setModal((prev) => ({ ...prev, open: false }));
                }
            },
            onCancel: onCancel
                ? () => {
                    onCancel();
                    setModal((prev) => ({ ...prev, open: false }));
                }
                : undefined,
            errorMessage,
        });
    };

    const handleApprove = async (shopId: number) => {
        const shop = shops.find((s) => s.id === shopId);
        showModal(
            'warning',
            'Xác nhận phê duyệt',
            `Bạn có chắc chắn muốn phê duyệt shop "${shop?.storeName}"?`,
            async () => {
                setModal((prev) => ({ ...prev, open: false })); // đóng modal cảnh báo trước
                await new Promise((res) => setTimeout(res, 100)); // delay nhỏ để tránh race condition

                showModal('loading', 'Đang xử lý', 'Vui lòng chờ trong khi phê duyệt shop...');
                try {
                    const updatedShop = await sellerRegistrationService.approveRegistration(shopId);
                    setShops((prevShops) =>
                        prevShops.map((s) => (s.id === shopId ? updatedShop : s))
                    );
                    showModal('success', 'Thành công', 'Shop đã được phê duyệt thành công!');
                } catch (error: any) {
                    console.error('Approve error:', error);
                    showModal('error', 'Lỗi', `Không thể phê duyệt shop: ${error.message || 'Vui lòng thử lại sau.'}`);
                }
            }
        );
    };


    const handleRejectApi = async (shopId: number, reason: string) => {
        try {
            showModal('loading', 'Đang xử lý', 'Vui lòng chờ trong khi từ chối shop...');
            const request: RejectSellerRegistrationRequest = { rejectionReason: reason };
            const updatedShop = await sellerRegistrationService.rejectRegistration(shopId, request);
            setShops((prevShops) =>
                prevShops.map((s) => (s.id === shopId ? updatedShop : s))
            );
            showModal('success', 'Thành công', 'Shop đã bị từ chối thành công!');
        } catch (error: any) {
            console.error('Reject API error:', error);
            showModal('error', 'Lỗi', `Không thể từ chối shop: ${error.message || 'Vui lòng thử lại sau.'}`);
        }
    };

    const handleReject = (shopId: number) => {
        const shop = shops.find((s) => s.id === shopId);
        showModal(
            'input',
            'Xác nhận từ chối',
            `Vui lòng nhập lý do từ chối shop "${shop?.storeName}":`,
            async (inputValue?: string) => {
                const reason = inputValue?.trim() || '';
                if (!reason) {
                    setModal((prev) => ({
                        ...prev,
                        errorMessage: 'Lý do từ chối không được để trống!',
                    }));
                    return;
                }
                await handleRejectApi(shopId, reason);
            },
            () => {
                // onCancel
            }
        );
    };

    const handleDelete = (shopId: number) => {
        const shop = shops.find((s) => s.id === shopId);
        showModal(
            'warning',
            'Xác nhận xóa',
            `Bạn có chắc chắn muốn xóa shop "${shop?.storeName}"? Hành động này không thể hoàn tác.`,
            () => {
                setShops((prevShops) => prevShops.filter((s) => s.id !== shopId));
                showModal('success', 'Thành công', 'Shop đã được xóa thành công!');
            }
        );
    };

    const getFilteredShops = () => {
        let filtered = shops.filter((shop) => shop.status === activeTab);
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (shop) =>
                    shop.userFullName.toLowerCase().includes(query) ||
                    (shop.taxCode && shop.taxCode.toLowerCase().includes(query))
            );
        }
        return filtered;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý phê duyệt Shop</h1>
                    <p className="text-gray-600">Phê duyệt và quản lý các shop đăng ký mới</p>
                </div>

                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Tìm theo tên chủ shop hoặc mã số thuế..."
                />

                <ShopApprovalTabs activeTab={activeTab} setActiveTab={setActiveTab} shops={shops} />

                <div className="space-y-6">
                    {getFilteredShops().length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <User size={48} className="mx-auto" />
                            </div>
                            <p className="text-gray-500 text-lg">
                                {searchQuery
                                    ? 'Không tìm thấy shop phù hợp'
                                    : activeTab === 'PENDING'
                                        ? 'Không có shop nào chờ phê duyệt'
                                        : activeTab === 'APPROVED'
                                            ? 'Không có shop nào đã được phê duyệt'
                                            : 'Không có shop nào bị từ chối'}
                            </p>
                        </div>
                    ) : (
                        getFilteredShops().map((shop) => (
                            <ShopApprovalCard
                                key={shop.id}
                                shop={shop}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                onDelete={handleDelete}
                                onToggleLock={() => {}}
                                showActions={true}
                            />
                        ))
                    )}
                </div>
            </div>

            <Modal
                open={modal.open}
                onClose={() => setModal((prev) => ({ ...prev, open: false }))}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                onConfirm={modal.onConfirm}
                onCancel={modal.onCancel}
                confirmText={modal.type === 'loading' ? '' : 'Xác nhận'}
                cancelText={modal.type === 'loading' ? '' : 'Hủy'}
                errorMessage={modal.errorMessage}
            />
        </div>
    );
};

export default ShopApproval;
