import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { RootState } from '@/store';
import { useCallback } from 'react';

const useRequireAuth = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * @param message Thông điệp hiển thị trên trang login (tuỳ chọn)
   * @returns true nếu đã login, false nếu chưa (và đã redirect)
   */
  const requireAuth = useCallback((message?: string): boolean => {
    if (!user) {
      navigate('/login', {
        state: {
          from: location,
          message: message || 'Vui lòng đăng nhập để tiếp tục.',
        },
        replace: true,
      });
      return false;
    }
    return true;
  }, [user, navigate, location]);

  return { user, requireAuth };
};

export default useRequireAuth;
