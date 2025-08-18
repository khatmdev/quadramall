import React, { useEffect } from 'react';
import { Clock, CheckCircle, XCircle, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getRegistrationStatus } from '@/store/Shipper/shipperSlice';
import { logout, refreshMe } from '@/store/Auth/authSlice'; // ✅ Import refreshMe
import { AppDispatch, RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { RegistrationStatus as RegistrationStatusEnum } from '@/types/Shipper/shipper';
import { hasRole } from '@/utils/roleHelper';

export const RegistrationStatus: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { registrationStatus, loading: shipperLoading } = useSelector((state: RootState) => state.shipper);
  const { user, isAuthenticated, loading: authLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Kiểm tra đăng nhập
    if (!isAuthenticated || !user) {
      navigate('/login', { state: { from: '/shipper/registration-status' } });
      return;
    }

    // Lấy trạng thái đăng ký
    dispatch(getRegistrationStatus());
  }, [dispatch, isAuthenticated, user, navigate]);

  // ✅ Hàm refresh để cập nhật thông tin user và trạng thái đăng ký
  const handleRefresh = async () => {
    try {
      await dispatch(logout()); // Cập nhật thông tin user
      // Cập nhật thông tin user từ backend (bao gồm roles mới)
      await dispatch(refreshMe()).unwrap();
      // Cập nhật trạng thái đăng ký
      await dispatch(getRegistrationStatus()).unwrap();
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  const loading = shipperLoading || authLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="text-gray-600">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!registrationStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <XCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Chưa có đăng ký</h1>
          <p className="text-gray-600 mb-6">Bạn chưa đăng ký làm shipper</p>
          <Link
            to="/shipper/register"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: RegistrationStatusEnum) => {
    switch (status) {
      case RegistrationStatusEnum.PENDING:
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Đang chờ xem xét',
          description: 'Hồ sơ của bạn đang được đội ngũ xem xét. Chúng tôi sẽ phản hồi trong vòng 24-48 giờ.'
        };
      case RegistrationStatusEnum.APPROVED:
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Đã được duyệt',
          description: 'Chúc mừng! Hồ sơ của bạn đã được duyệt. Bạn có thể bắt đầu nhận đơn hàng ngay bây giờ.'
        };
      case RegistrationStatusEnum.REJECTED:
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Bị từ chối',
          description: 'Rất tiếc, hồ sơ của bạn chưa đáp ứng yêu cầu. Vui lòng xem lý do và đăng ký lại.'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Không xác định',
          description: 'Trạng thái không xác định'
        };
    }
  };

  const config = getStatusConfig(registrationStatus.status);
  const IconComponent = config.icon;

  // ✅ Kiểm tra nếu user có role SHIPPER (đã được duyệt và có quyền)
  const isApprovedShipper = hasRole(user, 'SHIPPER');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Về trang chủ
          </Link>
          
          {/* ✅ Nút refresh */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8 text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${config.bgColor} ${config.borderColor} border-2 mb-6`}>
              <IconComponent className={`h-10 w-10 ${config.color}`} />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {config.title}
            </h1>

            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {config.description}
            </p>

            {registrationStatus.status === RegistrationStatusEnum.REJECTED && registrationStatus.rejectionReason && (
              <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 mb-6`}>
                <h3 className="font-medium text-gray-900 mb-2">Lý do từ chối:</h3>
                <p className="text-gray-700">{registrationStatus.rejectionReason}</p>
              </div>
            )}

            <div className="text-sm text-gray-500 mb-8">
              Đăng ký lúc: {new Date(registrationStatus.registrationCreatedAt).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>

            <div className="space-y-4">
              {/* ✅ Nếu đã được duyệt và có role SHIPPER */}
              {registrationStatus.status === RegistrationStatusEnum.APPROVED && isApprovedShipper && (
                <div className="space-y-3">
                  <Link
                    to="/shipper/my-orders"
                    className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Quản lý đơn hàng
                  </Link>
                  <br />
                  <Link
                    to="/shipper/available-orders"
                    className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Nhận đơn hàng mới
                  </Link>
                </div>
              )}

              {/* ✅ Nếu đã được duyệt nhưng chưa có role SHIPPER */}
              {registrationStatus.status === RegistrationStatusEnum.APPROVED && !isApprovedShipper && (
                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-orange-800 text-sm mb-2">
                      Hồ sơ đã được duyệt nhưng quyền truy cập chưa được cập nhật.
                    </p>
                    <p className="text-orange-700 text-xs">
                      Hãy thử làm mới thông tin bằng nút "Làm mới" ở trên hoặc đăng nhập lại.
                    </p>
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Cập nhật quyền truy cập</span>
                  </button>
                </div>
              )}

              {/* Nếu bị từ chối */}
              {registrationStatus.status === RegistrationStatusEnum.REJECTED && (
                <Link
                  to="/shipper/register"
                  className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Đăng ký lại
                </Link>
              )}

              {/* Nếu đang chờ duyệt */}
              {registrationStatus.status === RegistrationStatusEnum.PENDING && (
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="inline-flex items-center space-x-2 bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                  <span>Kiểm tra lại</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};