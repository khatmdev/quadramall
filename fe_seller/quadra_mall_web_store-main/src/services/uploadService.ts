import { api } from '@/main';

export const uploadImage = async (file: File): Promise<string> => {
    // Kiểm tra định dạng và kích thước file
    const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp',
        'image/webp', 'image/svg+xml', 'image/tiff', 'image/ico'
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
        throw new Error('Định dạng file không hợp lệ. Chỉ hỗ trợ JPG, PNG, GIF, BMP, WEBP, SVG, TIFF, ICO.');
    }
    if (file.size > maxSize) {
        throw new Error('File quá lớn. Kích thước tối đa là 5MB.');
    }

    // Kiểm tra token
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await api.post('/api/media/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.data; // Giả sử API trả về URL trực tiếp trong response.data
    } catch (error: any) {
        console.error('Error uploading file:', error);
        throw new Error(
            error.message || 'Không thể upload file. Vui lòng kiểm tra định dạng file và thử lại.'
        );
    }
};

export const uploadVideo = async (file: File): Promise<string> => {
    // Kiểm tra định dạng và kích thước file
    const allowedTypes = [
        'video/mp4', 'video/mov', 'video/avi', 'video/wmv', 'video/webm',
        'video/mkv', 'video/flv', 'video/3gp', 'video/ogg', 'video/quicktime'
    ];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!allowedTypes.includes(file.type)) {
        throw new Error('Định dạng file không hợp lệ. Chỉ hỗ trợ MP4, MOV, AVI, WMV, WEBM, MKV, FLV, 3GP, OGG.');
    }
    if (file.size > maxSize) {
        throw new Error('File quá lớn. Kích thước tối đa là 100MB.');
    }

    // Kiểm tra token
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await api.post('/api/media/upload/video', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.data; // Giả sử API trả về URL trực tiếp trong response.data
    } catch (error: any) {
        console.error('Error uploading video:', error);
        throw new Error(
            error.message || 'Không thể upload video. Vui lòng kiểm tra định dạng file và thử lại.'
        );
    }
};

// Hàm upload media tổng hợp (tự động phát hiện file type)
export const uploadMedia = async (file: File): Promise<string> => {
    if (file.type.startsWith('image/')) {
        return uploadImage(file);
    } else if (file.type.startsWith('video/')) {
        return uploadVideo(file);
    } else {
        throw new Error('Loại file không được hỗ trợ. Chỉ hỗ trợ hình ảnh và video.');
    }
};