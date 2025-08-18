import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchWalletData } from '@/store/Wallet/walletSlice';
import { AppDispatch } from '@/store';

export function DepositResult() {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const params = new URLSearchParams(location.search);
  const transactionId = params.get('transactionId');
  const status = params.get('status');
  const amount = params.get('amount');

  useEffect(() => {
    if (status == 'COMPLETED') {
      dispatch(fetchWalletData()); 
    }
  }, [status, dispatch]);

  return (
    <div className="text-center mt-10">
      {status == 'COMPLETED' ? (
        <div>
          <h2 className="text-2xl font-bold text-green-600">Nạp tiền thành công!</h2>
          <h3>+{amount}VND</h3>
          <p className="mt-4">Giao dịch ID: {transactionId}</p>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold text-red-600">Nạp tiền thất bại</h2>
          <p className="mt-4">Vui lòng thử lại sau</p>
        </div>
      )}
    </div>
  );
}