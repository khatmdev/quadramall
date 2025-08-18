import { useState } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingCart, Clock, Gift, ArrowLeftRight, Minus, Search, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Transaction } from "@/types/Wallet/transaction";



export function TransactionHistory() {
  const transactionHistory = useSelector((state: RootState) => state.wallet.transactionHistory) as Transaction[];
  const [filter, setFilter] = useState("all");

  const filteredTransactions =
    filter === "all" ? transactionHistory : transactionHistory.filter((t: Transaction) => t.type === filter);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDisplayAmount = (transaction: any) => {
    const amount = transaction.amount;
    switch (transaction.type) {
      case "TOP_UP":
      case "bonus":
        return `+${formatCurrency(amount)}`;
      case "PAYMENT":
      case "WITHDRAWAL":
      case "transfer":
        return `-${formatCurrency(amount)}`;
      default:
        return formatCurrency(amount);
    }
  };

  const getTransactionIcon = (type: string) => {
    const iconClasses = "w-5 h-5";
    switch (type) {
      case "TOP_UP":
        return <Plus className={`${iconClasses} text-emerald-500`} />;
      case "WITHDRAWAL":
        return <Minus className={`${iconClasses} text-amber-500`} />;
      case "PAYMENT":
        return <ShoppingCart className={`${iconClasses} text-blue-500`} />;
      case "transfer":
        return <ArrowLeftRight className={`${iconClasses} text-indigo-500`} />;
      case "bonus":
        return <Gift className={`${iconClasses} text-pink-500`} />;
      default:
        return <Clock className={`${iconClasses} text-gray-500`} />;
    }
  };

  const getIconBackground = (type: string) => {
    switch (type) {
      case "TOP_UP":
        return "bg-gradient-to-br from-emerald-100 to-emerald-200";
      case "WITHDRAWAL":
        return "bg-gradient-to-br from-amber-100 to-amber-200";
      case "PAYMENT":
        return "bg-gradient-to-br from-blue-100 to-blue-200";
      case "transfer":
        return "bg-gradient-to-br from-indigo-100 to-indigo-200";
      case "bonus":
        return "bg-gradient-to-br from-pink-100 to-pink-200";
      default:
        return "bg-gradient-to-br from-gray-100 to-gray-200";
    }
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "completed":
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-sm">
            Thành công
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 shadow-sm">
            Đang xử lý
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-sm">
            Thất bại
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 mt-8">
      {/* Header Card with Stats */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-xl border-0 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Lịch sử giao dịch</h3>
                <p className="text-gray-600"> {filteredTransactions.length} giao dịch gần đây</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/transactions" className="text-blue">Xem tất cả</Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Transaction Cards */}
      <div className="space-y-3">
        {filteredTransactions.map((transaction, index) => (
          <Card 
            key={index} 
            className="group bg-white shadow-lg hover:shadow-xl border-0 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${getIconBackground(transaction.type)} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                      {transaction.description || 'Không có mô tả'}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(transaction.updateAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-lg font-bold flex items-center gap-1 ${
                      ['TOP_UP', 'bonus'].includes(transaction.type) ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {['TOP_UP', 'bonus'].includes(transaction.type) ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {getDisplayAmount(transaction)}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTransactions.length === 0 && (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-0 shadow-lg">
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Không có giao dịch nào</h3>
            <p className="text-gray-500">Thay đổi bộ lọc để xem các giao dịch khác</p>
          </div>
        </Card>
      )}
    </div>
  );
}