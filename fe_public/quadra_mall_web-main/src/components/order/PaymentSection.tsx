import  { useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchWalletData } from '@/store/Wallet/walletSlice';
import { formatCurrency } from '@/utils/utils';

interface PaymentSectionProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ paymentMethod, setPaymentMethod }) => {
  const balance = useSelector((state: RootState) => state.wallet.balance);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchWalletData());
  }, [balance]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <CreditCard className="h-5 w-5 text-green-600" />
        <h2 className="text-lg font-semibold text-gray-800">Phương thức thanh toán</h2>
      </div>
      <div className="space-y-3">
        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="radio"
            name="payment"
            value="COD"
            checked={paymentMethod === 'COD'}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800">Thanh toán khi nhận hàng</p>
            <p className="text-sm text-gray-600">COD - Tiền mặt</p>
          </div>
        </label>
        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="radio"
            name="payment"
            value="ONLINE"
            checked={paymentMethod === 'ONLINE'}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800">Thanh toán online</p>
            <p className="text-sm text-gray-600">Cổng thanh toán VNPay</p>
          </div>
        </label>
        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="radio"
            name="payment"
            value="WALLET"
            checked={paymentMethod === 'WALLET'}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800">Ví QuadraPay  - {formatCurrency(balance)}</p>
            <p className="text-sm text-gray-600">Cổng thanh toán QuadraPay</p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default PaymentSection;