import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { AppDispatch, RootState } from '@/store';
import { toast } from 'react-toastify';

import { getProfile, updateProfile as updateProfileApi } from '@/api/profileApi';

const ProfileForm: React.FC = () => {
  // const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    avatar: null as File | null,
  });
  const [avatarPreview, setAvatarPreview] = useState('https://via.placeholder.com/200');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await getProfile();
        setFormData({
          fullName: data.fullName || '',
          phone: data.phone || '',
          avatar: null,
        });
        setAvatarPreview(data.avatarUrl || 'https://via.placeholder.com/200');
        setEmail(data.email || '');
      } catch (err) {
        console.error('Lỗi khi gọi API getProfile:', err);
      }
    };
    fetchProfileData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error('Chỉ hỗ trợ file JPEG hoặc PNG!');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file tối đa là 5MB!');
        return;
      }
      setFormData((prev) => ({ ...prev, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Validate inputs
    if (!formData.fullName && !formData.phone && !formData.avatar) {
      setError('Vui lòng nhập ít nhất một trường thông tin!');
      setLoading(false);
      return;
    }
    if (formData.phone == null) {
      setError('Số điện thoại không hợp lệ!');
      setLoading(false);
      return;
    }
    // Create FormData to match backend @ModelAttribute ProfileRequest
    const formDataToSend = new FormData();
    if (formData.fullName) formDataToSend.append('fullName', formData.fullName);
    if (formData.phone) formDataToSend.append('phone', formData.phone);
    if (formData.avatar) formDataToSend.append('avatar', formData.avatar);
    try {
      await updateProfileApi(formDataToSend);
      toast.success('Cập nhật hồ sơ thành công!');
      // Fetch updated profile data
      const updatedData = await getProfile();
      setFormData({
        fullName: updatedData.fullName || '',
        phone: updatedData.phone || '',
        avatar: null,
      });
      setAvatarPreview(updatedData.avatarUrl || 'https://via.placeholder.com/200');
      setEmail(updatedData.email || '');
    } catch (err) {
      console.error('Update profile error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Cập nhật hồ sơ thất bại!';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 max-w-3xl mx-auto transform transition-all duration-300">
      <h2 className="text-3xl font-bold mb-8 text-green-700">Hồ sơ người dùng</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center gap-8 px-4 py-6">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-green-200 bg-gray-100 shadow group">
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
              <span className="text-white text-sm font-medium">Tải lên</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-2xl text-green-800 truncate">{formData.fullName || 'Tên người dùng'}</span>
              <span className="bg-green-100 text-green-700 text-sm px-4 py-1 rounded-full font-medium border border-green-400 shadow-sm">
                Đã xác thực
              </span>
            </div>
            <div className="text-gray-600 text-lg font-medium">{email || 'email@example.com'}</div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">Họ và tên</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Nhập họ và tên..."
              className="w-full border border-green-300 rounded-lg px-4 py-3 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">Số điện thoại</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Nhập số điện thoại..."
              className="w-full border border-green-300 rounded-lg px-4 py-3 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-colors duration-200"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-right">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-all duration-200 disabled:bg-green-400 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </form>
    </div>
  );
};

export default ProfileForm;