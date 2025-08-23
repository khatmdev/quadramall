import { useState, useEffect } from 'react';
import { LockClosedIcon, EnvelopeIcon, ComputerDesktopIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser, verifyToken, logout } from '@/store/Auth/authSlice';
import type { AppDispatch, RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { LoginRequest } from '@/types/Auth/base/Request/loginRequest';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const { user, error: authError, loading, isAuthenticated, storeIds, storeId } = useSelector(
        (state: RootState) => state.auth
    );
    const navigate = useNavigate();
    const location = useLocation();

    // Hàm kiểm tra và chuyển hướng dựa trên store
    const checkUserStore = () => {
        if (!storeIds || storeIds.length === 0) {
            // Nếu chưa có store, chuyển hướng đến trang đăng ký store
            navigate('/registration', { state: { from: location.pathname } });
        } else if (!storeId || !storeIds.includes(Number(storeId))) {
            // Nếu có store nhưng chưa chọn, chuyển hướng đến trang chọn store
            navigate('/select-store', { state: { from: location.pathname } });
        } else {
            // Nếu đã có store và đã chọn, chuyển hướng đến dashboard
            navigate('/', { replace: true });
        }
    };

    // Xử lý auth sync từ public site
    useEffect(() => {
        const handleAuthSync = async () => {
            // Kiểm tra signals từ public site (backup nếu App.tsx không catch được)
            const needRefresh = localStorage.getItem('sellerRefreshNeeded');
            const publicToken = localStorage.getItem('publicSiteToken');

            // Kiểm tra URL params
            const urlParams = new URLSearchParams(location.search);
            const urlToken = urlParams.get('token');
            const urlRefreshKey = urlParams.get('refresh');

            if (needRefresh === 'true' || urlRefreshKey) {
                console.log('🔄 Login page: Processing auth sync from public site...');

                // Clear signals
                localStorage.removeItem('sellerRefreshNeeded');
                localStorage.removeItem('sellerRefreshKey');
                localStorage.removeItem('publicSiteToken');

                // Clear old auth data
                dispatch(logout());

                const tokenToVerify = urlToken || publicToken;

                if (tokenToVerify && tokenToVerify !== 'null' && tokenToVerify !== '') {
                    setIsLoading(true);
                    setMessage('Đang đồng bộ thông tin đăng nhập từ trang chính...');

                    try {
                        await dispatch(verifyToken(tokenToVerify)).unwrap();
                        console.log('✅ Login page: Token verified successfully');

                        // Clean URL
                        if (urlRefreshKey || urlToken) {
                            navigate('/login', { replace: true });
                        }

                        setMessage('Đăng nhập thành công!');

                    } catch (error: any) {
                        console.error('❌ Login page: Token verification failed:', error);
                        setError('Không thể đồng bộ thông tin đăng nhập. Vui lòng đăng nhập thủ công.');
                        setMessage('');
                    } finally {
                        setIsLoading(false);
                    }
                } else {
                    setMessage('Vui lòng đăng nhập để tiếp tục.');
                }
            }
        };

        handleAuthSync();
    }, [dispatch, location.search, navigate]);

    // Xử lý token từ query parameter (OAuth callback)
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        const refresh = queryParams.get('refresh');

        // Chỉ xử lý OAuth token nếu không phải từ public site redirect
        if (token && !refresh && !isAuthenticated) {
            setIsLoading(true);
            dispatch(verifyToken(token))
                .unwrap()
                .then(() => {
                    checkUserStore();
                })
                .catch((err: string) => {
                    setError(err || 'Xác thực token thất bại. Vui lòng đăng nhập lại.');
                    navigate('/login', { state: { error: err || 'Xác thực token thất bại' } });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [dispatch, navigate, location.search, isAuthenticated]);

    // Chuyển hướng nếu đã đăng nhập
    useEffect(() => {
        if (isAuthenticated && user) {
            checkUserStore();
        }
    }, [isAuthenticated, user, storeIds, storeId, navigate]);

    // Xử lý thông báo từ location.state
    useEffect(() => {
        const state = location.state as { message?: string; error?: string } | undefined;
        if (state?.message) {
            setMessage(state.message);
        }
        if (state?.error) {
            setError(state.error);
        }
    }, [location.state]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload: LoginRequest = { email, password };
            await dispatch(loginUser(payload)).unwrap();
            setError('');
            setMessage('');
        } catch (err: unknown) {
            let errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra email hoặc mật khẩu.';
            if (err instanceof Error) {
                errorMessage = err.message || errorMessage;
            } else if (typeof err === 'string') {
                errorMessage = err;
            } else if (authError) {
                errorMessage = authError;
            }
            console.log(err);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href =`${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`;
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-white px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col justify-between h-full">
                {isLoading ? (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p>{message || 'Đang xác thực...'}</p>
                    </div>
                ) : (
                    <>
                        <div>
                            <div className="flex flex-col items-center mb-6">
                                <ComputerDesktopIcon className="h-10 w-10 text-green-600 animate-bounce mb-1" />
                                <h1 className="text-3xl font-bold text-green-700">QuadraMall Seller</h1>
                            </div>
                            {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}
                            {message && <p className="text-green-500 mb-4 text-sm text-center">{message}</p>}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative">
                                    <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute top-3 left-3" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Địa chỉ email"
                                        className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    />
                                </div>
                                <div className="relative">
                                    <LockClosedIcon className="w-5 h-5 text-gray-400 absolute top-3 left-3" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Mật khẩu"
                                        className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleShowPassword}
                                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                <div className="relative text-right">
                                    <Link to="/forgot-password" className="text-sm text-green-600 hover:underline">
                                        Quên mật khẩu?
                                    </Link>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading || loading}
                                    className={`w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold ${
                                        isLoading || loading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isLoading || loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                </button>
                            </form>
                            <p className="mt-6 text-sm text-center text-gray-500">
                                Bạn chưa có tài khoản?{' '}
                                <Link to="/register" className="text-green-600 hover:underline">
                                    Đăng ký ngay
                                </Link>
                            </p>
                        </div>
                        <div className="mt-10 space-y-3">
                            <div className="flex items-center text-gray-400 text-sm">
                                <hr className="flex-grow border-gray-300" />
                                <span className="px-3">hoặc đăng nhập bằng</span>
                                <hr className="flex-grow border-gray-300" />
                            </div>
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg py-2 px-4 shadow hover:shadow-md transition"
                            >
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                                <span className="text-sm text-gray-700">Google</span>
                            </button>
                            <button
                                onClick={handleBackToHome}
                                className="w-full mt-4 text-sm text-gray-600 hover:text-green-600 underline transition text-center"
                            >
                                ← Quay lại trang chủ
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Login;