import React from 'react';

const Header: React.FC = () => {
  return (
      <header className="bg-gray-900 text-white h-16 flex items-center justify-between px-4">
        {/* Left: Logo */}
        <div className="flex items-center space-x-2">
          <div className="text-blue-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            </svg>
          </div>
          <span className="text-xl font-bold">fastcart</span>
        </div>

        {/* Center: Search */}
        <div className="flex-1 mx-4">
          <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-800 text-white placeholder-gray-400 p-2 rounded-lg outline-none"
          />
        </div>

        {/* Right: User Info */}
        <div className="flex items-center space-x-4">
          <button className="relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">5</span>
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-green-400 font-bold">R</span>
            <span className="text-white">Randhir kumar</span>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.5 7l4.5 4.5L14.5 7h-9z" />
            </svg>
          </div>
        </div>
      </header>
  );
};
export default Header;
