import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ExclamationTriangleIcon, LockClosedIcon, FlagIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { StoreStatus } from '@/types/sellerRegistration';

interface StoreStatusNotificationProps {
    status?: StoreStatus;
    storeName?: string;
}

const StoreStatusNotification: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { status, storeName } = location.state as StoreStatusNotificationProps || {};

    const getStatusConfig = (status: StoreStatus) => {
        switch (status) {
            case StoreStatus.INACTIVE:
                return {
                    icon: <ExclamationTriangleIcon className="w-16 h-16 text-yellow-600" />,
                    title: 'Cửa hàng tạm ngừng hoạt động',
                    bgColor: 'from-yellow-50 to-orange-100',
                    borderColor: 'border-yellow-200',
                    textColor: 'text-yellow-800',
                    message: 'Cửa hàng của bạn hiện đang ở trạng thái tạm ngừng hoạt động.',
                    description: 'Bạn có thể liên hệ với bộ phận hỗ trợ để biết thêm chi tiết và cách kích hoạt lại cửa hàng.',
                    actionText: 'Liên hệ hỗ trợ'
                };
            case StoreStatus.LOCKED:
                return {
                    icon: <LockClosedIcon className="w-16 h-16 text-red-600" />,
                    title: 'Cửa hàng bị khóa',
                    bgColor: 'from-red-50 to-pink-100',
                    borderColor: 'border-red-200',
                    textColor: 'text-red-800',
                    message: 'Cửa hàng của bạn đã bị khóa do vi phạm chính sách.',
                    description: 'Vui lòng kiểm tra email để biết lý do cụ thể và hướng dẫn khắc phục. Liên hệ với bộ phận hỗ trợ nếu cần thêm thông tin.',
                    actionText: 'Liên hệ hỗ trợ'
                };
            case StoreStatus.REPORTED:
                return {
                    icon: <FlagIcon className="w-16 h-16 text-orange-600" />,
                    title: 'Cửa hàng đang được xem xét',
                    bgColor: 'from-orange-50 to-yellow-100',
                    borderColor: 'border-orange-200',
                    textColor: 'text-orange-800',
                    message: 'Cửa hàng của bạn đang được xem xét do có báo cáo từ khách hàng.',
                    description: 'Chúng tôi đang trong quá trình điều tra. Cửa hàng sẽ được mở lại sau khi hoàn tất xem xét.',
                    actionText: 'Theo dõi tình trạng'
                };
            default:
                return {
                    icon: <ExclamationTriangleIcon className="w-16 h-16 text-gray-600" />,
                    title: 'Cửa hàng không khả dụng',
                    bgColor: 'from-gray-50 to-gray-100',
                    borderColor: 'border-gray-200',
                    textColor: 'text-gray-800',
                    message: 'Cửa hàng hiện không thể truy cập.',
                    description: 'Vui lòng liên hệ với bộ phận hỗ trợ để biết thêm chi tiết.',
                    actionText: 'Liên hệ hỗ trợ'
                };
        }
    };

    const config = status ? getStatusConfig(status) : getStatusConfig(StoreStatus.INACTIVE);

    const handleBackToSelectStore = () => {
        navigate('/select-store', { replace: true });
    };

    const handleContactSupport = () => {
        // Implement contact support logic
        window.open('mailto:support@quadramall.com', '_blank');
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br ${config.bgColor} flex items-center justify-center px-4`}>
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    {config.icon}
                </div>

                {/* Title */}
                <h1 className={`text-2xl font-bold ${config.textColor} mb-4`}>
                    {config.title}
                </h1>

                {/* Store Name */}
                {storeName && (
                    <p className="text-gray-600 mb-4">
                        <span className="font-medium">Cửa hàng:</span> {storeName}
                    </p>
                )}

                {/* Message */}
                <div className={`border ${config.borderColor} rounded-lg p-4 mb-6`}>
                    <p className={`${config.textColor} font-medium mb-2`}>
                        {config.message}
                    </p>
                    <p className="text-gray-600 text-sm">
                        {config.description}
                    </p>
                </div>

                {/* Contact Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-gray-800 mb-2">Thông tin hỗ trợ:</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>📧 Email: support@quadramall.com</p>
                        <p>📞 Hotline: 1900-xxxx</p>
                        <p>🕐 Giờ làm việc: 8:00 - 22:00</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={handleContactSupport}
                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
                            status === StoreStatus.LOCKED
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : status === StoreStatus.REPORTED
                                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        }`}
                    >
                        {config.actionText}
                    </button>

                    <button
                        onClick={handleBackToSelectStore}
                        className="w-full py-3 px-6 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Chọn cửa hàng khác
                    </button>
                </div>

                {/* Additional Info */}
                <div className="mt-6 text-xs text-gray-500">
                    <p>Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ với bộ phận hỗ trợ kỹ thuật.</p>
                </div>
            </div>
        </div>
    );
};

export default StoreStatusNotification;