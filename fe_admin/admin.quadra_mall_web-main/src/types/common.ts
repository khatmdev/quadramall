// src/types/common.ts
export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

export interface Notification_ {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}