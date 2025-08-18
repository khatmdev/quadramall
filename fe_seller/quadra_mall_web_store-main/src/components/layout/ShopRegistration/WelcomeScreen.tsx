import React from 'react';
import { Store, ArrowRight } from 'lucide-react';

const WelcomeScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Store className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    Chào mừng đến với QuadraMall!
                </h1>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    Vui lòng cung cấp thông tin để thành lập tài khoản người bán trên QuadraMall
                </p>
                <button
                    onClick={onStart}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    Bắt đầu đăng ký
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default WelcomeScreen;