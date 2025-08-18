import React from 'react';

interface VoucherSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const VoucherSearch: React.FC<VoucherSearchBarProps> = ({ value, onChange }) => (
  <div className="mb-4 relative">
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Tìm kiếm voucher theo tên, mã..."
      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200 pl-10 bg-white"
    />
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400">
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <path
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6z"
        />
      </svg>
    </span>
  </div>
);

export default VoucherSearch;
