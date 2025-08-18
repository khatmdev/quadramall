import React from 'react';
import { Wallet, Plus, Minus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ModernWalletHeaderProps {
  onDepositClick: () => void;
  onWithdrawClick: () => void;
  onRefreshClick?: () => void;
}

const ModernWalletHeader = ({ onDepositClick, onWithdrawClick, onRefreshClick }: ModernWalletHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { key: 'dashboard', label: 'Tổng quan', path: '/wallet/dashboard' },
    { key: 'history', label: 'Lịch sử', path: '/wallet/history' },
    { key: 'stats', label: 'Thống kê', path: '/wallet/stats' },
  ];

  const getActiveTab = () => {
    const currentPath = location.pathname;
    const activeTab = tabs.find((tab) => tab.path === currentPath);
    return activeTab ? activeTab.key : 'dashboard';
  };
  const handleRefreshClick = () => {
    if (onRefreshClick) {
      onRefreshClick();
    } else {
      // Default refresh action if no callback is provided
      window.location.reload();
    }
  };

  return (
    <header className="relative bg-gradient-to-br from-slate-50 via-white to-green-50/30 backdrop-blur-xl border-b border-white/20 shadow-2xl shadow-green-500/5">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-green-400/10 via-green-500/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -top-12 -right-12 w-72 h-72 bg-gradient-to-bl from-green-300/8 to-transparent rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(34,197,94,0.1),transparent)]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-8 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl blur-lg opacity-60 group-hover:opacity-80 transition-all duration-500 transform group-hover:scale-110"></div>
              <div className="relative bg-gradient-to-br from-green-500 to-green-700 p-4 rounded-3xl shadow-xl transform group-hover:scale-105 transition-all duration-500 border border-white/20">
                <Wallet className="text-white w-8 h-8 drop-shadow-lg" />
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-green-700 to-green-600 bg-clip-text text-transparent tracking-tight">
                QuadraPay
              </h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-gray-500 font-medium">Digital Wallet Pro</p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center ml-8">
              <div className="flex bg-white/60 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg border border-white/30">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => navigate(tab.path)}
                    className={`relative px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                      getActiveTab() === tab.key
                        ? 'text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:text-green-600 hover:bg-white/70'
                    }`}
                  >
                    {getActiveTab() === tab.key && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/30"></div>
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                ))}
              </div>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={onDepositClick}
                className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-2xl font-semibold shadow-xl shadow-green-500/25 hover:shadow-2xl hover:shadow-green-500/40 transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Nạp tiền</span>
                </div>
              </button>

              <button
                onClick={onWithdrawClick}
                className="group relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-green-500/30 text-green-700 hover:text-green-800 px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:border-green-500 transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-50/0 via-green-50/50 to-green-50/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative flex items-center space-x-2">
                  <Minus className="w-5 h-5" />
                  <span>Rút tiền</span>
                </div>
              </button>
            </div>

            <div className="flex items-center space-x-1 ml-6">
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
              <button className="group flex items-center space-x-3 p-2 rounded-2xl hover:bg-white/60 transition-all duration-300"
                onClick={()=> window.location.reload()}
                title="Làm mới"
                aria-label="Refresh"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl blur opacity-60 group-hover:opacity-80 transition-all duration-300"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9H9m11 11v-5h-.581m-15.357-2A8.001 8.001 0 0019.418 15H15"
                      />
                    </svg>
                  </div>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">Làm mới</p>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <p className="text-xs text-green-600 font-medium">refresh</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:hidden pb-4">
          <div className="flex bg-white/60 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg border border-white/30">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => navigate(tab.path)}
                className={`relative flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  getActiveTab() === tab.key
                    ? 'text-white shadow-lg'
                    : 'text-gray-600 hover:text-green-600 hover:bg-white/70'
                }`}
              >
                {getActiveTab() === tab.key && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/30"></div>
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ModernWalletHeader;