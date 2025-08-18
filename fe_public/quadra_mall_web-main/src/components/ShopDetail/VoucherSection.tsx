import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { DiscountCodeDto } from '@/types/store_detail/interfaces';

interface VoucherSectionProps {
  discountCodes: DiscountCodeDto[];
  userId?: number; // Thêm prop userId
}

const VoucherSection: React.FC<VoucherSectionProps> = ({ discountCodes}) => {
  const [localDiscountCodes, setLocalDiscountCodes] = useState<DiscountCodeDto[]>(discountCodes);
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 3;
  const voucherWidth = 320;
  const gap = 16;
  const totalWidthPerSlide = (voucherWidth + gap) * visibleCount;

  useEffect(() => {
    setLocalDiscountCodes(discountCodes);
  }, [discountCodes]);

  // Hàm format ngày từ [year, month, day] thành chuỗi
  const formatDate = (date: [number, number, number]): string => {
    return `${String(date[2]).padStart(2, '0')}/${String(date[1]).padStart(2, '0')}/${date[0]}`;
  };

  // Hàm format giá trị giảm giá
  const formatDiscount = (discountValue: number, discountType: string): string => {
    if (discountType === 'PERCENTAGE') {
      return `${discountValue}%`;
    }
    return `${(discountValue / 1000).toFixed(0)}k`;
  };

  // Hàm format thời gian hiệu lực
  const formatValidPeriod = (startDate: [number, number, number], endDate: [number, number, number]): string => {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Hàm format số lượng còn lại
  const formatStockText = (quantity: number, usedCount: number): string => {
    const remaining = quantity - usedCount;
    return `Còn ${remaining} mã`;
  };

  const prev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.floor((localDiscountCodes.length - 1) / visibleCount) * visibleCount : prev - visibleCount
    );
  };

  const next = () => {
    setCurrentIndex((prev) => (prev + visibleCount >= localDiscountCodes.length ? 0 : prev + visibleCount));
  };

  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex + visibleCount >= localDiscountCodes.length;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6 relative overflow-hidden">
      <h2 className="text-lg font-semibold mb-4 text-center">Voucher</h2>
      <div className="flex items-center justify-center gap-4 relative">
        {/* Nút trái */}
        <button
          onClick={prev}
          disabled={isPrevDisabled}
          className="absolute left-2 z-10 bg-white border border-green-300 shadow-lg hover:bg-green-50 hover:scale-105 active:scale-95 transition-all duration-200 p-3 rounded-full text-green-500 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous vouchers"
        >
          <FiChevronLeft size={24} />
        </button>

        {/* Container cuộn ngang */}
        <div className="overflow-hidden w-[1008px]">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${(currentIndex / visibleCount) * totalWidthPerSlide}px)`,
              gap: `${gap}px`,
            }}
          >
            {localDiscountCodes.map((voucher) => (
              <div
                key={voucher.id}
                className="flex-shrink-0 w-70 h-28 bg-white border border-green-200 rounded-2xl overflow-hidden shadow-sm relative flex items-center"
                style={{ width: `${voucherWidth}px` }}
              >
                <button className={`flex-shrink-0 w-16 h-full flex items-center justify-center transition-colors hover:opacity-80 focus:outline-none ${
                  voucher.saved
                    ? 'bg-white border-2 border-green-200 text-green-600'
                    : 'bg-green-200 text-gray-700'
                }`}>
                  <span className="font-medium text-sm">
                    {voucher.saved ? 'Đã lưu' : 'Lưu'}
                  </span>
                </button>
                <div className="absolute top-1/2 left-16 -translate-y-1/2 w-2 h-4 rounded-full bg-white shadow-sm"></div>
                <div className="px-4 py-2 flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-green-600 font-bold text-xl flex-shrink-0">
                      {formatDiscount(voucher.discountValue, voucher.discountType)}
                    </span>
                    <span className="text-sm text-gray-800 truncate max-w-[160px]">{voucher.description}</span>
                  </div>
                  <div className="text-xs text-green-500 mb-0.5">{formatStockText(voucher.quantity, voucher.usedCount)}</div>
                  <div className="text-xs text-gray-600">{formatValidPeriod(voucher.startDate, voucher.endDate)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nút phải */}
        <button
          onClick={next}
          disabled={isNextDisabled}
          className="absolute right-2 z-10 bg-white border border-green-300 shadow-lg hover:bg-green-50 hover:scale-105 active:scale-95 transition-all duration-200 p-3 rounded-full text-green-500 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next vouchers"
        >
          <FiChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default VoucherSection;
