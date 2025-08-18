// PaymentMethodComponent.tsx
import React from 'react';
import { CreditCard, Smartphone, Truck } from 'lucide-react';
import  type { PaymentMethod } from '../../types/checkout.d.ts';

interface PaymentMethodComponentProps {
    paymentMethods:  PaymentMethod[];
    onSelect: (methodId: string) => void;
}

const PaymentMethodComponent: React.FC<PaymentMethodComponentProps> = ({
                                                                           paymentMethods,
                                                                           onSelect
                                                                       }) => {
    const getPaymentIcon = (methodId: string) => {
        switch (methodId) {
            case 'vnpay':
                return <CreditCard className="w-6 h-6 text-blue-600" />;
            case 'momo':
                return <Smartphone className="w-6 h-6 text-pink-600" />;
            case 'cod':
                return <Truck className="w-6 h-6 text-orange-600" />;
            default:
                return <CreditCard className="w-6 h-6 text-gray-600" />;
        }
    };

    const getPaymentDescription = (methodId: string) => {
        switch (methodId) {
            case 'vnpay':
                return 'Thanh toán qua thẻ ATM, Visa, MasterCard';
            case 'momo':
                return 'Thanh toán qua ví MoMo';
            case 'cod':
                return 'Thanh toán khi nhận hàng';
            default:
                return '';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
                <h2 className="text-lg fo nt-semibold text-gray-900">Phương thức thanh toán</h2>
            </div>

            <div className="p-4">
                <div className="space-y-3">
                    {paymentMethods.map((method) => (
                        <div
                            key={method.id}
                            onClick={() => onSelect(method.id)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                                method.selected
                                    ? 'border-green-500 bg-green-50 shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    method.selected
                                        ? 'border-green-500 bg-green-500'
                                        : 'border-gray-300'
                                }`}>
                                    {method.selected && (
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    )}
                                </div>

                                <div className="flex items-center space-x-3 flex-1">
                                    {getPaymentIcon(method.id)}
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 text-sm">
                                            {method.name}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {getPaymentDescription(method.id)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Payment Security Info */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-blue-800 font-medium">
                                Thông tin thanh toán được bảo mật
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                Tất cả giao dịch được mã hóa SSL 256-bit để đảm bảo an toàn tuyệt đối
                            </p>
                        </div>
                    </div>
                </div>

                {/* Selected Payment Method Info */}
                {paymentMethods.find(m => m.selected) && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-700">
                            <span className="font-medium">Phương thức đã chọn: </span>
                            {paymentMethods.find(m => m.selected)?.name}
                        </div>
                        {paymentMethods.find(m => m.selected)?.id === 'cod' && (
                            <div className="text-xs text-orange-600 mt-1">
                                * Vui lòng chuẩn bị đủ tiền mặt khi nhận hàng
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentMethodComponent;