import React, { useState } from 'react';
import { Voucher } from './VoucherList';
import { FaShoppingBag } from 'react-icons/fa';
import ReactDOM from 'react-dom';
import SuccessPopup from './SuccessPopup';
import VoucherDetailPopup from './VoucherDetail';

interface VoucherCardProps {
  voucher: Voucher;
  onAction?: () => void;
  onClick?: () => void;
}

const VoucherCard: React.FC<VoucherCardProps> = ({ voucher, onAction, onClick }) => {
  const [saved, setSaved] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showDetailPopup, setShowDetailPopup] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(true);
    setShowPopup(true);
    if (onAction) onAction();
  };

  const handleClosePopup = () => setShowPopup(false);
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName.toLowerCase() === 'button') return;
    setShowDetailPopup(true);
    if (onClick) onClick();
  };

  return (
    <>
      {showPopup && typeof window !== 'undefined' && ReactDOM.createPortal(
        <SuccessPopup message="Đã lưu voucher thành công!" show={showPopup} onClose={handleClosePopup} />,
        document.body
      )}
      {showDetailPopup && typeof window !== 'undefined' && ReactDOM.createPortal(
        <VoucherDetailPopup voucher={voucher} open={showDetailPopup} onClose={() => setShowDetailPopup(false)} />,
        document.body
      )}
      <div
        className="relative flex w-full my-4 h-32 max-w-full cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg active:scale-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
        tabIndex={0}
        role="button"
        onClick={handleCardClick}
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ' ') && onClick) {
            onClick();
          }
        }}
        style={{ outline: 'none' }}
      >
        <div className="flex flex-col items-center justify-center w-1/3 h-full bg-emerald-100 rounded-l-2xl relative">
          <FaShoppingBag className="text-emerald-400 text-4xl mb-2" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10">
            <svg width="24" height="48" viewBox="0 0 24 48" fill="none">
              <circle cx="12" cy="12" r="6" fill="#fff" />
              <circle cx="12" cy="36" r="6" fill="#fff" />
            </svg>
          </div>
        </div>
        <div className="flex-1 h-full bg-white rounded-r-2xl flex flex-col justify-center px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-bold text-gray-800 mb-1 line-clamp-1">{voucher.discount}</div>
              <div className="text-xs text-gray-600 line-clamp-1">{voucher.condition}</div>
              <div className="text-xs text-emerald-600 font-semibold mt-1">Hết hạn: {voucher.expiry}</div>
            </div>
            <div className="flex flex-col gap-2 min-w-[90px] items-end">
              <button
                onClick={handleSave}
                disabled={saved}
                className={`px-5 py-1.5 rounded-full font-semibold shadow transition text-white ${saved ? 'bg-gray-300 cursor-not-allowed' : 'bg-emerald-400 hover:bg-emerald-500'}`}
              >
                {saved ? 'Đã lưu' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VoucherCard;
