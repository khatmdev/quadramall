import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Check, Loader2, Upload } from 'lucide-react';
import Swal from 'sweetalert2';

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
  required?: boolean;
  accept?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  value = '',
  onChange,
  onUpload,
  required = false,
  accept = 'image/*'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    setPreview(value || null);
    setUploadSuccess(!!value);
  }, [value]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload in background
    setUploading(true);
    setUploadSuccess(false);
    
    try {
      const url = await onUpload(file);
      onChange(url);
      setUploadSuccess(true);
      
      // Show success notification
      Swal.fire({
        icon: 'success',
        title: 'Tải ảnh thành công!',
        text: `${label} đã được tải lên thành công`,
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    } catch (error: any) {
      setPreview(null);
      setUploadSuccess(false);
      
      // Show error notification
      Swal.fire({
        icon: 'error',
        title: 'Lỗi tải ảnh!',
        text: error.message || 'Không thể tải ảnh lên',
        confirmButtonText: 'Thử lại'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setUploadSuccess(false);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors relative">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg"
            />
            
            {/* Status indicators */}
            <div className="absolute top-2 right-2 flex gap-2">
              {uploading && (
                <div className="bg-blue-500 text-white p-1 rounded-full">
                  <Loader2 className="animate-spin h-4 w-4" />
                </div>
              )}
              {uploadSuccess && !uploading && (
                <div className="bg-green-500 text-white p-1 rounded-full">
                  <Check className="h-4 w-4" />
                </div>
              )}
              <button
                type="button"
                onClick={handleRemove}
                className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Upload overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-white text-center">
                  <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Đang tải lên...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className="text-center cursor-pointer py-8"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <Upload size={48} />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Nhấn để chọn ảnh
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF tối đa 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
