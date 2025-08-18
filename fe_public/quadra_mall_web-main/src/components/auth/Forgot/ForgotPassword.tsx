import React, { useState } from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { api } from '@/main';
const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-white px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-green-700 mb-6">Quên mật khẩu</h2>
        {message && <p className="text-green-500 mb-4 text-sm text-center">{message}</p>}
        {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}
        <div className="space-y-4">
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
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
        </div>
        <p className="mt-4 text-sm text-center">
          <a href="/login" className="text-green-600 hover:underline">
            Quay lại đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;