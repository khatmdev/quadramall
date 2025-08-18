import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { createApi } from '@/services/axios';
import { sellerRegistrationApi } from '@/services/sellerRegistrationService';
import { uploadImage } from '@/services/uploadService';
import {
    RegistrationDetails,
    RegistrationUpdateRequest,
    RegistrationStatus
} from '@/types/sellerRegistration';
import {
    AlertCircle,
    Edit3,
    Save,
    X,
    Upload,
    ArrowLeft,
    CheckCircle
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

// Khởi tạo API
const api = createApi();
const sellerApi = sellerRegistrationApi(api);

interface RegistrationEditPageProps {
    registrationData: RegistrationDetails;
    onBackToPending: () => void;
}

const RegistrationEditPage: React.FC<RegistrationEditPageProps> = ({
                                                                       registrationData,
                                                                       onBackToPending
                                                                   }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        storeName: registrationData.storeName,
        description: registrationData.description || '',
        pickupContactName: registrationData.pickupContactName || '',
        pickupContactPhone: registrationData.pickupContactPhone || '',
        specificAddress: registrationData.specificAddress || '',
        ward: registrationData.ward || '',
        district: registrationData.district || '',
        city: registrationData.city || '',
        taxCode: registrationData.taxCode || '',
        logoFile: null as File | null,
        idFrontFile: null as File | null,
        idBackFile: null as File | null,
        businessLicenseFile: null as File | null,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateField = (field: string, value: string | File | null): string | null => {
        switch (field) {
            case 'storeName':
                if (!value || (typeof value === 'string' && !value.trim())) {
                    return 'Tên cửa hàng là bắt buộc';
                }
                if (typeof value === 'string' && (value.length < 2 || value.length > 100)) {
                    return 'Tên cửa hàng phải từ 2 đến 100 ký tự';
                }
                break;
            case 'pickupContactName':
                if (!value || (typeof value === 'string' && !value.trim())) {
                    return 'Tên người liên hệ là bắt buộc';
                }
                break;
            case 'pickupContactPhone':
                if (!value || (typeof value === 'string' && !value.trim())) {
                    return 'Số điện thoại liên hệ là bắt buộc';
                }
                if (typeof value === 'string' && !/^\d{10,11}$/.test(value.replace(/\s/g, ''))) {
                    return 'Số điện thoại phải có 10-11 chữ số';
                }
                break;
            case 'specificAddress':
                if (!value || (typeof value === 'string' && !value.trim())) {
                    return 'Địa chỉ cụ thể là bắt buộc';
                }
                break;
            case 'ward':
                if (!value || (typeof value === 'string' && !value.trim())) {
                    return 'Phường/xã là bắt buộc';
                }
                break;
            case 'district':
                if (!value || (typeof value === 'string' && !value.trim())) {
                    return 'Quận/huyện là bắt buộc';
                }
                break;
            case 'city':
                if (!value || (typeof value === 'string' && !value.trim())) {
                    return 'Tỉnh/thành phố là bắt buộc';
                }
                break;
            case 'taxCode':
                if (!value || (typeof value === 'string' && !value.trim())) {
                    return 'Mã số thuế là bắt buộc';
                }
                if (typeof value === 'string' && !/^\d{10}$/.test(value)) {
                    return 'Mã số thuế phải có đúng 10 chữ số';
                }
                break;
        }
        return null;
    };

    const handleFieldChange = (field: string, value: string | File | null) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Validate field
        const error = validateField(field, value);
        setErrors(prev => ({
            ...prev,
            [field]: error || ''
        }));
    };

    const handleSaveField = (field: string) => {
        const value = formData[field as keyof typeof formData];
        const error = validateField(field, value);

        if (error) {
            setErrors(prev => ({ ...prev, [field]: error }));
            return;
        }

        setEditingField(null);
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleCancelEdit = (field: string) => {
        // Reset to original value
        const originalValues = {
            storeName: registrationData.storeName,
            description: registrationData.description || '',
            pickupContactName: registrationData.pickupContactName || '',
            pickupContactPhone: registrationData.pickupContactPhone || '',
            specificAddress: registrationData.specificAddress || '',
            ward: registrationData.ward || '',
            district: registrationData.district || '',
            city: registrationData.city || '',
            taxCode: registrationData.taxCode || '',
        };

        setFormData(prev => ({
            ...prev,
            [field]: originalValues[field as keyof typeof originalValues] || ''
        }));
        setEditingField(null);
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const renderEditableField = (
        label: string,
        field: string,
        type: 'text' | 'textarea' = 'text',
        placeholder?: string
    ) => {
        const isEditing = editingField === field;
        const value = formData[field as keyof typeof formData] as string;
        const error = errors[field];

        return (
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">{label}:</label>
                    {!isEditing && (
                        <button
                            onClick={() => setEditingField(field)}
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            <Edit3 className="w-4 h-4" />
                            <span className="text-sm">Sửa</span>
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <div>
                        {type === 'textarea' ? (
                            <textarea
                                value={value}
                                onChange={(e) => handleFieldChange(field, e.target.value)}
                                placeholder={placeholder}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                rows={3}
                            />
                        ) : (
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => handleFieldChange(field, e.target.value)}
                                placeholder={placeholder}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            />
                        )}

                        {error && (
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                        )}

                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => handleSaveField(field)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-1"
                            >
                                <Save className="w-3 h-3" />
                                Lưu
                            </button>
                            <button
                                onClick={() => handleCancelEdit(field)}
                                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 flex items-center gap-1"
                            >
                                <X className="w-3 h-3" />
                                Hủy
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border">
                        <span className="text-gray-800">
                            {value || <span className="text-gray-500 italic">Chưa có thông tin</span>}
                        </span>
                    </div>
                )}
            </div>
        );
    };

    const renderFileField = (label: string, field: string, currentUrl?: string) => {
        const file = formData[field as keyof typeof formData] as File | null;

        return (
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{label}:</label>

                {/* Current file display */}
                {currentUrl && !file && (
                    <div className="mb-3">
                        <img
                            src={currentUrl}
                            alt={label}
                            className="w-32 h-32 object-cover rounded-lg border"
                        />
                        <p className="text-xs text-gray-500 mt-1">File hiện tại</p>
                    </div>
                )}

                {/* New file preview */}
                {file && (
                    <div className="mb-3">
                        <img
                            src={URL.createObjectURL(file)}
                            alt={label}
                            className="w-32 h-32 object-cover rounded-lg border"
                        />
                        <p className="text-xs text-gray-500 mt-1">File mới: {file.name}</p>
                    </div>
                )}

                {/* File input */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFieldChange(field, e.target.files?.[0] || null)}
                        className="hidden"
                        id={field}
                    />
                    <label
                        htmlFor={field}
                        className="cursor-pointer flex flex-col items-center gap-2"
                    >
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-600">
                            {file || currentUrl ? 'Thay đổi file' : 'Chọn file'}
                        </span>
                        <span className="text-xs text-gray-500">PNG, JPG tối đa 5MB</span>
                    </label>
                </div>
            </div>
        );
    };

    const handleSubmit = async () => {
        // Validate all fields
        const fieldsToValidate = [
            'storeName', 'pickupContactName', 'pickupContactPhone',
            'specificAddress', 'ward', 'district', 'city', 'taxCode'
        ];

        let hasErrors = false;
        const newErrors: Record<string, string> = {};

        fieldsToValidate.forEach(field => {
            const value = formData[field as keyof typeof formData] as string;
            const error = validateField(field, value);
            if (error) {
                newErrors[field] = error;
                hasErrors = true;
            }
        });

        if (hasErrors) {
            setErrors(newErrors);
            toast.error('Vui lòng kiểm tra và sửa các lỗi trước khi gửi');
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Đang cập nhật hồ sơ...');

        try {
            // Upload files if changed
            let logoUrl = registrationData.logoUrl;
            let businessLicenseUrl = registrationData.businessLicenseUrl;
            const idCardUrl = [...(registrationData.idCardUrl || [])];

            if (formData.logoFile) {
                logoUrl = await uploadImage(formData.logoFile);
            }
            if (formData.idFrontFile) {
                idCardUrl[0] = await uploadImage(formData.idFrontFile);
            }
            if (formData.idBackFile) {
                idCardUrl[1] = await uploadImage(formData.idBackFile);
            }
            if (formData.businessLicenseFile) {
                businessLicenseUrl = await uploadImage(formData.businessLicenseFile);
            }

            // Prepare address string
            const fullAddress = [
                formData.pickupContactName,
                formData.pickupContactPhone,
                formData.specificAddress,
                formData.ward,
                formData.district,
                formData.city,
            ].filter(Boolean).join(' , ');

            // Prepare update data
            const updateData: RegistrationUpdateRequest = {
                storeName: formData.storeName,
                address: fullAddress,
                description: formData.description || undefined,
                taxCode: formData.taxCode || undefined,
                logoUrl,
                businessLicenseUrl,
                idCardUrl,
            };

            console.log('Updating registration with data:', updateData);

            // Call API to update registration
            const response = await sellerApi.updateRegistration(registrationData.id, updateData);

            console.log('Update successful:', response);

            toast.update(toastId, {
                render: 'Cập nhật hồ sơ thành công! Đang chờ duyệt lại.',
                type: 'success',
                isLoading: false,
                autoClose: 3000,
            });

            // Go back to pending screen
            onBackToPending();

        } catch (error: any) {
            console.error('Cập nhật thất bại:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
            toast.update(toastId, {
                render: errorMessage,
                type: 'error',
                isLoading: false,
                autoClose: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <ToastContainer />
            <div className="max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <button
                        onClick={onBackToPending}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Quay lại
                    </button>

                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Chỉnh sửa hồ sơ đăng ký</h1>

                    {/* Rejection reason */}
                    {registrationData.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-red-800 mb-1">Lý do từ chối:</h4>
                                    <p className="text-red-700 text-sm">{registrationData.rejectionReason}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Form sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Store Information */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cửa hàng</h3>

                        {renderEditableField('Tên cửa hàng', 'storeName', 'text', 'Nhập tên cửa hàng')}
                        {renderEditableField('Mô tả cửa hàng', 'description', 'textarea', 'Mô tả về cửa hàng của bạn')}
                        {renderEditableField('Mã số thuế', 'taxCode', 'text', 'Nhập mã số thuế')}
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin liên hệ</h3>

                        {renderEditableField('Tên người liên hệ', 'pickupContactName', 'text', 'Họ và tên người liên hệ')}
                        {renderEditableField('Số điện thoại liên hệ', 'pickupContactPhone', 'text', 'Số điện thoại liên hệ')}

                        <div className="mb-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email:</label>
                            <div className="p-3 bg-gray-100 rounded-lg border">
                                <span className="text-gray-600">{registrationData.email}</span>
                                <span className="text-xs text-gray-500 ml-2">(Không thể thay đổi)</span>
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Địa chỉ</h3>

                        {renderEditableField('Địa chỉ cụ thể', 'specificAddress', 'text', 'Số nhà, tên đường')}
                        {renderEditableField('Phường/Xã', 'ward', 'text', 'Nhập phường/xã')}
                        {renderEditableField('Quận/Huyện', 'district', 'text', 'Nhập quận/huyện')}
                        {renderEditableField('Tỉnh/Thành phố', 'city', 'text', 'Nhập tỉnh/thành phố')}
                    </div>

                    {/* Documents */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tài liệu</h3>

                        {renderFileField('Logo cửa hàng', 'logoFile', registrationData.logoUrl)}
                        {renderFileField('CMND/CCCD mặt trước', 'idFrontFile', registrationData.idCardUrl?.[0])}
                        {renderFileField('CMND/CCCD mặt sau', 'idBackFile', registrationData.idCardUrl?.[1])}
                        {renderFileField('Giấy phép kinh doanh (nếu có)', 'businessLicenseFile', registrationData.businessLicenseUrl)}
                    </div>
                </div>

                {/* Submit button */}
                <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || editingField !== null}
                            className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Đang cập nhật...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Gửi lại hồ sơ
                                </>
                            )}
                        </button>
                    </div>

                    {editingField && (
                        <p className="text-sm text-amber-600 mt-2 text-right">
                            Vui lòng hoàn tất chỉnh sửa trước khi gửi
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegistrationEditPage;