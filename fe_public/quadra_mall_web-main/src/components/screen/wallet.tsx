import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ModernWalletHeader from '@/components/wallet/ModernWalletHeader';
import { DepositModal } from '@/components/wallet/DepositModal';
import { WithdrawModal } from '@/components/wallet/WithdrawModal';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchWalletData } from '@/store/Wallet/walletSlice';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function WalletPage() {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const wallet = useSelector((state: RootState) => state.wallet);

  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const params = new URLSearchParams(location.search);
  const transactionId = params.get('transactionId');
  const status = params.get('status');
  const amount = params.get('amount');

  // Hiển thị modal khi có params từ URL
  useEffect(() => {
    if (transactionId && status && amount) {
      setModalOpen(true);
    }
  }, [transactionId, status, amount]);

  const handleDepositClick = () => {
    setShowDepositModal(true);
  };

  const handleWithdrawClick = () => {
    setShowWithdrawModal(true);
  };

  const handleRefreshClick = () => {
    dispatch(fetchWalletData());
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    // Xóa params khỏi URL sau khi đóng modal
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  };

  const formatAmount = (amount: string | null) => {
    if (!amount) return '0';
    return new Intl.NumberFormat('vi-VN').format(Number(amount));
  };

  return (
    <>
      {/* Modern Payment Result Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all duration-300 scale-100">
            {/* Header với gradient */}
            <div className={`relative px-8 py-6 ${status === 'COMPLETED'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : 'bg-gradient-to-r from-red-500 to-pink-600'
              } text-white`}>
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center">
                <div className="mb-4">
                  {status === 'COMPLETED' ? (
                    <CheckCircle size={64} className="mx-auto animate-bounce" />
                  ) : (
                    <XCircle size={64} className="mx-auto animate-pulse" />
                  )}
                </div>
                <h2 className="text-2xl font-bold">
                  {status === 'COMPLETED' ? 'Nạp tiền thành công!' : 'Nạp tiền thất bại'}
                </h2>
              </div>
            </div>

            {/* Body */}
            <div className="px-8 py-6">
              {status === 'COMPLETED' ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 font-medium">Mã giao dịch:</span>
                      <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                        {transactionId}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Số tiền:</span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatAmount(amount)} ₫
                      </span>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-green-800 text-sm text-center">
                      Số dư tài khoản của bạn đã được cập nhật thành công
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-800 text-center">
                      Giao dịch không thể hoàn tất. Vui lòng kiểm tra lại thông tin và thử lại.
                    </p>
                  </div>

                  <div className="text-center text-gray-600 text-sm">
                    <p>Nếu vấn đề vẫn tiếp diễn, vui lòng liên hệ bộ phận hỗ trợ</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 pb-6 flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Đóng
              </button>

              {status === 'COMPLETED' ? (
                <button
                  onClick={() => {
                    handleCloseModal();
                    handleRefreshClick();
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Cập nhật số dư
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleCloseModal();
                    setShowDepositModal(true);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Thử lại
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
        <ModernWalletHeader
          onDepositClick={handleDepositClick}
          onWithdrawClick={handleWithdrawClick}
          onRefreshClick={handleRefreshClick}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>

        <DepositModal open={showDepositModal} onOpenChange={setShowDepositModal} />
        <WithdrawModal
          open={showWithdrawModal}
          onOpenChange={setShowWithdrawModal}
          wallet={null}
        />
      </div>
    </>
  );
}