import React from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';

interface SuccessPopupProps {
  message: string;
  show: boolean;
  onClose?: () => void;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({ message, show, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
      <div className="relative bg-white shadow-2xl rounded-2xl px-10 py-8 flex flex-col items-center min-w-[320px] max-w-[90vw] animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition focus:outline-none"
          aria-label="Đóng"
        >
          <FaTimes className="text-gray-400 text-xl" />
        </button>
        <FaCheckCircle className="text-emerald-500 text-6xl mb-4" />
        <span className="text-gray-900 font-bold text-xl text-center mb-1">{message || 'Đã lưu voucher'}</span>
      </div>
    </div>
  );
};

export default SuccessPopup;
