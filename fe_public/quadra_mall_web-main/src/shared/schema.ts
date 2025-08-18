import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull().default("0.00"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull(),
  type: text("type").notNull(), // 'deposit', 'withdraw', 'transfer', 'purchase', 'bonus'
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("completed"), // 'pending', 'completed', 'failed'
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  accountHolder: text("account_holder").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWalletSchema = createInsertSchema(wallets).pick({
  userId: true,
  balance: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  walletId: true,
  type: true,
  amount: true,
  description: true,
  status: true,
  metadata: true,
});

export const insertBankAccountSchema = createInsertSchema(bankAccounts).pick({
  userId: true,
  bankName: true,
  accountNumber: true,
  accountHolder: true,
});

// Deposit/Withdraw schemas
export const depositSchema = z.object({
  amount: z.string().min(1, "Vui lòng nhập số tiền"),
  paymentMethod: z.enum(["bank", "momo"], { required_error: "Vui lòng chọn phương thức thanh toán" }),
});

export const withdrawSchema = z.object({
  amount: z.string().min(1, "Vui lòng nhập số tiền"),
  bankAccountId: z.string().min(1, "Vui lòng chọn tài khoản ngân hàng"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;
export type BankAccount = typeof bankAccounts.$inferSelect;

export type DepositForm = z.infer<typeof depositSchema>;
export type WithdrawForm = z.infer<typeof withdrawSchema>;

// Extended types for API responses
export type WalletWithStats = Wallet & {
  monthlyIncome: string;
  monthlyExpense: string;
  transactionCount: number;
};

export type TransactionWithDetails = Transaction & {
  walletId: number;
};
