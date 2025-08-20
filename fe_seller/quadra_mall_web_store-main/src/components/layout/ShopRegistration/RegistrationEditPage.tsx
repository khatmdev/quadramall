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
    CheckCircle,
    Store,
    Trash2,
    AlertTriangle
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Khởi tạo API
const api = createApi();
const sellerApi = sellerRegistrationApi(api);

interface RegistrationEditPageProps {
    registrationData: RegistrationDetails;
    onBackToPending: () => void;
}

// Confirmation Modal Component
interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    type: 'danger' | 'warning';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
                                                                 isOpen,
                                                                 onClose,
                                                                 onConfirm,
                                                                 title,
                                                                 message,
                                                                 confirmText,
                                                                 cancelText,
                                                                 type
                                                             }) => {
    if (!isOpen) return null;

    const iconColor = type === 'danger' ? 'text-red-600' : 'text-yellow-600';
    const bgColor = type === 'danger' ? 'bg-red-50' : 'bg-yellow-50';
    const borderColor = type === 'danger' ? 'border-red-200' : 'border-yellow-200';
    const buttonColor = type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className={`${bgColor} ${borderColor} border rounded-lg p-4 mb-4`}>
                    <div className="flex items-start gap-3">
                        {type === 'danger' ? (
                            <AlertTriangle className={`w-6 h-6 ${iconColor} flex-shrink-0 mt-0.5`} />
                        ) : (
                            <AlertCircle className={`w-6 h-6 ${iconColor} flex-shrink-0 mt-0.5`} />
                        )}
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
                            <p className="text-gray-700 text-sm">{message}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 ${buttonColor} text-white rounded-lg transition-colors`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RegistrationEditPage: React.FC<RegistrationEditPageProps> = ({
                                                                       registrationData,
                                                                       onBackToPending
                                                                   }) => {
    const { user, storeIds } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    // Kiểm tra xem user đã có cửa hàng nào chưa (logic giống SelectStore)
    const hasExistingStores = storeIds && storeIds.length > 0;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
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

    const handleCancelRegistration = async () => {
        setIsCancelling(true);
        const toastId = toast.loading('Đang hủy đăng ký...');

        try {
            await sellerApi.cancelRegistration(registrationData.id);

            toast.update(toastId, {
                render: 'Đăng ký đã được hủy thành công!',
                type: 'success',
                isLoading: false,
                autoClose: 3000,
            });

            // Đợi một chút để user thấy thông báo thành công
            setTimeout(() => {
                onBackToPending();
            }, 1500);

        } catch (error: any) {
            console.error('Hủy đăng ký thất bại:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi hủy đăng ký';
            toast.update(toastId, {
                render: errorMessage,
                type: 'error',
                isLoading: false,
                autoClose: 5000,
            });
        } finally {
            setIsCancelling(false);
            setShowCancelModal(false);
        }
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

                {/* Combined display and input */}
                <div className="relative">
                    {/* Current or new file display */}
                    {(currentUrl || file) && (
                        <div className="mb-3 relative group">
                            <img
                                src={file ? URL.createObjectURL(file) : currentUrl}
                                alt={label}
                                className="w-32 h-32 object-cover rounded-lg border cursor-pointer hover:opacity-75 transition-opacity"
                                onClick={() => document.getElementById(field)?.click()}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-lg cursor-pointer w-32 h-32"
                                 onClick={() => document.getElementById(field)?.click()}>
                                <div className="text-white text-center">
                                    <Upload className="w-6 h-6 mx-auto mb-1" />
                                    <span className="text-xs">Thay đổi</span>
                                </div>
                            </div>
                            {file && (
                                <p className="text-xs text-green-600 mt-1 font-medium">File mới: {file.name}</p>
                            )}
                            {!file && currentUrl && (
                                <p className="text-xs text-gray-500 mt-1">Click để thay đổi file</p>
                            )}
                        </div>
                    )}

                    {/* Upload area when no file */}
                    {!currentUrl && !file && (
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg w-32 h-32 flex flex-col items-center justify-center hover:border-green-500 transition-colors cursor-pointer"
                            onClick={() => document.getElementById(field)?.click()}
                        >
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-xs text-gray-600 text-center">Click để chọn</span>
                        </div>
                    )}

                    {!currentUrl && !file && (
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG, GIF, WEBP tối đa 5MB</p>
                    )}

                    {/* Hidden file input */}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFieldChange(field, e.target.files?.[0] || null)}
                        className="hidden"
                        id={field}
                    />
                </div>
            </div>
        );
    };

    const handleSubmit = async () => {
        // Validate all fields
        const fieldsToValidate = [
            'storeName', 'pickupContactName', 'pickupContactPhone',
            'specificAddress', 'taxCode'
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

            // Prepare address string - sử dụng address gốc từ registration data
            const fullAddress = registrationData.address;

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

    const handleGoToSelectStore = () => {
        navigate('/select-store');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <ToastContainer />

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancelRegistration}
                title="Xác nhận hủy đăng ký"
                message="Bạn có chắc chắn muốn hủy đăng ký này không? Hành động này không thể hoàn tác và bạn sẽ cần đăng ký lại từ đầu nếu muốn trở thành người bán."
                confirmText="Hủy đăng ký"
                cancelText="Giữ lại"
                type="danger"
            />

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

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ đầy đủ:</label>
                            <div className="p-3 bg-gray-100 rounded-lg border">
                                <span className="text-gray-600">{registrationData.address}</span>
                                <span className="text-xs text-gray-500 ml-2">(Từ dữ liệu đã đăng ký)</span>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tài liệu</h3>

                        <div className="grid grid-cols-2 gap-6">
                            {renderFileField('Logo cửa hàng', 'logoFile', registrationData.logoUrl)}
                            {renderFileField('CMND/CCCD mặt trước', 'idFrontFile', registrationData.idCardUrl?.[0])}
                            {renderFileField('CMND/CCCD mặt sau', 'idBackFile', registrationData.idCardUrl?.[1])}
                            {renderFileField('Giấy phép kinh doanh (nếu có)', 'businessLicenseFile', registrationData.businessLicenseUrl)}
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                    <div className="flex justify-between items-center">
                        {/* Left side - Cancel registration button */}
                        <button
                            onClick={() => setShowCancelModal(true)}
                            disabled={isCancelling || isSubmitting}
                            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
                        >
                            {isCancelling ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Đang hủy...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-5 h-5" />
                                    Hủy đăng ký
                                </>
                            )}
                        </button>

                        {/* Right side - Other actions */}
                        <div className="flex gap-3">
                            {/* Nút chuyển đến SelectStore nếu user đã có stores */}
                            {hasExistingStores && (
                                <button
                                    onClick={handleGoToSelectStore}
                                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                                >
                                    <Store className="w-5 h-5" />
                                    Quản lý cửa hàng hiện có
                                </button>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || editingField !== null || isCancelling}
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