// Updated hooks/useShipperRegistration.ts
import { useNavigate } from 'react-router-dom';
import { registerShipper, clearError, setUploadingImages } from '@/store/Shipper/shipperSlice';
import { uploadImage } from '@/api/cloudinary/uploadService';
import type { ShipperRegistrationRequest, ShipperRegistrationResponse, ShipperRegistrationStatusResponse } from '@/types/Shipper/shipper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import Swal from 'sweetalert2';

export const useShipperRegistration = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  // ✅ Use correct fields from state
  const { 
    loading, 
    uploadingImages, 
    error, 
    registration 
  } = useSelector((state: RootState) => state.shipper);

  const handleRegisterShipper = async (data: ShipperRegistrationRequest) => {
    try {
      const result = await dispatch(registerShipper(data)).unwrap();
      
      // Success notification with SweetAlert2
      await Swal.fire({
        icon: 'success',
        title: 'Đăng ký thành công!',
        text: 'Chúng tôi sẽ xem xét hồ sơ của bạn trong 24-48 giờ.',
        confirmButtonText: 'Xem trạng thái',
        confirmButtonColor: '#3b82f6'
      });
      
      navigate('/shipper/registration-status');
      return result;
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      // Error notification with SweetAlert2
      Swal.fire({
        icon: 'error',
        title: 'Đăng ký thất bại!',
        text: error || 'Có lỗi xảy ra, vui lòng thử lại sau.',
        confirmButtonText: 'Thử lại',
        confirmButtonColor: '#ef4444'
      });
      
      throw error;
    }
  };

  const handleUploadImage = async (file: File): Promise<string> => {
    try {
      // ✅ Use Redux action for upload state
      dispatch(setUploadingImages(true));
      const response = await uploadImage(file);
      return response.data; // Return the URL from ApiResponse
    } catch (error: any) {
      console.error('Upload failed:', error);
      // Error will be handled by ImageUpload component
      throw error;
    } finally {
      dispatch(setUploadingImages(false));
    }
  };

  const clearErrorMessage = () => {
    dispatch(clearError());
  };

  return {
    loading,
    uploadingImages, // ✅ Return uploadingImages from Redux
    error,
    registration,
    registerShipper: handleRegisterShipper,
    uploadImage: handleUploadImage,
    clearError: clearErrorMessage
  };
};