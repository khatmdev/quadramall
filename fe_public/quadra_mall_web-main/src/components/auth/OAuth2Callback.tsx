import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { oauth2Login } from '@/store/Auth/authSlice';
import type { AppDispatch, RootState } from '@/store';

const OAuth2Callback: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, error, loading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const errorMessage = params.get('message');

    if (token) {
      dispatch(oauth2Login(token));
    } else if (errorMessage) {
      navigate('/login', { state: { error: decodeURIComponent(errorMessage) } });
    } else {
      navigate('/login', { state: { error: 'Đăng nhập Google thất bại' } });
    }
  }, [dispatch, location, navigate]);

  useEffect(() => {
    if (user) {
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, location.state]);

  if (loading) {
    return <div>Đang xử lý đăng nhập...</div>;
  }

  if (error) {
    return <div>Lỗi: {error}</div>;
  }

  return <div>Đang xử lý...</div>;
};

export default OAuth2Callback;