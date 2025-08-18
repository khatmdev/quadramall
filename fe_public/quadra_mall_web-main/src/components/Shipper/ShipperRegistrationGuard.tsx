import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useNavigate } from 'react-router-dom';
import { hasRole } from '@/utils/roleHelper';
import Swal from 'sweetalert2';
import { getRegistrationStatus } from '@/store/Shipper/shipperSlice';
import { Loader2 } from 'lucide-react';

interface ShipperRegistrationGuardProps {
  children: React.ReactNode;
}

export const ShipperRegistrationGuard: React.FC<ShipperRegistrationGuardProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { registrationStatus, loading } = useSelector((state: RootState) => state.shipper);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra đăng nhập
    if (!isAuthenticated || !user) {
      navigate('/login', { state: { from: '/shipper-register' } });
      return;
    }

    // Kiểm tra nếu user đã có role SHIPPER (đã được duyệt)
    if (hasRole(user, 'SHIPPER')) {
      Swal.fire({
        icon: 'info',
        title: 'Bạn đã là Shipper!',
        text: 'Bạn đã trở thành Shipper rồi. Chuyển đến trang quản lý đơn hàng.',
        confirmButtonText: 'Đến trang quản lý',
        confirmButtonColor: '#3b82f6'
      }).then(() => {
        navigate('/shipper/my-orders');
      });
      return;
    }

    // Lấy trạng thái đăng ký để kiểm tra
    dispatch(getRegistrationStatus());
  }, [isAuthenticated, user, navigate, dispatch]);

  useEffect(() => {
    // Kiểm tra trạng thái đăng ký sau khi có dữ liệu
    if (registrationStatus && !loading) {
      if (registrationStatus.status === 'PENDING') {
        Swal.fire({
          icon: 'info',
          title: 'Đã có đăng ký!',
          text: 'Bạn đã đăng ký làm shipper rồi. Xem trạng thái hiện tại.',
          confirmButtonText: 'Xem trạng thái',
          confirmButtonColor: '#3b82f6'
        }).then(() => {
          navigate('/shipper-registration-status');
        });
        return;
      }

      if (registrationStatus.status === 'APPROVED') {
        Swal.fire({
          icon: 'success',
          title: 'Đã được duyệt!',
          text: 'Hồ sơ của bạn đã được duyệt. Chuyển đến bảng điều khiển.',
          confirmButtonText: 'Đến bảng điều khiển',
          confirmButtonColor: '#3b82f6'
        }).then(() => {
          navigate('/shipper-registration-status');
        });
        return;
      }

      if (registrationStatus.status === 'REJECTED') {
        // Cho phép đăng ký lại nếu bị từ chối
        return;
      }
    }
  }, [registrationStatus, loading, navigate]);

  // Hiển thị loading khi đang kiểm tra
  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="text-gray-600">Đang kiểm tra...</span>
        </div>
      </div>
    );
  }

  // Không render nếu user đã có SHIPPER role hoặc đã có đăng ký PENDING/APPROVED
  if (hasRole(user, 'SHIPPER') || 
      (registrationStatus && 
       (registrationStatus.status === 'PENDING' || registrationStatus.status === 'APPROVED'))) {
    return null;
  }

  return <>{children}</>;
};