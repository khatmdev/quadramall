import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import api from '@/api/axios';

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

interface ChangePasswordResponse {
  message: string;
  status: number;
}

const ChangePassword: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Toggle show/hide password
  const toggleShowPassword = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {};

    if (!oldPassword) {
      newErrors.oldPassword = 'Vui lòng nhập mật khẩu cũ';
    }
    if (!newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [oldPassword, newPassword, confirmPassword]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage(null);
      setSuccessMessage(null);

      if (!validateForm()) return;

      setIsLoading(true);
      try {
        const response = await api.post<ChangePasswordResponse>('/auth/change-password', {
          oldPassword,
          newPassword,
        });
        if (response.data.status !== 200) {
          setErrorMessage(response.data.message);
        } else {
          setSuccessMessage(response.data.message || 'Đổi mật khẩu thành công!');
          setTimeout(() => navigate('/profile'), 2000); // Redirect after 2s
        }
      } catch (err: any) {
        setErrorMessage(err.response?.data?.message || 'Đổi mật khẩu thất bại');
      } finally {
        setIsLoading(false);
      }
    },
    [oldPassword, newPassword, validateForm, navigate]
  );

  const formInputs = useMemo(
    () => [
      {
        id: 'oldPassword',
        label: 'Mật khẩu cũ',
        type: showPasswords.oldPassword ? 'text' : 'password',
        value: oldPassword,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setOldPassword(e.target.value),
        error: errors.oldPassword,
        showPassword: showPasswords.oldPassword,
        toggleShow: () => toggleShowPassword('oldPassword'),
      },
      {
        id: 'newPassword',
        label: 'Mật khẩu mới',
        type: showPasswords.newPassword ? 'text' : 'password',
        value: newPassword,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value),
        error: errors.newPassword,
        showPassword: showPasswords.newPassword,
        toggleShow: () => toggleShowPassword('newPassword'),
      },
      {
        id: 'confirmPassword',
        label: 'Xác nhận mật khẩu mới',
        type: showPasswords.confirmPassword ? 'text' : 'password',
        value: confirmPassword,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value),
        error: errors.confirmPassword,
        showPassword: showPasswords.confirmPassword,
        toggleShow: () => toggleShowPassword('confirmPassword'),
      },
    ],
    [oldPassword, newPassword, confirmPassword, errors, showPasswords]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-white px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transition-all duration-300 hover:shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <LockClosedIcon className="h-10 w-10 text-green-600 animate-bounce mb-2" />
          <h1 className="text-3xl font-bold text-green-700">Đổi mật khẩu</h1>
        </div>

        {errorMessage && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center animate-fade-in">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm text-center animate-fade-in">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {formInputs.map((input) => (
            <div key={input.id} className="relative">
              <label
                htmlFor={input.id}
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                {input.label}
              </label>
              <div className="relative">
                <LockClosedIcon className="w-5 h-5 text-gray-400 absolute top-3 left-3" />
                <input
                  id={input.id}
                  type={input.type}
                  value={input.value}
                  onChange={input.onChange}
                  placeholder={input.label}
                  className={`pl-10 pr-10 py-2.5 w-full border ${
                    input.error ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors duration-200 text-sm`}
                  aria-invalid={!!input.error}
                  aria-describedby={`${input.id}-error`}
                />
                <button
                  type="button"
                  onClick={input.toggleShow}
                  className="absolute top-2.5 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={input.showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {input.showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {input.error && (
                <p
                  id={`${input.id}-error`}
                  className="text-red-500 text-xs mt-1.5 animate-fade-in"
                >
                  {input.error}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition-all duration-200 font-semibold text-sm ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
            }`}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                  />
                </svg>
                Đang xử lý...
              </span>
            ) : (
              'Đổi mật khẩu'
            )}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-500">
          Quay lại{' '}
          <button
            onClick={() => navigate('/profile')}
            className="text-green-600 hover:underline font-medium transition-colors duration-200"
          >
            Hồ sơ
          </button>
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;