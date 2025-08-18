import React from 'react';
import { BarChart2, CheckCircle, Lock, AlertTriangle, TrendingUp, XCircle } from 'lucide-react';

interface Stats {
  activeShops: number;
  lockedShops: number;
  reportedShops: number;
  inactiveShops: number; // Thêm inactiveShops
}

interface TabsProps {
  activeTab: 'overview' | 'active' | 'locked' | 'inactive' | 'reported' | 'analytics';
  setActiveTab: (tab: 'overview' | 'active' | 'locked' | 'inactive' | 'reported' | 'analytics') => void;
  stats: Stats;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab, stats }) => {
  return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Tổng quan', icon: BarChart2 },
              { id: 'active', label: 'Hoạt động', icon: CheckCircle, count: stats.activeShops },
              { id: 'locked', label: 'Bị khóa', icon: Lock, count: stats.lockedShops },
              { id: 'inactive', label: 'Không hoạt động', icon: XCircle, count: stats.inactiveShops },
              { id: 'reported', label: 'Vi phạm', icon: AlertTriangle, count: stats.reportedShops },
              { id: 'analytics', label: 'Phân tích', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                  <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                          activeTab === tab.id
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <Icon size={16} className="mr-2" />
                    {tab.label}
                    {tab.count !== undefined && (
                        <span className="ml-2 bg-gray-100 text-gray-600 rounded-full px-2 py-1 text-xs">
                    {tab.count}
                  </span>
                    )}
                  </button>
              );
            })}
          </nav>
        </div>
      </div>
  );
};

export default Tabs;