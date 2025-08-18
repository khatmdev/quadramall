import React, {useState} from 'react';
import {Check, X, Eye, Trash2, User, Mail, CreditCard, Image, Unlock, Info, MapPin, Phone} from 'lucide-react';
import type {SellerRegistration} from '@/types/sellerRegistration';
import ImageModal from '../common/Modal/ImageModal';

interface ShopApprovalCardProps {
    shop: SellerRegistration;
    onApprove: (shopId: number) => void;
    onReject: (shopId: number) => void;
    onDelete: (shopId: number) => void;
    onToggleLock: (shopId: number) => void;
    showActions?: boolean;
}

const ShopApprovalCard: React.FC<ShopApprovalCardProps> = ({
                                                               shop,
                                                               onApprove,
                                                               onReject,
                                                               onDelete,
                                                               onToggleLock,
                                                               showActions = true,
                                                           }) => {
    const [imageModal, setImageModal] = useState<{ open: boolean; imageUrl: string }>({open: false, imageUrl: ''});

    // Hiển thị badge trạng thái của shop
    const getStatusBadge = () => {
        switch (shop.status) {
            case 'APPROVED':
                return (
                    <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Đã duyệt
            </span>
                    </div>
                );
            case 'REJECTED':
                return (
                    <div className="flex items-center gap-2">
                        <span
                            className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Bị từ chối</span>
                        {shop.rejectionReason && (
                            <span
                                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium flex items-center">
                <Info size={12} className="mr-1"/>
                                {shop.rejectionReason}
              </span>
                        )}
                    </div>
                );
            default:
                return (
                    <span
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Chờ duyệt</span>
                );
        }
    };

    // Mở modal xem hình ảnh
    const openImageModal = (imageUrl: string) => {
        setImageModal({open: true, imageUrl});
    };

    // Chuyển mảng createdAt thành định dạng ngày giờ
    const formatDate = (dateArray: [number, number, number, number, number, number]) => {
        const [year, month, day, hour, minute, second] = dateArray;
        return new Date(year, month - 1, day, hour, minute, second).toLocaleDateString('vi-VN');
    };

    return (
        <>
            <div
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-800">{shop.storeName}</h3>
                        {getStatusBadge()}
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Thông tin cơ bản */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <User size={18} className="mr-2 text-blue-600"/>
                                Thông tin chủ shop
                            </h4>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center">
                    <User size={16} className="mr-2 text-gray-400"/>
                    Tên chủ shop:
                  </span>
                                    <span className="font-medium text-gray-800">{shop.userFullName}</span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center">
                    <Mail size={16} className="mr-2 text-gray-400"/>
                    Email:
                  </span>
                                    <span className="text-gray-800">{shop.userEmail}</span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center">
                    <Phone size={16} className="mr-2 text-gray-400"/>
                    Số điện thoại:
                  </span>
                                    <span className="text-gray-800">{shop.userPhone}</span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center">
                    <MapPin size={16} className="mr-2 text-gray-400"/>
                    Thông tin lấy hàng:
                  </span>
                                    <span className="text-gray-800">{shop.address}</span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center">
                    <CreditCard size={16} className="mr-2 text-gray-400"/>
                    Mã số thuế:
                  </span>
                                    <span className="text-gray-800">{shop.taxCode}</span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center">
                    <Info size={16} className="mr-2 text-gray-400"/>
                    Mô tả:
                  </span>
                                    <span className="text-gray-800">{shop.description || 'Không có mô tả'}</span>
                                </div>

                                <div className="flex items-center justify-between py-2">
                                    <span className="text-gray-600">Ngày đăng ký:</span>
                                    <span className="text-gray-800">{formatDate(shop.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tài liệu */}
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <Image size={18} className="mr-2 text-green-600"/>
                                Tài liệu
                            </h4>

                            <div className="space-y-3">
                                {shop.idCardUrl.map((url, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <span className="text-sm font-medium text-gray-700">CCCD {index + 1}</span>
                                        <button
                                            onClick={() => openImageModal(url)}
                                            className="text-blue-600 hover:text-blue-700 p-1 rounded"
                                        >
                                            <Eye size={18}/>
                                        </button>
                                    </div>
                                ))}

                                <div
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <span className="text-sm font-medium text-gray-700">Giấy phép kinh doanh</span>
                                    <button
                                        onClick={() => openImageModal(shop.businessLicenseUrl)}
                                        className="text-blue-600 hover:text-blue-700 p-1 rounded"
                                    >
                                        <Eye size={18}/>
                                    </button>
                                </div>

                                <div
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <span className="text-sm font-medium text-gray-700">Logo cửa hàng</span>
                                    <button
                                        onClick={() => openImageModal(shop.logoUrl)}
                                        className="text-blue-600 hover:text-blue-700 p-1 rounded"
                                    >
                                        <Eye size={18}/>
                                    </button>
                                </div>
                            </div>

                            {/* Action buttons */}
                            {showActions && shop.status === 'PENDING' && (
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => {
                                            onApprove(shop.id);
                                        }}
                                        className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                    >
                                        <Check size={18} className="mr-2"/>
                                        Phê duyệt
                                    </button>
                                    <button
                                        onClick={() => {
                                            onReject(shop.id);
                                        }}
                                        className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                    >
                                        <X size={18} className="mr-2"/>
                                        Từ chối
                                    </button>
                                </div>
                            )}

                            {/* Lock/Unlock button for approved shops */}
                            {showActions && shop.status === 'APPROVED' && (
                                <div className="mt-6">
                                    <button
                                        onClick={() => {
                                            onToggleLock(shop.id);
                                        }}
                                        className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        <Unlock size={18} className="mr-2"/>
                                        Mở khóa Shop
                                    </button>
                                </div>
                            )}

                            {/* Delete button for rejected shops */}
                            {showActions && shop.status === 'REJECTED' && (
                                <div className="mt-6">
                                    <button
                                        onClick={() => {
                                            onDelete(shop.id);
                                        }}
                                        className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                    >
                                        <Trash2 size={18} className="mr-2"/>
                                        Xóa
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <ImageModal
                    open={imageModal.open}
                    onClose={() => {
                        setImageModal({open: false, imageUrl: ''});
                    }}
                    imageName={imageModal.imageUrl}
                />
            </div>
        </>
    );
};

export default ShopApprovalCard;