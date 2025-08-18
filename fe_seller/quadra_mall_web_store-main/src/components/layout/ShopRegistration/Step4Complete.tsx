import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Edit3, X } from 'lucide-react';
import { ShopFormData } from '@/types/ShopRegistration';

interface Step4CompleteProps {
    formData: ShopFormData;
    onSubmit: () => void;
    isSubmitting: boolean;
    isEditMode?: boolean;
    rejectionReason?: string;
    onUpdateFormData?: (updates: Partial<ShopFormData>) => void;
    onEditField?: (field: string) => void;
}

const Step4Complete: React.FC<Step4CompleteProps> = ({
                                                         formData,
                                                         onSubmit,
                                                         isSubmitting,
                                                         isEditMode = false,
                                                         rejectionReason,
                                                         onUpdateFormData,
                                                         onEditField
                                                     }) => {
    const [editingField, setEditingField] = useState<string | null>(null);
    const [tempValues, setTempValues] = useState<Record<string, any>>({});

    // Gộp địa chỉ thành chuỗi để hiển thị
    const fullAddress = [
        formData.pickupContactName,
        formData.pickupContactPhone,
        formData.address,
        formData.ward,
        formData.district,
        formData.city,
    ].filter(Boolean).join(' , ');

    const handleEditStart = (field: string, currentValue: any) => {
        setEditingField(field);
        setTempValues({ [field]: currentValue });
    };

    const handleEditCancel = () => {
        setEditingField(null);
        setTempValues({});
    };

    const handleEditSave = () => {
        if (editingField && onUpdateFormData) {
            onUpdateFormData(tempValues);
        }
        setEditingField(null);
        setTempValues({});
    };

    const handleFileChange = (field: string, file: File | null) => {
        setTempValues({ [field]: file });
    };

    // Component cho việc chỉnh sửa text field
    const EditableField = ({
                               field,
                               label,
                               value,
                               type = 'text',
                               isTextarea = false
                           }: {
        field: string;
        label: string;
        value: string;
        type?: string;
        isTextarea?: boolean;
    }) => {
        const isEditing = editingField === field;

        return (
            <div className="flex justify-between items-center">
                <span className="text-gray-600">{label}:</span>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            {isTextarea ? (
                                <textarea
                                    value={tempValues[field] || ''}
                                    onChange={(e) => setTempValues({ [field]: e.target.value })}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm w-48 h-16"
                                    rows={2}
                                />
                            ) : (
                                <input
                                    type={type}
                                    value={tempValues[field] || ''}
                                    onChange={(e) => setTempValues({ [field]: e.target.value })}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm w-32"
                                />
                            )}
                            <button
                                onClick={handleEditSave}
                                className="text-green-600 hover:text-green-700"
                            >
                                <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleEditCancel}
                                className="text-red-600 hover:text-red-700"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{value || '-'}</span>
                            {isEditMode && (
                                <button
                                    onClick={() => handleEditStart(field, value)}
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Component cho việc chỉnh sửa file
    const EditableFile = ({
                              field,
                              label,
                              file
                          }: {
        field: string;
        label: string;
        file: File | null;
    }) => {
        const isEditing = editingField === field;

        return (
            <div className="text-center">
                <div className="flex justify-center items-center gap-2 mb-2">
                    <p className="text-gray-600 text-sm font-medium">{label}</p>
                    {isEditMode && !isEditing && (
                        <button
                            onClick={() => handleEditStart(field, file)}
                            className="text-blue-600 hover:text-blue-700"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <div className="space-y-2">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
                            className="text-xs w-full"
                        />
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={handleEditSave}
                                className="text-green-600 hover:text-green-700"
                            >
                                <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleEditCancel}
                                className="text-red-600 hover:text-red-700"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {file ? (
                            file.type.startsWith('image/') ? (
                                <>
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        className="w-32 h-32 object-cover rounded-lg mx-auto"
                                    />
                                    <p className="text-gray-500 text-xs mt-2">{file.name}</p>
                                </>
                            ) : (
                                <p className="text-gray-500 text-sm">{file.name}</p>
                            )
                        ) : (
                            <p className="text-gray-500 text-sm">-</p>
                        )}
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            {/* Hiển thị lỗi rejection nếu có */}
            {isEditMode && rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-medium text-red-800 mb-1">Hồ sơ của bạn cần chỉnh sửa</h4>
                            <p className="text-red-700 text-sm">{rejectionReason}</p>
                            <p className="text-red-600 text-xs mt-2">
                                Vui lòng chỉnh sửa thông tin theo yêu cầu và gửi lại.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {isEditMode ? 'Chỉnh sửa thông tin' : 'Xác nhận thông tin'}
            </h2>

            <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">Thông tin đã điền:</h3>
                    {isEditMode && (
                        <p className="text-sm text-blue-600">
                            <Edit3 className="w-4 h-4 inline mr-1" />
                            Nhấn vào biểu tượng chỉnh sửa để thay đổi
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-3">
                        <EditableField
                            field="shopName"
                            label="Tên Shop"
                            value={formData.shopName}
                        />
                        <EditableField
                            field="email"
                            label="Email"
                            value={formData.email}
                            type="email"
                        />
                        <EditableField
                            field="phone"
                            label="Số điện thoại"
                            value={formData.phone}
                            type="tel"
                        />
                        <EditableField
                            field="description"
                            label="Mô tả Shop"
                            value={formData.description}
                            isTextarea={true}
                        />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Địa chỉ lấy hàng:</span>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-right max-w-48 break-words">
                                    {fullAddress || '-'}
                                </span>
                                {isEditMode && (
                                    <button
                                        onClick={() => onEditField?.('address')}
                                        className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <EditableField
                            field="idNumber"
                            label="Mã số thuế"
                            value={formData.idNumber}
                        />
                    </div>
                </div>

                <h3 className="font-semibold text-gray-800 mb-4">Tài liệu đã tải lên:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <EditableFile
                        field="logo"
                        label="Logo Shop"
                        file={formData.logo}
                    />
                    <EditableFile
                        field="idFrontImage"
                        label="Ảnh mặt trước CMND/CCCD"
                        file={formData.idFrontImage}
                    />
                    <EditableFile
                        field="idBackImage"
                        label="Ảnh mặt sau CMND/CCCD"
                        file={formData.idBackImage}
                    />
                    <EditableFile
                        field="businessLicense"
                        label="Giấy phép kinh doanh"
                        file={formData.businessLicense}
                    />
                </div>
            </div>

            <div className={`border rounded-lg p-4 mb-6 ${
                isEditMode ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'
            }`}>
                <h4 className={`font-medium mb-2 ${
                    isEditMode ? 'text-blue-800' : 'text-green-800'
                }`}>
                    {isEditMode ? 'Lưu ý khi chỉnh sửa:' : 'Lưu ý quan trọng:'}
                </h4>
                <ul className={`text-sm space-y-2 list-disc list-inside ${
                    isEditMode ? 'text-blue-700' : 'text-green-700'
                }`}>
                    {isEditMode ? (
                        <>
                            <li>Vui lòng chỉnh sửa thông tin theo yêu cầu từ phản hồi</li>
                            <li>Đảm bảo tất cả thông tin chính xác và đầy đủ</li>
                            <li>Hồ sơ sẽ được xem xét lại sau khi gửi</li>
                        </>
                    ) : (
                        <>
                            <li>Thông tin bạn cung cấp sẽ được xem xét trong vòng 1-2 ngày làm việc</li>
                            <li>Bạn sẽ nhận được email thông báo kết quả phê duyệt</li>
                            <li>Sau khi được duyệt, bạn có thể bắt đầu bán hàng ngay trên QuadraMall</li>
                        </>
                    )}
                </ul>
            </div>

            <button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang xử lý...
                    </>
                ) : (
                    <>
                        <CheckCircle className="w-5 h-5" />
                        {isEditMode ? 'Gửi lại hồ sơ' : 'Hoàn tất đăng ký'}
                    </>
                )}
            </button>
        </div>
    );
};

export default Step4Complete;