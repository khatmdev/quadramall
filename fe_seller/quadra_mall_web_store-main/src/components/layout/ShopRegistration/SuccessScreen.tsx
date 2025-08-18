import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';

const SuccessScreen: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    Đăng ký thành công!
                </h1>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    Hồ sơ của bạn đã được gửi đi. Chúng tôi sẽ xem xét và phản hồi trong vòng 1-2 ngày làm việc qua email.
                </p>
                <button
                    onClick={() => window.location.href = 'http://localhost:5174/'}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    Về trang chủ
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default SuccessScreen;