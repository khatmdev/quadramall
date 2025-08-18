// src/components/dashboard/StatsCard.tsx
import React from 'react';
import type { StatsCardProps } from '@/types/dashboard';

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon: Icon, gradient }) => {
  return (
    <div className={`${gradient} p-6 rounded-xl text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-white/80 text-sm">{change}</p>
        </div>
        <Icon size={40} className="text-white/60" />
      </div>
    </div>
  );
};

export default StatsCard;