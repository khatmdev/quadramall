import React from 'react';
import { Clock, Store, Mail } from 'lucide-react';

interface PendingScreenProps {
    storeName?: string;
    email?: string;
    submittedAt?: string;
}

const PendingScreen: React.FC<PendingScreenProps> = ({
                                                         storeName,
                                                         email,
                                                         submittedAt
                                                     }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Clock className="w-12 h-12 text-yellow-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Đang xem xét hồ sơ
    </h1>

    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
    <p className="text-yellow-800 font-medium mb-2">
        Hồ sơ đăng ký của bạn đang được xem xét
    </p>
    <p className="text-yellow-700 text-sm">
        Chúng tôi sẽ xử lý trong vòng 1-2 ngày làm việc
    </p>
    </div>

    {storeName && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <h3 className="font-semibold text-gray-800 mb-3">Thông tin đã đăng ký:</h3>
    <div className="space-y-2">
    <div className="flex items-center gap-2">
    <Store className="w-4 h-4 text-gray-500" />
    <span className="text-sm text-gray-600">Tên cửa hàng:</span>
    <span className="text-sm font-medium">{storeName}</span>
        </div>
        {email && (
            <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Email:</span>
        <span className="text-sm font-medium">{email}</span>
            </div>
        )}
        {submittedAt && (
            <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Ngày gửi:</span>
        <span className="text-sm font-medium">{submittedAt}</span>
            </div>
        )}
        </div>
        </div>
    )}

    <div className="text-gray-600 mb-6 leading-relaxed">
    <p className="mb-2">
        Bạn sẽ nhận được email thông báo kết quả phê duyệt tại địa chỉ email đã đăng ký.
    </p>
    <p className="text-sm text-gray-500">
        Cảm ơn bạn đã chọn QuadraMall!
    </p>
    </div>

    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <h4 className="font-medium text-blue-800 mb-2">Trong thời gian chờ duyệt:</h4>
    <ul className="text-sm text-blue-700 space-y-1 text-left">
        <li>• Chuẩn bị sản phẩm và hình ảnh chất lượng</li>
    <li>• Tìm hiểu về chính sách bán hàng</li>
    <li>• Chuẩn bị kế hoạch kinh doanh</li>
    </ul>
    </div>
    </div>
    </div>
);
};

export default PendingScreen;