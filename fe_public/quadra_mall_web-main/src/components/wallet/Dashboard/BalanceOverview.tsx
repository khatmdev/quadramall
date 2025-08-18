import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Wallet, TrendingUp, TrendingDown, Shield, Sparkles } from 'lucide-react';

export function ModernBalanceOverview() {
  const { balance, currentMonthDeposit, previousMonthDeposit, currentMonthExpense, previousMonthExpense, updatedAt } = useSelector((state: RootState) => state.wallet);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  };

  const incomeChange = calculatePercentageChange(currentMonthDeposit, previousMonthDeposit);
  const expenseChange = calculatePercentageChange(currentMonthExpense, previousMonthExpense);

  const incomeChangeText = previousMonthDeposit === 0 && currentMonthDeposit > 0 
    ? 'Mới' 
    : `${incomeChange > 0 ? '+' : ''}${incomeChange.toFixed(1)}%`;
  const expenseChangeText = previousMonthExpense === 0 && currentMonthExpense > 0 
    ? 'Mới' 
    : `${expenseChange > 0 ? '+' : ''}${expenseChange.toFixed(1)}%`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Main Balance Card */}
      <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-green-800 rounded-3xl p-8 text-white shadow-2xl shadow-green-500/25">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10"></div>
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-green-300/20 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-green-200" />
                <p className="text-green-100 text-sm font-medium tracking-wide">Số dư khả dụng</p>
              </div>
              <h2 className="text-4xl font-black tracking-tight drop-shadow-lg">
                {formatCurrency(balance)}
              </h2>
              <p className="text-green-200 text-sm">Cập nhật {new Date(updatedAt).toLocaleString('vi-VN')}</p>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-white/30 rounded-2xl blur-lg group-hover:bg-white/40 transition-all duration-300"></div>
              <div className="relative bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/30 group-hover:scale-105 transition-all duration-300">
                <Wallet className="w-8 h-8 drop-shadow-lg" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Đã xác thực</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Bảo mật cao</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="space-y-5">
        {/* Income Card */}
        <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg shadow-green-500/10 border border-green-100/50 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-green-500/5 rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-gray-500 text-sm font-medium">Tiền nạp tháng này</p>
              <p className="text-2xl font-bold text-green-600 tracking-tight">
                +{formatCurrency(currentMonthDeposit)}
              </p>
              <div className="flex items-center space-x-1">
                <div className={`w-1 h-1 rounded-full ${incomeChange > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className={`text-xs font-medium ${incomeChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {incomeChangeText} so với tháng trước
                </p>
              </div>
            </div>
            <div className="relative group/icon">
              <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur-lg group-hover/icon:bg-green-500/30 transition-all duration-300"></div>
              <div className="relative bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl group-hover/icon:scale-110 transition-all duration-300">
                <TrendingUp className="text-green-600 w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Expense Card */}
        <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg shadow-red-500/10 border border-red-100/50 hover:shadow-xl hover:shadow-red-500/20 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-red-500/5 rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-gray-500 text-sm font-medium">Chi tiêu tháng này</p>
              <p className="text-2xl font-bold text-red-600 tracking-tight">
                -{formatCurrency(currentMonthExpense)}
              </p>
              <div className="flex items-center space-x-1">
                <div className={`w-1 h-1 rounded-full ${expenseChange < 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className={`text-xs font-medium ${expenseChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {expenseChangeText} so với tháng trước
                </p>
              </div>
            </div>
            <div className="relative group/icon">
              <div className="absolute inset-0 bg-red-500/20 rounded-2xl blur-lg group-hover/icon:bg-red-500/30 transition-all duration-300"></div>
              <div className="relative bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-2xl group-hover/icon:scale-110 transition-all duration-300">
                <TrendingDown className="text-red-600 w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}