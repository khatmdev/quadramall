import React, { useState } from 'react';
import {
    Store,
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    FileText,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    Upload,
    Eye,
    EyeOff,
    Clock,
    Send
} from 'lucide-react';

// Types
interface ShopFormData {
    shopName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward: string;
    description: string;
    idNumber: string;
    idFrontImage: File | null;
    idBackImage: File | null;
    businessLicense: File | null;
    bankAccount: string;
    bankName: string;
    accountHolder: string;
}

// Welcome Screen Component
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

// Success Screen Component
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
                    onClick={() => window.location.href = '/'}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    Về trang chủ
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

// Step Indicator Component
const StepIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({
                                                                                  currentStep,
                                                                                  totalSteps
                                                                              }) => {
    const steps = [
        { id: 1, title: 'Thông tin Shop', icon: Store },
        { id: 2, title: 'Địa chỉ lấy hàng', icon: MapPin },
        { id: 3, title: 'Thông tin thuế', icon: FileText },
        { id: 4, title: 'Thông tin định danh', icon: User },
        { id: 5, title: 'Hoàn tất', icon: CheckCircle }
    ];

    return (
        <div className="bg-white shadow-sm border-b px-4 py-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = step.id === currentStep;
                        const isCompleted = step.id < currentStep;
                        const isLast = index === steps.length - 1;

                        return (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-200 ${
                                            isCompleted
                                                ? 'bg-green-600 border-green-600 text-white'
                                                : isActive
                                                    ? 'bg-green-500 border-green-500 text-white'
                                                    : 'bg-gray-100 border-gray-300 text-gray-400'
                                        }`}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle className="w-6 h-6" />
                                        ) : (
                                            <Icon className="w-6 h-6" />
                                        )}
                                    </div>
                                    <span
                                        className={`mt-2 text-sm font-medium text-center ${
                                            isActive ? 'text-green-600' : 'text-gray-500'
                                        } hidden sm:block`}
                                    >
                    {step.title}
                  </span>
                                </div>

                                {!isLast && (
                                    <div
                                        className={`flex-1 h-1 mx-4 ${
                                            isCompleted ? 'bg-green-600' : 'bg-gray-200'
                                        }`}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Form Input Component
const FormInput: React.FC<{
    label: string;
    name: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    maxLength?: number;
    icon?: React.ReactNode;
    disabled?: boolean;
}> = ({
          label,
          name,
          type = 'text',
          value,
          onChange,
          placeholder,
          required,
          error,
          maxLength,
          icon,
          disabled
      }) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
        <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {required && <span className="text-red-500 mr-1">*</span>}
                {label}
                {maxLength && (
                    <span className="text-gray-400 ml-2 text-xs">
            {value.length}/{maxLength}
          </span>
                )}
            </label>

            <div className="relative">
                {icon && (
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}

                <input
                    type={inputType}
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    disabled={disabled}
                    className={`w-full px-4 py-3 ${icon ? 'pl-12' : ''} ${
                        type === 'password' ? 'pr-12' : ''
                    } border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 bg-gray-50 ${
                        error ? 'border-red-500' : 'border-gray-300'
                    } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />

                {type === 'password' && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                )}
            </div>

            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
    );
};

// File Upload Component
const FileUpload: React.FC<{
    label: string;
    file: File | null;
    onFileChange: (file: File | null) => void;
    accept?: string;
    required?: boolean;
    error?: string;
}> = ({ label, file, onFileChange, accept, required, error }) => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
            alert('Kích thước file vượt quá 5MB');
            return;
        }
        onFileChange(selectedFile);
    };

    return (
        <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {required && <span className="text-red-500 mr-1">*</span>}
                {label}
            </label>

            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors duration-200 bg-gray-50">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />

                {file ? (
                    <div>
                        <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button
                            onClick={() => onFileChange(null)}
                            className="mt-2 text-sm text-red-500 hover:text-red-600"
                        >
                            Xóa file
                        </button>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Kéo thả hoặc chọn file</p>
                        <p className="text-xs text-gray-500">PNG, JPG, PDF (tối đa 5MB)</p>
                    </div>
                )}

                <input
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
            </div>

            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
    );
};

