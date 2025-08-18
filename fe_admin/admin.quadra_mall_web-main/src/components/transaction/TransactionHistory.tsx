import { useState, useEffect } from 'react';
import { Eye, Download, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import TransactionDetailModal from './TransactionDetailModal'; // Component modal chi tiết

interface Transaction {
  id: number;
  type: 'top-up' | 'withdrawal' | 'payment' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  description?: string;
    source: 'wallet' | 'bank' | 'order';
  orderId?: number;
  walletId?: number;
  bankAccountId?: number;
  transactionCode?: string;
  userId?: number;
}

interface OrderDetail {
  id: number;
  products: { name: string; price: number; imageUrl: string }[];
  voucherDiscount: number;
  shippingFee: number;
}

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
    status: '',
    userId: '',
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Mock data (thay bằng API sau)
  const mockUsers = [
    { id: 1, email: 'user1@email.com', full_name: 'Nguyễn Văn A' },
    { id: 2, email: 'user2@email.com', full_name: 'Trần Thị B' },
  ];

  const mockWallets = [
    { id: 1, user_id: 1, balance: 1000000, currency: 'VND', created_at: '2025-06-01', updated_at: '2025-06-20' },
    { id: 2, user_id: 2, balance: 500000, currency: 'VND', created_at: '2025-06-02', updated_at: '2025-06-19' },
  ];

  const mockBankAccounts = [
    { id: 1, user_id: 1, bank_name: 'Techcombank', account_number: '1234567890', is_verified: true, created_at: '2025-06-01', updated_at: '2025-06-20' },
    { id: 2, user_id: 2, bank_name: 'Vietcombank', account_number: '0987654321', is_verified: false, created_at: '2025-06-03', updated_at: '2025-06-18' },
  ];

  const mockOrders = [
    { id: 1, customer_id: 1, store_id: 1, status: 'completed', shipping_method: 'standard', payment_method: 'wallet', total_amount: 1200000, created_at: '2025-06-01', updated_at: '2025-06-01', products: [{ name: 'Áo thun', price: 1000000, imageUrl: 'https://via.placeholder.com/50?text=Áo+thun' }], voucherDiscount: 100000, shippingFee: 100000 },
    { id: 2, customer_id: 2, store_id: 2, status: 'pending', shipping_method: 'express', payment_method: 'bank', total_amount: 2200000, created_at: '2025-06-02', updated_at: '2025-06-02', products: [{ name: 'Điện thoại', price: 2000000, imageUrl: 'https://via.placeholder.com/50?text=Điện+thoại' }], voucherDiscount: 0, shippingFee: 200000 },
    { id: 3, customer_id: 1, store_id: 3, status: 'cancelled', shipping_method: 'standard', payment_method: 'wallet', total_amount: 600000, created_at: '2025-06-03', updated_at: '2025-06-03', products: [{ name: 'Quần jeans', price: 500000, imageUrl: 'https://via.placeholder.com/50?text=Quần+jeans' }], voucherDiscount: 50000, shippingFee: 50000 },
  ];

  const mockPaymentTransactions = [
    { id: 1, order_id: 1, gateway_name: 'Wallet', method: 'balance', type: 'payment', status: 'completed', amount: 1200000, currency_code: 'VND', transaction_code: 'TXN001', paid_at: '2025-06-01', created_at: '2025-06-01', updated_at: '2025-06-01' },
    { id: 2, order_id: 2, gateway_name: 'Bank', method: 'transfer', type: 'payment', status: 'pending', amount: 2200000, currency_code: 'VND', transaction_code: 'TXN002', paid_at: null, created_at: '2025-06-02', updated_at: '2025-06-02' },
    { id: 3, order_id: 3, gateway_name: 'Wallet', method: 'balance', type: 'refund', status: 'completed', amount: 600000, currency_code: 'VND', transaction_code: 'TXN003', paid_at: '2025-06-03', created_at: '2025-06-03', updated_at: '2025-06-03' },
  ];

  const mockWalletTransactions = [
    { id: 1, wallet_id: 1, type: 'top-up', amount: 500000, status: 'completed', description: 'Nạp tiền qua ngân hàng', created_at: '2025-06-10', updated_at: '2025-06-10', reference_id: 1, transfer_id: null, user_id: 1 },
    { id: 2, wallet_id: 2, type: 'withdrawal', amount: 200000, status: 'pending', description: 'Rút tiền về tài khoản', created_at: '2025-06-15', updated_at: '2025-06-15', reference_id: null, transfer_id: 2, user_id: 2 },
    { id: 3, wallet_id: 1, type: 'payment', amount: 300000, status: 'failed', description: 'Thanh toán đơn hàng thất bại', created_at: '2025-06-16', updated_at: '2025-06-16', reference_id: 2, transfer_id: null, user_id: 1 },
  ];

  const mockBankTransactionLogs = [
    { id: 1, wallet_transaction_id: 1, bank_account_id: 1, amount: 500000, status: 'completed', created_at: '2025-06-10', updated_at: '2025-06-10', user_id: 1 },
    { id: 2, wallet_transaction_id: 2, bank_account_id: 2, amount: 200000, status: 'pending', created_at: '2025-06-15', updated_at: '2025-06-15', user_id: 2 },
    { id: 3, wallet_transaction_id: 3, bank_account_id: 1, amount: 300000, status: 'failed', created_at: '2025-06-16', updated_at: '2025-06-16', user_id: 1 },
  ];

  useEffect(() => {
    // Giả lập fetch dữ liệu từ API
    setTimeout(() => {
      const allTransactions: Transaction[] = [
        ...mockWalletTransactions.map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          status: t.status,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
          description: t.description,
          source: 'wallet' as const,
          walletId: t.wallet_id,
          userId: t.user_id,
        })),
        ...mockBankTransactionLogs.map(t => {
          const wt = mockWalletTransactions.find(wt => wt.id === t.wallet_transaction_id);
          return {
            id: t.id,
            type: wt ? wt.type : 'top-up',
            amount: t.amount,
            status: t.status,
            createdAt: t.created_at,
            updatedAt: t.updated_at,
            description: `Giao dịch ngân hàng ${wt ? 'rút tiền' : 'nạp tiền'}`,
            source: 'bank' as const,
            bankAccountId: t.bank_account_id,
            userId: t.user_id,
          };
        }),
        ...mockPaymentTransactions.map(pt => {
          const order = mockOrders.find(o => o.id === pt.order_id);
          return {
            id: pt.id,
            type: pt.type,
            amount: pt.amount,
            status: pt.status,
            createdAt: pt.created_at,
            updatedAt: pt.updated_at,
            description: `Thanh toán đơn hàng #${pt.order_id}`,
            source: 'order' as const,
            orderId: pt.order_id,
            transactionCode: pt.transaction_code,
            userId: order?.customer_id,
          };
        }),
      ];
      setTransactions(allTransactions);
      setFilteredTransactions(allTransactions);
      setLoading(false);
    }, 1000);
  }, []);

  // Áp dụng bộ lọc
  useEffect(() => {
    let result = [...transactions];
    if (filters.startDate && filters.endDate) {
      result = result.filter(t => {
        const transactionDate = new Date(t.createdAt);
        return transactionDate >= new Date(filters.startDate) && transactionDate <= new Date(filters.endDate);
      });
    }
    if (filters.type) result = result.filter(t => t.type === filters.type);
    if (filters.status) result = result.filter(t => t.status === filters.status);
    if (filters.userId) result = result.filter(t => t.userId === Number(filters.userId));
    setFilteredTransactions(result);
  }, [filters, transactions]);

  // Xuất Excel
  const exportToExcel = () => {
    const data = filteredTransactions.map(t => ({
      'ID Giao dịch': t.id,
      'Loại': t.type,
      'Số tiền': `${t.type === 'top-up' || t.type === 'refund' ? '+' : '-'}${t.amount.toLocaleString()} VND`,
      'Trạng thái': t.status === 'completed' ? 'Hoàn thành' : t.status === 'pending' ? 'Chờ xử lý' : t.status === 'failed' ? 'Thất bại' : 'Hủy',
      'Thời gian': t.createdAt,
      'Mô tả': t.description || '',
      'Nguồn': t.source,
      'Mã giao dịch': t.transactionCode || '',
      'Mã người dùng': t.userId || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'LichSuGiaoDich');
    XLSX.writeFile(wb, 'LichSuGiaoDich.xlsx');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={48} className="mx-auto text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Bộ lọc */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Bộ lọc lịch sử giao dịch</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Từ ngày</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Đến ngày</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Loại</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="">Tất cả</option>
              <option value="top-up">Nạp tiền</option>
              <option value="withdrawal">Rút tiền</option>
              <option value="payment">Thanh toán</option>
              <option value="refund">Hoàn tiền</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="failed">Thất bại</option>
              <option value="cancelled">Hủy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mã người dùng</label>
            <input
              type="number"
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              placeholder="Nhập mã người dùng"
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      {/* Bảng lịch sử giao dịch */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Lịch sử giao dịch</h3>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <Download size={16} className="mr-2" />
            Xuất Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nguồn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <p className="text-gray-500 text-lg">Không có giao dịch nào</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.type === 'top-up' || transaction.type === 'refund' ? '+' : '-'}
                      {transaction.amount.toLocaleString()} VND
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.status === 'completed' ? 'Hoàn thành' : transaction.status === 'pending' ? 'Chờ xử lý' : transaction.status === 'failed' ? 'Thất bại' : 'Hủy'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.createdAt}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.source}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal chi tiết */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
};

export default TransactionHistory;