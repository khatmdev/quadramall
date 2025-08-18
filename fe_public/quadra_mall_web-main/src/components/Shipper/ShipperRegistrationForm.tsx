import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Truck, User, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { VehicleType, VEHICLE_TYPE_LABELS } from '@/types/Shipper/shipper';
import { useShipperRegistration } from '@/hooks/useShipperRegistration';
import { AppDispatch, RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { ImageUpload } from '../Upload/ImageUpload';
import Swal from 'sweetalert2';
import { ShipperRegistrationGuard } from './ShipperRegistrationGuard';

// ✅ Updated schema - Remove workingAreas
const registrationSchema = z.object({
  vehicleType: z.nativeEnum(VehicleType),
  licensePlate: z.string().optional().or(z.literal('')),
  idCardNumber: z
    .string()
    .min(1, 'Số CMND/CCCD là bắt buộc')
    .regex(/^\d{9,12}$/, 'Số CMND/CCCD không hợp lệ'),
  idCardFrontUrl: z.string().min(1, 'Ảnh mặt trước CMND/CCCD là bắt buộc'),
  idCardBackUrl: z.string().min(1, 'Ảnh mặt sau CMND/CCCD là bắt buộc'),
  driverLicenseUrl: z.string().optional(),
  vehicleRegistrationUrl: z.string().optional(),
});

type FormData = z.infer<typeof registrationSchema>;

export const ShipperRegistrationForm: React.FC = () => {
  const { 
    loading, 
    error, 
    registerShipper, 
    uploadImage: handleUploadImage, 
    clearError 
  } = useShipperRegistration();

  const { user } = useSelector((state: RootState) => state.auth);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<FormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      vehicleType: VehicleType.MOTORBIKE,
      licensePlate: '',
      idCardNumber: '',
      idCardFrontUrl: '',
      idCardBackUrl: '',
      driverLicenseUrl: '',
      vehicleRegistrationUrl: ''
    },
    mode: 'onChange'
  });

  const vehicleType = watch('vehicleType');

  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data: FormData) => {
    try {
      await registerShipper(data);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const showUserInfo = user && (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-100 p-2 rounded-full">
          <User className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-blue-900">
            Đăng ký với tài khoản: {user.fullName}
          </p>
          <p className="text-sm text-blue-700">{user.email}</p>
        </div>
      </div>
    </div>
  );

  return (
    <ShipperRegistrationGuard>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
              <div className="flex items-center space-x-3">
                <div className="bg-white p-2 rounded-lg">
                  <Truck className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Đăng ký trở thành Shipper
                  </h1>
                  <p className="text-blue-100 mt-1">
                    Tham gia cộng đồng giao hàng và kiếm thêm thu nhập
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
              {showUserInfo}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Vehicle Information */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                  <Truck className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Thông tin phương tiện
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại phương tiện <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="vehicleType"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.vehicleType && (
                      <p className="mt-1 text-sm text-red-600">{errors.vehicleType.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biển số xe
                      {vehicleType !== VehicleType.BICYCLE && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <Controller
                      name="licensePlate"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          value={field.value || ''}
                          type="text"
                          placeholder="VD: 59H1-12345"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.licensePlate && (
                      <p className="mt-1 text-sm text-red-600">{errors.licensePlate.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                  <User className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Thông tin cá nhân
                  </h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số CMND/CCCD <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="idCardNumber"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        value={field.value || ''}
                        type="text"
                        placeholder="Nhập số CMND/CCCD"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  />
                  {errors.idCardNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.idCardNumber.message}</p>
                  )}
                </div>
              </div>

              {/* Document Upload */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Tài liệu cần thiết
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Controller
                    name="idCardFrontUrl"
                    control={control}
                    render={({ field }) => (
                      <ImageUpload
                        label="Ảnh mặt trước CMND/CCCD"
                        value={field.value || ''}
                        onChange={field.onChange}
                        onUpload={handleUploadImage}
                        required
                      />
                    )}
                  />

                  <Controller
                    name="idCardBackUrl"
                    control={control}
                    render={({ field }) => (
                      <ImageUpload
                        label="Ảnh mặt sau CMND/CCCD"
                        value={field.value || ''}
                        onChange={field.onChange}
                        onUpload={handleUploadImage}
                        required
                      />
                    )}
                  />

                  {vehicleType !== VehicleType.BICYCLE && (
                    <>
                      <Controller
                        name="driverLicenseUrl"
                        control={control}
                        render={({ field }) => (
                          <ImageUpload
                            label="Giấy phép lái xe"
                            value={field.value || ''}
                            onChange={field.onChange}
                            onUpload={handleUploadImage}
                          />
                        )}
                      />

                      <Controller
                        name="vehicleRegistrationUrl"
                        control={control}
                        render={({ field }) => (
                          <ImageUpload
                            label="Đăng ký xe"
                            value={field.value || ''}
                            onChange={field.onChange}
                            onUpload={handleUploadImage}
                          />
                        )}
                      />
                    </>
                  )}
                </div>

                {errors.idCardFrontUrl && (
                  <p className="text-sm text-red-600">{errors.idCardFrontUrl.message}</p>
                )}
                {errors.idCardBackUrl && (
                  <p className="text-sm text-red-600">{errors.idCardBackUrl.message}</p>
                )}
              </div>

              {/* Terms and Submit */}
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Hồ sơ sẽ được xem xét trong vòng 24-48 giờ</li>
                        <li>Bạn cần cung cấp thông tin chính xác và ảnh rõ nét</li>
                        <li>Sau khi được duyệt, bạn có thể bắt đầu nhận đơn hàng</li>
                        <li>Bạn có thể làm việc ở bất kỳ khu vực nào</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isValid}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="animate-spin h-5 w-5" />
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    'Gửi đăng ký'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ShipperRegistrationGuard>
  );
};