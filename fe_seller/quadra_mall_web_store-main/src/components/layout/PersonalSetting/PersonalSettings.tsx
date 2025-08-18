import React from 'react';
import { TbSettingsCode } from 'react-icons/tb';

const PersonalSettings = () => {
  return (
    <div className="min-h-screen bg-gray-100 font-sans p-6">
      {/* Header with Title + Buttons */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2 text-2xl font-bold">
          <TbSettingsCode className="text-gray-800 text-3xl" />
          <h1>Cài đặt</h1>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-400 rounded text-gray-700 hover:bg-gray-100">
            Hủy
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Lưu lại
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md">
        {/* Navigation */}
        <div className="flex flex-wrap gap-4 mb-6 border-b pb-4">
          <a href="#" className="text-blue-600">Hồ sơ shop</a>
          <a href="#">Vận chuyển</a>
          <a href="#">Thanh toán</a>
          <a href="#">Thông báo</a>
          <a href="#">Chat</a>
          <a href="#">Tài khoản</a>
          <label className="flex items-center space-x-2 ml-auto">
            <span>Chế độ tối</span>
            <input type="checkbox" className="form-checkbox" />
          </label>
        </div>

        {/* Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Hồ sơ shop</h2>
          <p className="text-gray-600 mb-6">Điền thông tin gian hàng của bạn</p>

          {/* Logo Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo shop</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <p className="text-gray-500 mb-2">Add File</p>
              <p className="text-gray-400 text-sm">Or drag and drop files</p>
            </div>
          </div>

          {/* Shop Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Tên shop</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập tên shop"
            />
            <p className="text-red-500 text-xs mt-1">
              (nhập họ và số thì phải có 30 ngày làm việc để duyệt)
            </p>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Địa chỉ email</label>
            <input
              type="email"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Số điện thoại"
            />
            <p className="text-red-500 text-xs mt-1">(Số điện thoại)</p>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Mô tả shop</label>
            <textarea
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mô tả shop"
              rows={4}
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalSettings;
