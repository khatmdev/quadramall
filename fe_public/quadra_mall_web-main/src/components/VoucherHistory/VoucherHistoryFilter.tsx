import React from 'react';

interface VoucherHistoryFilterProps {
  tab: 'saved' | 'used';
  onChange: (tab: 'saved' | 'used') => void;
}

const tabOptions = [
  { label: 'Đã lưu', value: 'saved' },
  { label: 'Đã sử dụng', value: 'used' },
];

const VoucherHistoryFilter: React.FC<VoucherHistoryFilterProps> = ({ tab, onChange }) => {
  return (
    <div className="flex mb-4">
      <div className="flex border-b border-gray-300 bg-transparent w-fit mr-auto">
        {tabOptions.map((opt, idx) => (
          <button
            key={opt.value}
            type="button"
            className={`relative px-6 py-2 text-base font-medium transition-colors duration-200 focus:outline-none
              ${tab === opt.value
                ? 'text-emerald-600'
                : 'text-gray-500 hover:text-emerald-500'}
            `}
            style={{
              borderTopLeftRadius: idx === 0 ? 8 : 0,
              borderTopRightRadius: idx === tabOptions.length - 1 ? 8 : 0,
            }}
            onClick={() => onChange(opt.value as 'saved' | 'used')}
          >
            {opt.label}
            {tab === opt.value && (
              <span className="absolute left-0 right-0 -bottom-[1px] h-1 bg-emerald-500 rounded-t-full" style={{boxShadow: '0 2px 8px 0 #10b98133'}} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VoucherHistoryFilter;
