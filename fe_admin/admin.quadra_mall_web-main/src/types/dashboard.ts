export interface RevenueData {
  month: string;
  revenue: number;
  shops: number;
  users: number;
}

export interface ShopStatusData {
  name: string;
  value: number;
  color: string;
}

export interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  gradient: string;
}