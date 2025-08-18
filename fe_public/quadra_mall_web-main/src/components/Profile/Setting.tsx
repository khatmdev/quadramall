import React, { useState } from 'react';

const NotificationsSettings: React.FC = () => {
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(true);
  const [messages, setMessages] = useState(false);

  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('vi');

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b border-gray-300 pb-2">
        Cài đặt thông báo
      </h2>

      <div className="space-y-6">
        {/* Cập nhật đơn hàng */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-800">Cập nhật đơn hàng</h3>
            <p className="text-sm text-gray-500">Nhận thông báo về trạng thái đơn hàng.</p>
          </div>
          <button
            type="button"
            onClick={() => setOrderUpdates(!orderUpdates)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
              orderUpdates ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                orderUpdates ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Khuyến mãi */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-800">Khuyến mãi</h3>
            <p className="text-sm text-gray-500">Nhận thông báo về ưu đãi và khuyến mãi.</p>
          </div>
          <button
            type="button"
            onClick={() => setPromotions(!promotions)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
              promotions ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                promotions ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Tin tức */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-800">Tin tức</h3>
            <p className="text-sm text-gray-500">Nhận thông báo về các bài viết mới và xu hướng.</p>
          </div>
          <button
            type="button"
            onClick={() => setMessages(!messages)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
              messages ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                messages ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Ứng dụng */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b border-gray-300 pb-2">
          Ứng dụng
        </h2>

        <div className="space-y-6">
          {/* Chế độ tối */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Chế độ tối</h3>
              <p className="text-sm text-gray-500">Thay đổi giao diện ứng dụng</p>
            </div>
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                darkMode ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Ngôn ngữ */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Ngôn ngữ</h3>
              <p className="text-sm text-gray-500">Chọn ngôn ngữ ứng dụng</p>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border border-gray-400 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring focus:border-green-500 transition-colors"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsSettings;
