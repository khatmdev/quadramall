import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useNavigate } from 'react-router-dom';
import { hasRole } from '@/utils/roleHelper';
import Swal from 'sweetalert2';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
  redirectMessage?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/login',
  redirectMessage
}) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user ||!isAuthenticated) {
      Swal.fire({
        icon: 'warning',
        title: 'Yêu cầu đăng nhập',
        text: 'Bạn cần đăng nhập để truy cập trang này',
        confirmButtonText: 'Đăng nhập',
        confirmButtonColor: '#3b82f6'
      }).then(() => {
        navigate('/login');
      });
      return;
    }

    if (requiredRole && !hasRole(user, requiredRole)) {
      const message = redirectMessage || `Bạn không có quyền truy cập. Cần quyền ${requiredRole}`;
      
      Swal.fire({
        icon: 'error',
        title: 'Không có quyền truy cập',
        text: message,
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      }).then(() => {
        navigate(redirectTo);
      });
      return;
    }
  }, [isAuthenticated, user, requiredRole, navigate, redirectTo, redirectMessage]);

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && !hasRole(user, requiredRole)) {
    return null;
  }

  return <>{children}</>;
};