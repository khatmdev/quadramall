import React, { useState } from 'react';

const SecurityForm: React.FC = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Bảo mật tài khoản</h2>

      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
          <input
            type="password"
            className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-white focus:border-green-500 focus:ring-green-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
          <input
            type="password"
            className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-white focus:border-green-500 focus:ring-green-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
          <input
            type="password"
            className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-white focus:border-green-500 focus:ring-green-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between border-t pt-6 mt-6">
          <div>
            <h3 className="text-md font-medium text-gray-800">Xác thực hai yếu tố</h3>
            <p className="text-sm text-gray-500">Thêm lớp bảo mật cho tài khoản của bạn.</p>
          </div>

          {/* Toggle switch */}
          <button
            type="button"
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
              twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="text-right">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-md shadow-sm"
          >
            Cập nhật mật khẩu
          </button>
        </div>
      </form>
    </div>
  );
};

export default SecurityForm;
