import React from 'react';

interface FilterProps {
  selectedSort: 'comprehensive' | 'best_selling' | 'newest' | 'price_asc' | 'price_desc';
  onSelectSort: (sort: 'comprehensive' | 'best_selling' | 'newest' | 'price_asc' | 'price_desc') => void;
}

const Filter: React.FC<FilterProps> = ({ selectedSort, onSelectSort }) => {
  return (
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <button
              onClick={() => onSelectSort('comprehensive')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200 ${
                  selectedSort === 'comprehensive'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Tổng hợp
          </button>
          <button
              onClick={() => onSelectSort('best_selling')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200 ${
                  selectedSort === 'best_selling'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Bán chạy
          </button>
          <button
              onClick={() => onSelectSort('newest')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200 ${
                  selectedSort === 'newest'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Mới
          </button>
          <button
              onClick={() => onSelectSort('price_asc')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200 ${
                  selectedSort === 'price_asc'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Giá thấp đến cao
          </button>
          <button
              onClick={() => onSelectSort('price_desc')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200 ${
                  selectedSort === 'price_desc'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Giá cao đến thấp
          </button>
        </div>
      </div>
  );
};

export default Filter;
