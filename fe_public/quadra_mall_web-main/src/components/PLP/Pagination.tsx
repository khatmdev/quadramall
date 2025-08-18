import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = React.memo(
  ({ currentPage, totalPages, onPageChange }) => (
    <div className="flex justify-center gap-2 mt-4">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 border rounded-lg ${
            page === currentPage
              ? "bg-blue-500 text-white"
              : "bg-white hover:bg-gray-100"
          } transition-colors`}
        >
          {page}
        </button>
      ))}
    </div>
  )
);

export default Pagination;