// Step 1: Shop Information
const Step1ShopInfo: React.FC<{
    formData: ShopFormData;
    updateFormData: (updates: Partial<ShopFormData>) => void;
    errors: Record<string, string>;
    sendOtp: () => Promise<boolean>;
    verifyOtp: (otp: string) => Promise<boolean>;
    isOtpSent: boolean;
    isOtpVerified: boolean;
}> = ({ formData, updateFormData, errors, sendOtp, verifyOtp, isOtpSent, isOtpVerified }) => {
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');

    const handleSendOtp = async () => {
        // if (!formData.phone.trim()) {
        //     setErrors(prev => ({ ...prev, phone: 'Số điện thoại là bắt buộc' }));
        //     return;
        // }
        // if (!/^\d{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
        //     setErrors(prev => ({ ...prev, phone: 'Số điện thoại phải có 10-11 chữ số' }));
        //     return;
        // }
        // const success = await sendOtp();
        // if (!success) {
        //     setErrors(prev => ({ ...prev, phone: 'Không thể gửi mã OTP. Vui lòng thử lại.' }));
        // }
        console.log('Sending OTP...');
    }

    const handleVerifyOtp = async () => {
        if (!otp.trim()) {
            setOtpError('Mã OTP là bắt buộc');
            return;
        }
        
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin Shop</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    error={errors.email}
                    icon={<Mail className="w-5 h-5" />}
                />

                <div className="space-y-4">
                    <div className="flex items-center gap-4">
  <FormInput
    label="Số điện thoại"
    name="phone"
    value={formData.phone}
    onChange={(value) => updateFormData({ phone: value })}
    placeholder="Nhập số điện thoại"
    required
    error={errors.phone}
    icon={<Phone className="w-5 h-5" />}
    disabled={isOtpVerified}
  />
  {!isOtpVerified && (
    <button
      onClick={handleSendOtp}
      disabled={isOtpSent && !isOtpVerified}
      className={`flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 ${
        isOtpSent && !isOtpVerified ? 'cursor-not-allowed' : ''
      }`}
    >
      <Send className="w-[50px] h-5" />
      OTP
    </button>
  )}
</div>


                    {isOtpSent && !isOtpVerified && (
                        <div className="flex items-end gap-4">
                            <FormInput
                                label="Mã OTP"
                                name="otp"
                                value={otp}
                                onChange={setOtp}
                                placeholder="Nhập mã OTP 6 chữ số"
                                required
                                maxLength={6}
                                error={otpError}
                                icon={<CheckCircle className="w-5 h-5" />}
                            />
                            <button
                                onClick={handleVerifyOtp}
                                className="flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 mt-2"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Xác thực
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6">
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
        </div>
    );
};

// Step 2: Pickup Address
const Step2PickupAddress: React.FC<{
    formData: ShopFormData;
    updateFormData: (updates: Partial<ShopFormData>) => void;
    errors: Record<string, string>;
}> = ({ formData, updateFormData, errors }) => {
    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Địa chỉ lấy hàng</h2>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                    <div>
                        <h3 className="font-medium text-green-800 mb-1">Địa chỉ lấy hàng</h3>
                        <p className="text-sm text-green-700">
                            Vui lòng cung cấp địa chỉ chính xác để đảm bảo quá trình lấy hàng diễn ra thuận lợi.
                        </p>
                    </div>
                </div>
            </div>

            <FormInput
                label="Địa chỉ"
                name="address"
                value={formData.address}
                onChange={(value) => updateFormData({ address: value })}
                placeholder="Số nhà, tên đường"
                required
                error={errors.address}
                icon={<MapPin className="w-5 h-5" />}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="text-red-500 mr-1">*</span>
                        Tỉnh/Thành phố
                    </label>
                    <select
                        value={formData.city}
                        onChange={(e) => updateFormData({ city: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 bg-gray-50 ${
                            errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Chọn tỉnh/thành phố</option>
                        <option value="Ho Chi Minh">TP. Hồ Chí Minh</option>
                        <option value="Ha Noi">Hà Nội</option>
                        <option value="Da Nang">Đà Nẵng</option>
                        <option value="Can Tho">Cần Thơ</option>
                        <option value="Binh Duong">Bình Dương</option>
                        <option value="Dong Nai">Đồng Nai</option>
                    </select>
                    {errors.city && <p className="mt-2 text-sm text-red-500">{errors.city}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="text-red-500 mr-1">*</span>
                        Quận/Huyện
                    </label>
                    <select
                        value={formData.district}
                        onChange={(e) => updateFormData({ district: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 bg-gray-50 ${
                            errors.district ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Chọn quận/huyện</option>
                        <option value="District 1">Quận 1</option>
                        <option value="District 2">Quận 2</option>
                        <option value="District 3">Quận 3</option>
                        <option value="Thu Duc">Thủ Đức</option>
                        <option value="Binh Thanh">Bình Thạnh</option>
                    </select>
                    {errors.district && <p className="mt-2 text-sm text-red-500">{errors.district}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="text-red-500 mr-1">*</span>
                        Phường/Xã
                    </label>
                    <select
                        value={formData.ward}
                        onChange={(e) => updateFormData({ ward: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 bg-gray-50 ${
                            errors.ward ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Chọn phường/xã</option>
                        <option value="Ward 1">Phường 1</option>
                        <option value="Ward 2">Phường 2</option>
                        <option value="Ward 3">Phường 3</option>
                        <option value="Ben Nghe">Phường Bến Nghé</option>
                        <option value="Da Kao">Phường Đa Kao</option>
                    </select>
                    {errors.ward && <p className="mt-2 text-sm text-red-500">{errors.ward}</p>}
                </div>
            </div>
        </div>
    );
};

// Step 3: Tax Information
const Step3TaxInfo: React.FC<{
    formData: ShopFormData;
    updateFormData: (updates: Partial<ShopFormData>) => void;
    errors: Record<string, string>;
}> = ({ formData, updateFormData, errors }) => {
    const validateIdNumber = (value: string) => {
        const cleanValue = value.replace(/\s/g, '');
        if (!/^\d{9,12}$/.test(cleanValue)) {
            return 'Số CMND/CCCD phải có 9-12 chữ số';
        }
        return '';
    };

    const handleIdNumberChange = (value: string) => {
        updateFormData({ idNumber: value });
        const error = validateIdNumber(value);
        setErrors(prev => ({ ...prev, idNumber: error }));
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin thuế</h2>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                    <FileText className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                    <div>
                        <h3 className="font-medium text-green-800 mb-1">Thông tin thuế</h3>
                        <p className="text-sm text-green-700">
                            Vui lòng cung cấp thông tin chính xác để tuân thủ quy định pháp luật Việt Nam.
                            Đảm bảo ảnh CMND/CCCD rõ nét và không bị che khuất.
                        </p>
                    </div>
                </div>
            </div>

            <FormInput
                label="Số CMND/CCCD"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleIdNumberChange}
                placeholder="Nhập số CMND/CCCD (9-12 chữ số)"
                required
                error={errors.idNumber}
                icon={<User className="w-5 h-5" />}
                maxLength={12}
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

// Step 4: Bank Information
const Step4BankInfo: React.FC<{
    formData: ShopFormData;
    updateFormData: (updates: Partial<ShopFormData>) => void;
    errors: Record<string, string>;
}> = ({ formData, updateFormData, errors }) => {
    const banks = [
        'Vietcombank', 'VietinBank', 'BIDV', 'Agribank', 'ACB',
        'Techcombank', 'MB Bank', 'VPBank', 'TPBank', 'Sacombank',
        'HDBank', 'VIB', 'SHB', 'OCB', 'LienVietPostBank'
    ];

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin định danh</h2>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                    <CreditCard className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                    <div>
                        <h3 className="font-medium text-green-800 mb-1">Thông tin thanh toán</h3>
                        <p className="text-sm text-green-700">
                            Vui lòng cung cấp thông tin tài khoản ngân hàng chính xác để nhận thanh toán từ đơn hàng.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="text-red-500 mr-1">*</span>
                        Ngân hàng
                    </label>
                    <select
                        value={formData.bankName}
                        onChange={(e) => updateFormData({ bankName: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 bg-gray-50 ${
                            errors.bankName ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Chọn ngân hàng</option>
                        {banks.map((bank) => (
                            <option key={bank} value={bank}>
                                {bank}
                            </option>
                        ))}
                    </select>
                    {errors.bankName && <p className="mt-2 text-sm text-red-500">{errors.bankName}</p>}
                </div>

                <FormInput
                    label="Số tài khoản"
                    name="bankAccount"
                    value={formData.bankAccount}
                    onChange={(value) => updateFormData({ bankAccount: value })}
                    placeholder="Nhập số tài khoản"
                    required
                    error={errors.bankAccount}
                    icon={<CreditCard className="w-5 h-5" />}
                />
            </div>

            <FormInput
                label="Tên chủ tài khoản"
                name="accountHolder"
                value={formData.accountHolder}
                onChange={(value) => updateFormData({ accountHolder: value })}
                placeholder="Nhập tên chủ tài khoản"
                required
                error={errors.accountHolder}
                icon={<User className="w-5 h-5" />}
            />
        </div>
    );
};

// Step 5: Review & Complete
const Step5Complete: React.FC<{
    formData: ShopFormData;
    onSubmit: () => void;
    isSubmitting: boolean;
}> = ({ formData, onSubmit, isSubmitting }) => {
    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Xác nhận thông tin</h2>

            <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">Thông tin đã điền:</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tên Shop:</span>
                            <span className="font-medium">{formData.shopName || '-'}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{formData.email || '-'}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600">Số điện thoại:</span>
                            <span className="font-medium">{formData.phone || '-'}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Địa chỉ:</span>
                            <span className="font-medium">{`${formData.address || ''}, ${formData.ward || ''}, ${formData.district || ''}, ${formData.city || ''}`.trim() || '-'}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600">Số CMND/CCCD:</span>
                            <span className="font-medium">{formData.idNumber || '-'}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600">Ngân hàng:</span>
                            <span className="font-medium">{formData.bankName ? `${formData.bankName} - ${formData.bankAccount}` : '-'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-green-800 mb-2">Lưu ý quan trọng:</h4>
                <ul className="text-sm text-green-700 space-y-2 list-disc list-inside">
                    <li>Thông tin bạn cung cấp sẽ được xem xét trong vòng 1-2 ngày làm việc</li>
                    <li>Bạn sẽ nhận được email thông báo kết quả phê duyệt</li>
                    <li>Sau khi được duyệt, bạn có thể bắt đầu bán hàng ngay trên QuadraMall</li>
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
                        Hoàn tất đăng ký
                    </>
                )}
            </button>
        </div>
    );
};

// Main Registration Component
const ShopRegistration: React.FC = () => {
    const [showWelcome, setShowWelcome] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [formData, setFormData] = useState<ShopFormData>({
        shopName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        district: '',
        ward: '',
        description: '',
        idNumber: '',
        idFrontImage: null,
        idBackImage: null,
        businessLicense: null,
        bankAccount: '',
        bankName: '',
        accountHolder: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateFormData = (updates: Partial<ShopFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
        const updatedFields = Object.keys(updates);
        setErrors(prev => {
            const newErrors = { ...prev };
            updatedFields.forEach(field => delete newErrors[field]);
            return newErrors;
        });
    };

    const sendOtp = async (): Promise<boolean> => {
        try {
            // Simulate API call to send OTP
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsOtpSent(true);
            return true;
        } catch (error) {
            console.error('Failed to send OTP:', error);
            return false;
        }
    };

    const verifyOtp = async (otp: string): Promise<boolean> => {
        try {
            // Simulate API call to verify OTP
            await new Promise(resolve => setTimeout(resolve, 1000));
            // For demo purposes, accept "123456" as valid OTP
            if (otp === '123456') {
                setIsOtpVerified(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to verify OTP:', error);
            return false;
        }
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        switch (step) {
            case 1:
                if (!formData.shopName.trim()) newErrors.shopName = 'Tên shop là bắt buộc';
                if (!formData.email.trim()) newErrors.email = 'Email là bắt buộc';
                else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
                if (!formData.phone.trim()) newErrors.phone = 'Số điện thoại là bắt buộc';
                else if (!/^\d{10,11}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'Số điện thoại phải có 10-11 chữ số';
                if (!isOtpVerified) newErrors.phone = 'Vui lòng xác thực số điện thoại bằng OTP';
                break;

            case 2:
                if (!formData.address.trim()) newErrors.address = 'Địa chỉ là bắt buộc';
                if (!formData.city) newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
                if (!formData.district) newErrors.district = 'Vui lòng chọn quận/huyện';
                if (!formData.ward) newErrors.ward = 'Vui lòng chọn phường/xã';
                break;

            case 3:
                if (!formData.idNumber.trim()) newErrors.idNumber = 'Số CMND/CCCD là bắt buộc';
                else if (!/^\d{9,12}$/.test(formData.idNumber)) newErrors.idNumber = 'Số CMND/CCCD phải có 9-12 chữ số';
                if (!formData.idFrontImage) newErrors.idFrontImage = 'Ảnh mặt trước CMND/CCCD là bắt buộc';
                else if (formData.idFrontImage.size > 5 * 1024 * 1024) newErrors.idFrontImage = 'Ảnh mặt trước vượt quá 5MB';
                if (!formData.idBackImage) newErrors.idBackImage = 'Ảnh mặt sau CMND/CCCD là bắt buộc';
                else if (formData.idBackImage.size > 5 * 1024 * 1024) newErrors.idBackImage = 'Ảnh mặt sau vượt quá 5MB';
                if (formData.businessLicense && formData.businessLicense.size > 5 * 1024 * 1024) {
                    newErrors.businessLicense = 'Giấy phép kinh doanh vượt quá 5MB';
                }
                break;

            case 4:
                if (!formData.bankName) newErrors.bankName = 'Vui lòng chọn ngân hàng';
                if (!formData.bankAccount.trim()) newErrors.bankAccount = 'Số tài khoản là bắt buộc';
                else if (!/^\d{6,20}$/.test(formData.bankAccount)) newErrors.bankAccount = 'Số tài khoản phải có 6-20 chữ số';
                if (!formData.accountHolder.trim()) newErrors.accountHolder = 'Tên chủ tài khoản là bắt buộc';
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 5));
        }
    };

    const handlePrev = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(4)) return;

        setIsSubmitting(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('Submitting form data:', formData);
            setShowSuccess(true);
        } catch (error) {
            console.error('Registration failed:', error);
            alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (showWelcome) {
        return <WelcomeScreen onStart={() => setShowWelcome(false)} />;
    }

    if (showSuccess) {
        return <SuccessScreen />;
    }

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1ShopInfo
                        formData={formData}
                        updateFormData={updateFormData}
                        errors={errors}
                        sendOtp={sendOtp}
                        verifyOtp={verifyOtp}
                        isOtpSent={isOtpSent}
                        isOtpVerified={isOtpVerified}
                    />
                );
            case 2:
                return (
                    <Step2PickupAddress
                        formData={formData}
                        updateFormData={updateFormData}
                        errors={errors}
                    />
                );
            case 3:
                return (
                    <Step3TaxInfo
                        formData={formData}
                        updateFormData={updateFormData}
                        errors={errors}
                    />
                );
            case 4:
                return (
                    <Step4BankInfo
                        formData={formData}
                        updateFormData={updateFormData}
                        errors={errors}
                    />
                );
            case 5:
                return (
                    <Step5Complete
                        formData={formData}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <StepIndicator currentStep={currentStep} totalSteps={5} />

            <div className="py-8">
                {renderCurrentStep()}
            </div>

            {currentStep < 5 && (
                <div className="sticky bottom-0 bg-white border-t shadow-lg">
                    <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between">
                        <button
                            onClick={handlePrev}
                            disabled={currentStep === 1}
                            className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Quay lại
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={currentStep === 1 && !isOtpVerified}
                            className={`flex items-center gap-2 px-8 py-3 text-white font-semibold rounded-lg transition-colors duration-200 ${
                                currentStep === 1 && !isOtpVerified ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            Tiếp theo
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopRegistration;