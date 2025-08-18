import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const getPages = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 24 }}>
      {getPages().map((page, idx) =>
        typeof page === 'number' ? (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              border: 'none',
              background: page === currentPage ? '#e6f4ea' : '#fff',
              color: page === currentPage ? '#34c759' : '#222',
              fontWeight: page === currentPage ? 600 : 400,
              boxShadow: page === currentPage ? '0 0 0 1px #34c759' : '0 0 0 1px #e5e7eb',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {page}
          </button>
        ) : (
          <span key={idx} style={{ width: 32, textAlign: 'center', color: '#888' }}>...</span>
        )
      )}
      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: 'none',
            background: '#fff',
            color: '#34c759',
            fontWeight: 600,
            boxShadow: '0 0 0 1px #e5e7eb',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          &gt;
        </button>
      )}
    </div>
  );
};

export default Pagination;
