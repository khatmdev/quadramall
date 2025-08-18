import React from 'react';
import { UserCheck, User } from 'lucide-react';
import FormInput from './FormInput';
import FileUpload from './FileUpload';
import { ShopFormData } from '@/types/ShopRegistration';

interface Step3TaxInfoProps {
    formData: ShopFormData;
    updateFormData: (updates: Partial<ShopFormData>) => void;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    errors: Record<string, string>;
}

const Step3TaxInfo: React.FC<Step3TaxInfoProps> = ({ formData, updateFormData, setErrors, errors }) => {
    const validateTaxCode = (value: string) => {
        const cleanValue = value.replace(/\s/g, '');
        if (!/^\d{10}$/.test(cleanValue)) {
            return 'Mã số thuế không hợp lệ!';
        }
        return '';
    };

    const handleTaxCodeChange = (value: string) => {
        updateFormData({ idNumber: value });
        const error = validateTaxCode(value);
        setErrors((prev) => ({ ...prev, idNumber: error }));
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin định danh</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                    <UserCheck className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                    <div>
                        <h3 className="font-medium text-green-800 mb-1">Thông tin định danh</h3>
                        <p className="text-sm text-green-700">
                            Vui lòng cung cấp mã số thuế và ảnh CMND/CCCD chính xác để xác minh danh tính theo quy định pháp luật Việt Nam.
                            Đảm bảo ảnh CMND/CCCD rõ nét và không bị che khuất.
                        </p>
                    </div>
                </div>
            </div>
            <FormInput
                label="Mã số thuế"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleTaxCodeChange}
                placeholder="Nhập mã số thuế cá nhân"
                required
                error={errors.idNumber}
                icon={<User className="w-5 h-5" />}
                maxLength={10}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUpload
                    label="Ảnh mặt trước CMND/CCCD"
                    file={formData.idFrontImage}
                    onFileChange={(file) => updateFormData({ idFrontImage: file })}
                    accept="image/png,image/jpeg"
                    required
                    error={errors.idFrontImage}
                />
                <FileUpload
                    label="Ảnh mặt sau CMND/CCCD"
                    file={formData.idBackImage}
                    onFileChange={(file) => updateFormData({ idBackImage: file })}
                    accept="image/png,image/jpeg"
                    required
                    error={errors.idBackImage}
                />
            </div>
            <FileUpload
                label="Giấy phép kinh doanh (nếu có)"
                file={formData.businessLicense}
                onFileChange={(file) => updateFormData({ businessLicense: file })}
                accept="image/png,image/jpeg,application/pdf"
                error={errors.businessLicense}
            />
        </div>
    );
};

export default Step3TaxInfo;