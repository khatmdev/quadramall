import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import SearchBar from './SearchBar';
import HeaderActions from './HeaderActions';
import AppDownloadTooltip from './AppDownloadTooltip';
import {useSelector} from "react-redux";
import {RootState} from "@/store";

const hotKeywords = [
  'USB Lexar 64gb',
  'Quạt Tích Điện',
  'Bàn Phím Cơ',
  'Lọt Khe Nữ',
  'iPhone 15 Pro Max',
  'Giày Onitsuka',
  'Dorothy'
];

const Header: React.FC = () => {
  const [showAppDownloadTooltip, setShowAppDownloadTooltip] = useState(false);
  const { token } = useSelector((state: RootState) => state.auth);

  const handleSellerRedirect = () => {
    // Tạo unique key để đảm bảo seller site nhận được signal
    const refreshKey = `seller_refresh_${Date.now()}`;

    // Set signals cho seller site
    localStorage.setItem('sellerRefreshNeeded', 'true');
    localStorage.setItem('sellerRefreshKey', refreshKey);
    localStorage.setItem('publicSiteToken', token || '');

    if (token) {
      const sellerUrl = `http://localhost:3000/seller?token=${encodeURIComponent(token)}&refresh=${refreshKey}`;
      window.open(sellerUrl, '_blank');
    } else {
      window.open(`http://localhost:3000/login?refresh=${refreshKey}`, '_blank');
    }
  };

  return (
    <header className="fixed top-0 left-0 z-40 w-full bg-gradient-to-b from-green-700 to-green-600 text-white">
      {/* Top Bar */}
      <div className="bg-transparent h-8 flex items-center justify-center px-4 text-xs text-white">
        <div className="flex space-x-4 relative">
          <button onClick={handleSellerRedirect} className="hover:underline">
            Kênh Người Bán
          </button>
          <div
            className="relative"
            onMouseEnter={() => setShowAppDownloadTooltip(true)}
            onMouseLeave={() => setShowAppDownloadTooltip(false)}
          >
            <Link to="/app-download" className="hover:underline">
              Tải Ứng Dụng
            </Link>

            {showAppDownloadTooltip && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[1px] z-50">
                <AppDownloadTooltip />
              </div>
            )}
          </div>
          <Link to="/vouchers" className="hover:underline">Vouchers</Link>
        </div>
      </div>

      {/* Header Chính */}
      <div className="border-b border-white/30 shadow">
        <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-start justify-between gap-4">
          <div className="shrink-0 pt-1">
            <Logo />
          </div>
          <div className="flex flex-col flex-grow">
            <SearchBar />
            <div className="flex flex-wrap gap-2 text-xs text-white mt-1 px-1">
              {hotKeywords.map((keyword, index) => (
                <Link
                  key={index}
                  to={`/search?q=${encodeURIComponent(keyword)}`}
                  className="hover:underline whitespace-nowrap"
                >
                  {keyword}
                </Link>
              ))}
            </div>
          </div>
          <HeaderActions />
        </div>
      </div>
    </header>
  );
};

export default Header;
