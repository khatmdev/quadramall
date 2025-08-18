import React, { useState, useEffect } from "react";
import { useSearch } from "@/components/context/SearchContext";
import { useNavigate, useLocation } from "react-router-dom";

const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery, resetSearch } = useSearch();
  const [inputValue, setInputValue] = useState(searchQuery);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync input with context when searchQuery changes
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchQuery(inputValue.trim());
      const queryParams = new URLSearchParams(location.search);
      if (location.pathname.startsWith("/search")) {
        // Preserve existing params on /search
        queryParams.set("q", encodeURIComponent(inputValue.trim()));
        navigate(`/search?${queryParams.toString()}`);
      } else {
        // Reset to only q on other pages
        navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
      }
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      setSearchQuery(inputValue.trim());
      const queryParams = new URLSearchParams(location.search);
      if (location.pathname.startsWith("/search")) {
        queryParams.set("q", encodeURIComponent(inputValue.trim()));
        navigate(`/search?${queryParams.toString()}`);
      } else {
        navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 items-center bg-gray-100 rounded-md overflow-hidden h-9 min-w-[400px] max-w-[1050px]">
      {/* Input */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Search on lenny..."
        className="flex-1 bg-gray-100 text-xs text-gray-700 placeholder-gray-400 px-2 py-2 focus:outline-none min-w-0"
      />
      {/* Search Icon */}
      <button
        type="submit"
        className="px-2 text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Search"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
          />
        </svg>
      </button>
    </form>
  );
};

export default SearchBar;