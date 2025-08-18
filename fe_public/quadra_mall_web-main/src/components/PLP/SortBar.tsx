import React from "react";

interface SortBarProps {
  onSortChange: (value: string) => void;
}

const SortBar: React.FC<SortBarProps> = React.memo(({ onSortChange }) => (
  <div className="mb-4">
    <select
      className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      onChange={(e) => onSortChange(e.target.value)}
    >
      <option value="newest">Mới nhất</option>
      <option value="priceAsc">Giá tăng dần</option>
      <option value="priceDesc">Giá giảm dần</option>
      <option value="soldDesc">Bán chạy</option>
      <option value="ratingDesc">Rating cao</option>
    </select>
  </div>
));

export default SortBar;