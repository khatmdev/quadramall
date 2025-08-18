import React from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  open: boolean;
  onClose: () => void;
  imageName: string; // URL đầy đủ của hình ảnh
}

const ImageModal: React.FC<ImageModalProps> = ({ open, onClose, imageName }) => {
  if (!open) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-4 max-w-3xl w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Xem trước hình ảnh</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          <div className="bg-gray-100 rounded flex items-center justify-center overflow-hidden">
            {imageName ? (
                <img
                    src={imageName}
                    alt="Document"
                    className="w-full h-auto max-h-[80vh] object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/fallback-image.png'; // Hình ảnh dự phòng nếu lỗi
                      e.currentTarget.alt = 'Hình ảnh không tải được';
                    }}
                />
            ) : (
                <p className="text-gray-500 p-4">Không có hình ảnh để hiển thị</p>
            )}
          </div>
        </div>
      </div>
  );
};

export default ImageModal;