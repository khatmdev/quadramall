import React from 'react';

const voucherTypes = [
  { label: 'Tất cả', value: '' },
  { label: 'Miễn Phí Vận Chuyển', value: 'freeship' },
  { label: 'Giảm giá', value: 'discount' },
  { label: 'Hoàn xu', value: 'coin' },
  { label: 'Voucher Shop', value: 'shop' },
  { label: 'Khác', value: 'other' },
];

interface VoucherFilterProps {
  type: string;
  onChange: (filters: { type: string; status: string; expiry: string }) => void;
}

const VoucherFilter: React.FC<VoucherFilterProps> = ({ type, onChange }) => (
  <div className="flex flex-col gap-2 mb-4 bg-white p-3 rounded-lg border border-gray-100">
    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-gray-100">
      <div className="flex gap-2 flex-nowrap min-w-max py-1">
        {voucherTypes.map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`px-5 py-2 rounded-full border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-300
              ${type === opt.value ? 'bg-emerald-100 border-emerald-500 text-emerald-700 shadow' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            style={{ minWidth: 110 }}
            onClick={() => onChange({ type: opt.value, status: '', expiry: '' })}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default VoucherFilter;
