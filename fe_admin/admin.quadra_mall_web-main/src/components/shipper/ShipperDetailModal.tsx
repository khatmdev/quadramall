import React from 'react';
import { X, User, Mail, Phone, CreditCard, Car, Calendar, Download, Eye } from 'lucide-react';
import { ShipperRegistration } from '@/store/Shipper/shipperSlice';

interface ShipperRegistrationModalProps {
  show: boolean;
  registration: ShipperRegistration | null;
  onClose: () => void;
}

const ShipperRegistrationModal: React.FC<ShipperRegistrationModalProps> = ({
  show,
  registration,
  onClose,
}) => {
  if (!show || !registration) return null;

  const getVehicleTypeText = (type: string) => {
    switch (type) {
      case 'MOTORBIKE': return 'Xe máy';
      case 'CAR': return 'Ô tô';
      case 'BICYCLE': return 'Xe đạp';
      default: return type;
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'MOTORBIKE': return '🏍️';
      case 'CAR': return '🚗';
      case 'BICYCLE': return '🚴';
      default: return '🚛';
    }
  };

  const handleImageView = (url: string, title: string) => {
    window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
  };

  const handleImageDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const DocumentCard: React.FC<{ 
    title: string; 
    url: string; 
    icon: React.ReactNode;
    filename: string;
  }> = ({ title, url, icon, filename }) => (
    <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-gray-700">{title}</span>
        </div>
      </div>
      
      <div className="aspect-video bg-white rounded-lg overflow-hidden mb-3 border border-gray-200">
        <img 
          src={url} 
          alt={title}
          className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => handleImageView(url, title)}
        />
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => handleImageView(url, title)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
        >
          <Eye size={14} />
          Xem
        </button>
        <button
          onClick={() => handleImageDownload(url, filename)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm"
        >
          <Download size={14} />
          Tải
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
              {registration.userFullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Chi tiết đăng ký Shipper</h2>
              <p className="text-gray-600">ID: #{registration.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Thông tin cá nhân
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Họ và tên</p>
                      <p className="font-semibold text-gray-900">{registration.userFullName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{registration.userEmail}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Số CMND/CCCD</p>
                      <p className="font-semibold text-gray-900">{registration.idCardNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ngày đăng ký</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(registration.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Car className="h-5 w-5 text-green-600" />
                  Thông tin phương tiện
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getVehicleIcon(registration.vehicleType)}</div>
                    <div>
                      <p className="text-sm text-gray-600">Loại phương tiện</p>
                      <p className="font-semibold text-gray-900">{getVehicleTypeText(registration.vehicleType)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Car className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Biển số xe</p>
                      <p className="font-semibold text-gray-900 text-lg tracking-wider bg-white px-3 py-1 rounded-md border border-gray-200">
                        {registration.licensePlate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái</h3>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                    Chờ duyệt
                  </span>
                </div>
                {registration.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Lý do từ chối:</strong> {registration.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                  Hồ sơ giấy tờ
                </h3>
                
                <div className="space-y-4">
                  <DocumentCard
                    title="CMND/CCCD mặt trước"
                    url={registration.idCardFrontUrl}
                    icon={<CreditCard className="h-4 w-4 text-blue-600" />}
                    filename={`CMND_Front_${registration.idCardNumber}.jpg`}
                  />
                  
                  <DocumentCard
                    title="CMND/CCCD mặt sau"
                    url={registration.idCardBackUrl}
                    icon={<CreditCard className="h-4 w-4 text-green-600" />}
                    filename={`CMND_Back_${registration.idCardNumber}.jpg`}
                  />
                  
                  <DocumentCard
                    title="Bằng lái xe"
                    url={registration.driverLicenseUrl}
                    icon={<Car className="h-4 w-4 text-purple-600" />}
                    filename={`License_${registration.idCardNumber}.jpg`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipperRegistrationModal;