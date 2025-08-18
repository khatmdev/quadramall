import React from 'react';
import { Store, Mail, Phone } from 'lucide-react';
import FormInput from './FormInput';
import { ShopFormData } from '@/types/ShopRegistration';

interface Step1ShopInfoProps {
    formData: ShopFormData;
    updateFormData: (updates: Partial<ShopFormData>) => void;
    errors: Record<string, string>;
    emailDisabled?: boolean;
    phoneDisabled?: boolean;
}

const Step1ShopInfo: React.FC<Step1ShopInfoProps> = ({
                                                         formData,
                                                         updateFormData,
                                                         errors,
                                                         emailDisabled = false,
                                                         phoneDisabled = false
                                                     }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            updateFormData({ logo: file });
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin Shop</h2>
            <div className="space-y-6">
                <FormInput
                    label="Tên Shop"
                    name="shopName"
                    value={formData.shopName}
                    onChange={(value) => updateFormData({ shopName: value })}
                    placeholder="Nhập tên shop của bạn"
                    required
                    maxLength={30}
                    error={errors.shopName}
                    icon={<Store className="w-5 h-5" />}
                />
                <FormInput
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(value) => updateFormData({ email: value })}
                    placeholder="Nhập email"
                    required
                    disabled={emailDisabled}
                    error={errors.email}
                    icon={<Mail className="w-5 h-5" />}
                />
                <FormInput
                    label="Số điện thoại"
                    name="phone"
                    value={formData.phone}
                    onChange={(value) => updateFormData({ phone: value })}
                    placeholder="Nhập số điện thoại"
                    required
                    disabled={phoneDisabled}
                    error={errors.phone}
                    icon={<Phone className="w-5 h-5" />}
                />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả Shop
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => updateFormData({ description: e.target.value })}
                        placeholder="Mô tả ngắn về shop của bạn (tối đa 500 ký tự)"
                        rows={4}
                        maxLength={500}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 bg-gray-50 resize-none"
                    />
                    <div className="text-right text-xs text-gray-500 mt-2">
                        {formData.description.length}/500
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo Shop
                    </label>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handleFileChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 bg-gray-50"
                    />
                    {formData.logo && (
                        <div className="text-sm text-gray-600 mt-2">
                            File đã chọn: {formData.logo.name}
                        </div>
                    )}
                    {errors.logo && (
                        <div className="text-sm text-red-600 mt-2">{errors.logo}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Step1ShopInfo;