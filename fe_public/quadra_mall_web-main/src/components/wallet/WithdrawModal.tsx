import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/hooks/use-toast";
import { apiRequest } from "@/utils/queryClient";
import { withdrawSchema, type WithdrawForm, type BankAccount, type WalletWithStats } from "@/shared/schema";
import { Info } from "lucide-react";

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet: WalletWithStats | null;
}

// Dữ liệu mẫu
const walletBalance = "2450000.00";
const bankAccountsData = [
  { id: 1, bankName: "Vietcombank", accountNumber: "****1234" },
  { id: 2, bankName: "Techcombank", accountNumber: "****5678" }
];

export function WithdrawModal({ open, onOpenChange, wallet }: WithdrawModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<WithdrawForm>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: "",
      bankAccountId: ""
    }
  });

  const bankAccounts = bankAccountsData;

  const withdrawMutation = useMutation({
    mutationFn: async (data: WithdrawForm) => {
      const response = await apiRequest("POST", "/api/withdraw", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Thành công",
        description: data.message || "Yêu cầu rút tiền đã được xử lý"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi rút tiền",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: WithdrawForm) => {
    withdrawMutation.mutate(data);
  };

  const formatCurrency = (value: string) => {
    const numValue = value.replace(/\D/g, '');
    return new Intl.NumberFormat('vi-VN').format(parseInt(numValue) || 0);
  };

  const handleAmountChange = (value: string) => {
    const numValue = value.replace(/\D/g, '');
    form.setValue('amount', numValue);
  };

  const formatWalletBalance = (balance: string) => {
    return new Intl.NumberFormat('vi-VN').format(parseFloat(balance)) + ' ₫';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rút tiền về ngân hàng</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số tiền rút</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Nhập số tiền"
                        value={formatCurrency(field.value)}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">₫</span>
                    </div>
                  </FormControl>
                  <p className="text-sm text-gray-500">
                    Số dư khả dụng: <span className="font-medium">{formatWalletBalance(walletBalance)}</span>
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tài khoản ngân hàng</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tài khoản ngân hàng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bankAccounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.bankName} - {account.accountNumber}
                        </SelectItem>
                      ))}
                      <SelectItem value="new">+ Thêm tài khoản mới</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert className="bg-yellow-50 border-yellow-200">
              <Info className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-800">
                <p className="font-medium">Lưu ý quan trọng:</p>
                <p>Giao dịch rút tiền sẽ được xử lý trong 1-3 ngày làm việc.</p>
              </AlertDescription>
            </Alert>

            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-yellow-500 hover:bg-yellow-600"
                disabled={withdrawMutation.isPending}
              >
                {withdrawMutation.isPending ? "Đang xử lý..." : "Rút tiền"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
