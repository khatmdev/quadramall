import React from 'react';
import { FaApple } from 'react-icons/fa';

const AppDownloadTooltip: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64">
      <div className="flex justify-center mb-4">
        <img
          src="https://via.placeholder.com/128x128"
          alt="QR Code"
          className="w-32 h-32"
        />
      </div>
      <div className="flex justify-center space-x-6">
        <a
          href="https://apps.apple.com/app/your-app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center text-xs text-gray-700 hover:text-black"
        >
          <FaApple className="w-6 h-6 mb-1" />
          App Store
        </a>
        <a
          href="https://play.google.com/store/apps/details?id=com.yourapp"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center text-xs text-gray-700 hover:text-black"
        >
          <img
            src="/assets/google-play-svgrepo-com.svg"
            alt="Google Play"
            className="w-6 h-auto mb-1"
          />
          Google Play
        </a>
      </div>
    </div>
  );
};

export default AppDownloadTooltip;
