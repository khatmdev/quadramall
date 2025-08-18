import { useDispatch, useSelector } from 'react-redux';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Plus, Wallet, ArrowRight, Clock, CheckCircle, X, Info, AlertCircle, TrendingUp } from "lucide-react";
import { AppDispatch, RootState } from '@/store';
import { depositMoney, resetDeposit, setAmount, setSelectedMethod, setStep } from '@/store/Wallet/walletSlice';
import { OrderRequest } from '@/types/Order/orderRequest';

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderRequest?: OrderRequest | null;
}

interface PaymentMethod {
  id: string;
  name: string;
  image: string | null;
  color: string;
  bgColor: string;
  description: string;
  processingTime: string;
  fee: string;
}

export function DepositModal({ open, onOpenChange, orderRequest }: DepositModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { deposit } = useSelector((state: RootState) => state.wallet);
  const { selectedMethod, amount, step, isProcessing, error } = deposit;
  const MIN_AMOUNT = 50000;
  const MAX_AMOUNT = 100000000;

  const paymentMethods: PaymentMethod[] = [
    {
      id: "vnpay",
      name: "VNPay",
      image: "https://res.cloudinary.com/dy5ic99dp/image/upload/v1748914654/vnpaywebp_mrrxdb.webp",
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-100 to-blue-200",
      description: "Thanh toán qua ví điện tử VNPay",
      processingTime: "Tức thì",
      fee: "Miễn phí"
    },
    {
      id: "bank",
      name: "Ngân Hàng",
      image: "https://res.cloudinary.com/dy5ic99dp/image/upload/v1751551203/png-clipart-credit-card-computer-icons-payment-bank-credit-card-angle-text_aqze3f.png",
      color: "text-emerald-600",
      bgColor: "bg-gradient-to-br from-emerald-100 to-emerald-200",
      description: "Chuyển khoản ngân hàng trực tiếp",
      processingTime: "5-15 phút",
      fee: "Miễn phí"
    }
  ];

  const formatCurrency = (value: string) => {
    const numValue = value.replace(/\D/g, '');
    return new Intl.NumberFormat('vi-VN').format(parseInt(numValue) || 0);
  };

  const handleAmountChange = (value: string) => {
    const numValue = value.replace(/\D/g, '');
    dispatch(setAmount(numValue));
  };

  const quickAmounts = ["100000", "500000", "1000000", "2000000"];

  const getAmountValidation = () => {
    const numAmount = parseInt(amount) || 0;
    
    if (!amount || numAmount === 0) {
      return { isValid: false, message: "Vui lòng nhập số tiền", type: "info" };
    }
    
    if (numAmount < MIN_AMOUNT) {
      return { 
        isValid: false, 
        message: `Số tiền tối thiểu là ${formatCurrency(MIN_AMOUNT.toString())} ₫`, 
        type: "error" 
      };
    }
    
    if (numAmount > MAX_AMOUNT) {
      return { 
        isValid: false, 
        message: `Số tiền tối đa là ${formatCurrency(MAX_AMOUNT.toString())} ₫`, 
        type: "error" 
      };
    }
    
    return { isValid: true, message: "Số tiền hợp lệ", type: "success" };
  };

  const validation = getAmountValidation();

  const handleSubmit = () => {
    if (!selectedMethod || !amount || !validation.isValid) return;
    dispatch(depositMoney({ paymentMethod: selectedMethod, amount, orderRequest: orderRequest ?? undefined }));
  };

  const handleClose = () => {
    dispatch(resetDeposit());
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg bg-white shadow-2xl border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{orderRequest ? 'Nạp tiền để thanh toán đơn hàng' : 'Nạp tiền vào ví'}</h2>
                <p className="text-blue-100 text-sm">{orderRequest ? 'Hoàn tất thanh toán đơn hàng của bạn' : 'Chọn phương thức và nhập số tiền'}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Chọn phương thức thanh toán
                </h3>
                <p className="text-gray-600 text-sm">
                  Lựa chọn phương thức phù hợp với bạn
                </p>
              </div>

              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-all duration-300 border-2 ${
                      selectedMethod === method.id
                        ? "border-blue-500 shadow-lg transform scale-[1.02] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                    onClick={() => dispatch(setSelectedMethod(method.id))}
                  >
                    <div className="p-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl ${method.bgColor} flex items-center justify-center shadow-sm`}>
                          <img 
                            src={method.image ?? ''} 
                            alt={method.name}
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-800 text-lg">{method.name}</h4>
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              {method.fee}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{method.processingTime}</span>
                          </div>
                        </div>

                        {selectedMethod === method.id && (
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => dispatch(setStep(2))}
                  disabled={!selectedMethod}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-8 py-3 text-base font-semibold"
                >
                  Tiếp tục
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Nhập số tiền cần nạp
                </h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Info className="w-4 h-4" />
                    <span>Giới hạn: <strong>{formatCurrency(MIN_AMOUNT.toString())} ₫</strong> - <strong>{formatCurrency(MAX_AMOUNT.toString())} ₫</strong></span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Nhập số tiền cần nạp"
                      value={formatCurrency(amount)}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl font-semibold transition-all ${
                        validation.type === 'error' 
                          ? 'border-red-300 bg-red-50' 
                          : validation.type === 'success' 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-gray-300'
                      }`}
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-lg">
                      ₫
                    </span>
                  </div>
                  
                  {amount && (
                    <div className={`text-sm flex items-center gap-2 ${
                      validation.type === 'error' ? 'text-red-600' : 
                      validation.type === 'success' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {validation.type === 'error' && <AlertCircle className="w-4 h-4" />}
                      {validation.type === 'success' && <CheckCircle className="w-4 h-4" />}
                      <span>{validation.message}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>Các mức nạp phổ biến:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {quickAmounts.map((quickAmount) => (
                      <Button
                        key={quickAmount}
                        variant="outline"
                        onClick={() => dispatch(setAmount(quickAmount))}
                        className="py-3 text-base hover:bg-blue-50 hover:border-blue-300 transition-all"
                      >
                        {formatCurrency(quickAmount)} ₫
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Info className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-gray-800">Thông tin thanh toán</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Phương thức:</span>
                      <span className="font-semibold text-gray-800">
                        {paymentMethods.find(m => m.id === selectedMethod)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Phí giao dịch:</span>
                      <span className="font-semibold text-green-600">Miễn phí</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Thời gian xử lý:</span>
                      <span className="font-semibold text-blue-600">
                        {paymentMethods.find(m => m.id === selectedMethod)?.processingTime}
                      </span>
                    </div>
                    {validation.isValid && (
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Tổng tiền:</span>
                          <span className="font-bold text-xl text-blue-600">
                            {formatCurrency(amount)} ₫
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => dispatch(setStep(1))}
                  className="flex-1 py-3 text-base"
                >
                  Quay lại
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!validation.isValid || isProcessing}
                  className="flex-1 py-3 text-base font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
                >
                  {isProcessing ? "Đang xử lý..." : orderRequest ? "Nạp và thanh toán" : "Nạp tiền"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}