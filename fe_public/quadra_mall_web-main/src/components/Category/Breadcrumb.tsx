import React from "react";

const Breadcrumb = () => (
  <nav className="text-xs text-gray-500 flex items-center gap-2 mb-4">
    <span className="text-green-600 cursor-pointer">Home</span>
    <span>{">"}</span>
    <span className="cursor-pointer">Electronic</span>
    <span>{">"}</span>
    <span className="font-semibold text-black">Gaming Gear</span>
  </nav>
);

export default Breadcrumb;
