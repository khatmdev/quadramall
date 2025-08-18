export interface Transaction {
  id: number;
  type: string;
  status: string;
  description: string | null;
  amount: number;
  updateAt: string;
  [key: string]: any;
}
