import React, { useState, FormEvent, useEffect } from 'react';
import { initiateRegister, verifyRegister, resetAuthState, resendOtp } from '@/store/Auth/registerSlice';
import { RootState, useAppDispatch } from '@/store';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaEnvelope, FaUser, FaLock, FaArrowLeft, FaEye, FaEyeSlash, FaHome } from 'react-icons/fa';

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { registerStatus, verifyStatus, error, registerData } = useSelector((state: RootState) => state.register);

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [resendCooldown, setResendCooldown] = useState(0);
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(6);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    if (paste.length === 6) {
      setOtp(paste.split('').slice(0, 6));
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (formData.password !== formData.confirmPassword) {
      setMessage('Mật khẩu không khớp. Vui lòng nhập lại.');
      return;
    }
    dispatch(initiateRegister({ email: formData.email, fullName: formData.fullName, password: formData.password })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setMessage('Đăng ký thành công! Vui lòng nhập OTP.');
      } else {
        setMessage(result.payload as string || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    });
  };

  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (registerData) {
      const otpString = otp.join('');
      if (otpString.length === 6) {
        dispatch(verifyRegister({ email: registerData.email, otp: otpString })).then((result) => {
          if (result.meta.requestStatus === 'fulfilled') {
            setMessage(`Xác minh thành công! Chuyển hướng trong ${countdown}s...`);
            startCountdown();
          } else {
            setMessage(result.payload as string || 'Xác minh OTP thất bại. Vui lòng thử lại.');
          }
        });
      } else {
        setMessage('Vui lòng nhập đủ 6 chữ số OTP.');
      }
    }
  };

  const handleResendOtp = () => {
    if (resendCooldown === 0 && registerData) {
      const payload = { email: registerData.email, type: 'register' };
      dispatch(resendOtp(payload)).then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          setMessage('Đã gửi lại OTP!');
          setResendCooldown(60);
        } else {
          setMessage(result.payload as string || 'Gửi lại OTP thất bại.');
        }
      });
    }
  };

  const handleBackToRegister = () => {
    dispatch(resetAuthState());
    setMessage('');
    setOtp(new Array(6).fill(''));
  };

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          dispatch(resetAuthState());
          navigate('/login', { state: { message: 'Xác minh thành công! Bạn có thể đăng nhập ngay.' } });
          return 0;
        }
        setMessage(`Xác minh thành công! Chuyển hướng trong ${prev - 1}s...`);
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleGoogleRegister = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 py-8 px-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-green-800">Đăng Ký</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-green-600 hover:text-green-800 font-medium transition-colors"
              title="Về trang chủ"
            >
              <FaHome className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Trang chủ</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center text-green-600 hover:text-green-800 font-medium transition-colors"
              title="Đăng nhập"
            >
              <FaArrowLeft className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Đăng nhập</span>
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-medium text-center ${
              message.includes('thành công') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        {registerStatus !== 'succeeded' ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            <div className="relative">
              <FaEnvelope className="absolute top-3.5 left-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 transition-all"
                required
              />
            </div>
            <div className="relative">
              <FaUser className="absolute top-3.5 left-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="fullName"
                id="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Họ và tên"
                className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 transition-all"
                required
              />
            </div>
            <div className="relative">
              <FaLock className="absolute top-3.5 left-3 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Mật khẩu"
                className="pl-10 pr-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-3.5 right-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
              </button>
            </div>
            <div className="relative">
              <FaLock className="absolute top-3.5 left-3 h-5 w-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Nhập lại mật khẩu"
                className="pl-10 pr-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-3.5 right-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={registerStatus === 'loading'}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-green-400 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              {registerStatus === 'loading' ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                'Đăng Ký'
              )}
            </button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500 font-medium">Hoặc đăng ký với</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGoogleRegister}
              className="w-full py-3 px-4 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center font-medium"
            >
              <img
                src="https://img.icons8.com/color/20/000000/google-logo.png"
                alt="Google icon"
                className="mr-2"
              />
              Google
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <p className="text-center text-gray-600 font-medium">
              Nhập mã OTP gồm 6 chữ số đã được gửi đến email của bạn
            </p>
            <div className="flex justify-center space-x-2 sm:space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onPaste={handleOtpPaste}
                  className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 transition-all"
                  required
                />
              ))}
            </div>
            <button
              onClick={handleOtpSubmit}
              disabled={verifyStatus === 'loading'}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-green-400 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              {verifyStatus === 'loading' ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Đang xác minh...
                </span>
              ) : (
                'Xác Minh OTP'
              )}
            </button>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0}
                className="py-2 px-4 text-green-600 hover:text-green-800 font-semibold transition-all disabled:text-gray-400"
              >
                {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại OTP'}
              </button>
              <button
                type="button"
                onClick={handleBackToRegister}
                className="py-2 px-4 text-gray-600 hover:text-gray-800 font-semibold transition-all flex items-center"
              >
                <FaArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;