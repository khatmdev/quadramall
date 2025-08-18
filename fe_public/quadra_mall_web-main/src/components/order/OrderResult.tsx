import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, ShoppingBag, ArrowRight, Loader2, Sparkles, Home, Clock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const VNPayOrderResult: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [orderIds, setOrderIds] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const orderIdsParam = searchParams.get('orderIds');
    const statusParam = searchParams.get('status');

    if (orderIdsParam && statusParam) {
      setOrderIds(orderIdsParam);
      setStatus(statusParam);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setShowContent(true), 200);
    }, 1500);

    return () => clearTimeout(timer);
  }, [location.search]);

  const handleViewOrders = () => {
    if (orderIds) {
      navigate(`/orders/${orderIds}`);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const isSuccess = status === 'COMPLETED';
  const isFailed = status === 'FAILED';
  const isCOD = status === 'COD';

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            >
              <Sparkles className="w-4 h-4 text-white/30" />
            </div>
          ))}
        </div>
        
        <div className="relative z-10 text-center">
          <div className="mb-6">
            <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Đang xử lý kết quả</h2>
              <p className="text-white/80 text-md">Vui lòng chờ trong giây lát...</p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 transition-all duration-1000 ${
      isSuccess ? 'bg-gradient-to-br from-green-400 via-green-500 to-green-600' : 
      isFailed ? 'bg-gradient-to-br from-red-400 via-pink-500 to-rose-600' : 
      isCOD ? 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600' :
      'bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-600'
    }`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" 
             style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse" 
             style={{ animationDelay: '2s' }} />
        
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <Sparkles className="w-4 h-4 text-white/40" />
          </div>
        ))}
      </div>

      <div className="relative z-10 h-full flex items-center justify-center p-4">
        <div className={`max-w-xl w-full text-center transform transition-all duration-1000 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="mb-6">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 transform transition-all duration-1000 ${
              showContent ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
            }`}>
              {isSuccess && <CheckCircle className="w-12 h-12 text-white animate-pulse" />}
              {isFailed && <XCircle className="w-12 h-12 text-white animate-pulse" />}
              {isCOD && <Clock className="w-12 h-12 text-white animate-pulse" />}
              {!isSuccess && !isFailed && !isCOD && <ShoppingBag className="w-12 h-12 text-white animate-pulse" />}
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
              {isSuccess && 'Thanh toán thành công!'}
              {isFailed && 'Thanh toán thất bại!'}
              {isCOD && 'Đặt hàng thành công!'}
              {!isSuccess && !isFailed && !isCOD && 'Trạng thái không xác định'}
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium">
              {isSuccess && 'Đơn hàng của bạn đã được xử lý thành công'}
              {isFailed && 'Có lỗi xảy ra trong quá trình thanh toán'}
              {isCOD && 'Đơn hàng đang được xử lý'}
              {!isSuccess && !isFailed && !isCOD && 'Vui lòng kiểm tra lại thông tin đơn hàng'}
            </p>
            {isCOD && (
              <p className="text-md text-white/80 mt-2">
                Chờ người bán xác nhận
              </p>
            )}
          </div>

          {orderIds && (
            <div className={`mb-6 transform transition-all duration-1000 delay-300 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Thông tin đơn hàng</h3>
                <div className="space-y-3">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
                    <span className="text-md text-white/80">Mã đơn hàng:</span>
                    <span className="text-md font-bold text-white bg-white/20 px-3 py-1 rounded-full">
                      #{orderIds}
                    </span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
                    <span className="text-md text-white/80">Trạng thái:</span>
                    <span className={`text-md font-bold px-4 py-1 rounded-full ${
                      isSuccess ? 'bg-green-500/30 text-green-100 border border-green-400/50' : 
                      isFailed ? 'bg-red-500/30 text-red-100 border border-red-400/50' : 
                      isCOD ? 'bg-blue-500/30 text-blue-100 border border-blue-400/50' :
                      'bg-gray-500/30 text-gray-100 border border-gray-400/50'
                    }`}>
                      {isSuccess ? 'Thành công' : isFailed ? 'Thất bại' : isCOD ? 'Đang xử lý' : 'Không xác định'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={`space-y-3 transform transition-all duration-1000 delay-500 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {(isSuccess || isCOD) && orderIds && (
              <button
                onClick={handleViewOrders}
                className="w-full max-w-sm mx-auto bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group border border-white/30 shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="text-md">Xem thông tin đơn hàng</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            
            <button
              onClick={handleBackToHome}
              className="w-full max-w-sm mx-auto bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group border border-white/20 shadow-lg hover:shadow-xl hover:scale-105 transform"
            >
              <Home className="w-5 h-5" />
              <span className="text-md">Quay về trang chủ</span>
            </button>
          </div>

          {isFailed && (
            <div className={`mt-6 transform transition-all duration-1000 delay-700 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="bg-red-900/30 backdrop-blur-md border border-red-400/50 rounded-xl p-4 shadow-xl">
                <h4 className="text-lg font-bold text-red-100 mb-2">Lỗi thanh toán</h4>
                <p className="text-red-200 text-md">
                  Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
                </p>
              </div>
            </div>
          )}

          {isCOD && (
            <div className={`mt-6 transform transition-all duration-1000 delay-700 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="bg-blue-900/30 backdrop-blur-md border border-blue-400/50 rounded-xl p-4 shadow-xl">
                <h4 className="text-lg font-bold text-blue-100 mb-2">Thanh toán khi nhận hàng</h4>
                <p className="text-blue-200 text-md">
                  Bạn sẽ thanh toán khi nhận được hàng. Người bán sẽ xác nhận đơn hàng trong thời gian sớm nhất.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VNPayOrderResult;