import React, { useState } from "react";
import ViewToggle from "./ViewToggle";

interface TitleSortBarProps {
  sort: string;
  setSort: (value: string) => void;
}

const TitleSortBar: React.FC<TitleSortBarProps> = ({ sort, setSort }) => {
  const [view, setView] = useState<"grid" | "list">("grid");

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
      <div>
        <h2 className="font-semibold text-xl text-gray-800 mb-1">
          Showing product for{" "}
          <span className="text-black font-bold">"Gaming Gear"</span>
        </h2>
        <p className="text-xs text-gray-500">Showing 1-80 Products</p>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-xs mr-2 text-gray-400 font-medium">Sort By:</label>
        <select
          className="border border-gray-200 rounded-lg px-3 py-1 text-xs focus:outline-green-500 bg-white hover:border-green-500 transition shadow-none"
          value={sort}
          onChange={handleSortChange}
        >
          <option>Relevant Products</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Newest</option>
        </select>
        <span className="w-px h-6 bg-gray-200 mx-1" />
        <ViewToggle view={view} onChange={setView} />
      </div>
    </div>
  );
};

export default TitleSortBar;
