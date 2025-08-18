import { Transaction } from "@/shared/schema";
export interface WalletState {
  balance: number;
  updatedAt: string;
  currentMonthDeposit: number;
  previousMonthDeposit: number;
  currentMonthExpense: number;
  previousMonthExpense: number;
  transactionHistory: Transaction[];
  loading: boolean;
  error: string | null;
}