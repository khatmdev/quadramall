import React from 'react';

const SortDropdown: React.FC = () => {
  return (
    <div className="flex items-center mb-4">
      <span className="text-gray-500 mr-2">Sort By:</span>
      <select className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-800 focus:outline-none focus:ring focus:ring-blue-200">
        <option>Latest Added</option>
        <option>Price: Low to High</option>
        <option>Price: High to Low</option>
        <option>Name: A-Z</option>
        <option>Name: Z-A</option>
      </select>
    </div>
  );
};

export default SortDropdown;
