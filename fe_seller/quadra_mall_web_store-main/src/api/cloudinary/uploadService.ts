import axios from 'axios';

export const uploadImage = async (file: File | Blob): Promise<{ status: string; data?: string }> => {
  const formData = new FormData();
  formData.append('file', file, 'image.jpg');
  try {
    const { data: url } = await axios.post<string>('http://localhost:8080/api/media/upload/image', formData, {
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
    const { data: url } = await axios.post<string>('http://localhost:8080/api/media/upload/video', formData, {
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
