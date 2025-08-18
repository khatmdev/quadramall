import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWalletData } from '@/store/Wallet/walletSlice';
import { RootState, AppDispatch } from '@/store';
import { ModernBalanceOverview } from './BalanceOverview';
import { QuickActions } from './QuickActions';
import { TransactionHistory } from './TransactionHistory';

export function WalletDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const wallet = useSelector((state: RootState) => state.wallet);

  useEffect(() => {
    dispatch(fetchWalletData());
  }, [dispatch]);


  if (wallet.loading) {
    return <div>Đang tải...</div>;
  }

  if (wallet.error) {
    return <div>Lỗi: {wallet.error}</div>;
  }

  const handleDeposit = () => {
    console.log('Deposit clicked');
  };

  const handleWithdraw = () => {
    console.log('Withdraw clicked');
  };

  const handleTransfer = () => {
    console.log('Transfer clicked');
  };

  const handleHistory = () => {
    console.log('History clicked');
  };

  return (
    <>
      <ModernBalanceOverview />
      <QuickActions
        onDepositClick={handleDeposit}
        onWithdrawClick={handleWithdraw}
        onTransferClick={handleTransfer}
        onHistoryClick={handleHistory}
      />
      <TransactionHistory />
    </>
  );
}