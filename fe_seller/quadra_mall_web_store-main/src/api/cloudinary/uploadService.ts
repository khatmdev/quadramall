import axios from 'axios';

export const uploadImage = async (file: File | Blob): Promise<{ status: string; data?: string }> => {
  const formData = new FormData();
  formData.append('file', file, 'image.jpg');
  try {
    const { data: url } = await axios.post<string>(`${import.meta.env.VITE_API_MEDIA_URL}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { status: 'success', data: url };
  } catch (error) {
  console.error('uploadImage error:', error);
  return { status: 'error' };
  }
};

export const uploadVideo = async (file: File | Blob): Promise<{ status: string; data?: string }> => {
  const formData = new FormData();
  formData.append('file', file, 'video.mp4');
  try {
    const { data: url } = await axios.post<string>(`${import.meta.env.VITE_API_MEDIA_URL}/video`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { status: 'success', data: url };
  } catch (error) {
  console.error('uploadVideo error:', error);
  return { status: 'error' };
  }
};
