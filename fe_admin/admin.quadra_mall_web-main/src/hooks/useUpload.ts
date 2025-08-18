// src/hooks/useUpload.ts
import { uploadImage } from '@/api/cloudinary/uploadService';
import { useApiMutation } from '@/hooks/useApiMutation'; // Điều chỉnh path nếu cần

export const useUploadImage = () => {
  return useApiMutation<Blob, string>({
    mutationFn: uploadImage,
    onSuccessMessage: 'Ảnh đã được upload thành công',
    // Không cần invalidateQueryKey vì upload không ảnh hưởng đến query khác
  });
};