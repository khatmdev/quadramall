import { useEffect, useRef, useState } from 'react';
import { Package } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { api } from '@/main';
import { setCheckoutData, clearCheckoutData, createOrder } from '@/store/Order/OrderSlice';
import { fetchAddressesDefault } from '@/store/Address/AddressSile';
import AddressSection from './AddressSection';
import PaymentSection from './PaymentSection';
import ShippingSection from './ShippingSection';
import OrderSection from './OrderSection';
import OrderSummary from './OrderSummary';
import Swal from 'sweetalert2';
import { Address, DiscountCodeDTO } from '@/types/Order/interface';
import { OrderRequest } from '@/types/Order/orderRequest';
import { formatCurrency, getTotalAmount, getTotalShipping } from '@/utils/utils';
import { DepositModal } from '../wallet/DepositModal';
import { setAmount } from '@/store/Wallet/walletSlice';

const CheckoutPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedItems, checkoutData, loading: orderLoading, error: orderError } = useSelector((state: RootState) => state.order);
  const { defaultAddress } = useSelector((state: RootState) => state.address);
  const { balance } = useSelector((state: RootState) => state.wallet);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('COD');
  const [shippingMethod, setShippingMethod] = useState<string>('STANDARD');
  const [selectedVouchers, setSelectedVouchers] = useState<{ [storeId: number]: DiscountCodeDTO | null }>({});
  const [selectedNotes, setSelectedNotes] = useState<{ [storeId: number]: string }>({});
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);
  const [orderRequestForDeposit, setOrderRequestForDeposit] = useState<OrderRequest | null>(null);

  useEffect(() => {
    dispatch(fetchAddressesDefault());
  }, [dispatch]);

  useEffect(() => {
    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
    }
  }, [defaultAddress]);

  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (selectedItems.length > 0 && !isFetchingRef.current) {
      isFetchingRef.current = true;
      const fetchCheckoutData = async () => {
        try {
          setLoading(true);
          setError(null);
          const selectedItemIds = selectedItems.map((item: any) => item.id);
          console.log('Fetching checkout with IDs:', selectedItemIds);
          const response = await api.post('/order', selectedItemIds);
          if (response.data.status !== 'success') {
            throw new Error(response.data.message || 'Không thể tải dữ liệu đơn hàng');
          }
          dispatch(setCheckoutData(response.data.data));
        } catch (err) {
          let errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại.';
          if (err && typeof err === 'object' && 'response' in err && (err as any).response?.data?.message) {
            errorMessage = (err as any).response.data.message;
          } else if (err instanceof Error) {
            errorMessage = err.message;
          }
          setError(errorMessage);
        } finally {
          setLoading(false);
          isFetchingRef.current = false;
        }
      };
      fetchCheckoutData();
    }
  }, [dispatch, selectedItems]);

  const handleVoucherSelect = (storeId: number, voucher: DiscountCodeDTO | null): void => {
    setSelectedVouchers(prev => ({
      ...prev,
      [storeId]: voucher
    }));
  };

  const handleNoteChange = (storeId: number, note: string): void => {
    setSelectedNotes(prev => ({
      ...prev,
      [storeId]: note
    }));
  };

  // Tính tổng discount với logic xử lý voucher PRODUCTS
  const calculateTotalDiscount = (): number => {
    if (!checkoutData) return 0;
    
    let totalDiscount = 0;
    checkoutData.orderResponse.forEach((order: any) => {
        const voucher = selectedVouchers[order.store.id];
        if (voucher) {
            let applicableAmount = 0;
            
            if (voucher.appliesTo === 'SHOP') {
                applicableAmount = order.orderItemResponses.reduce(
                    (sum: number, item: any) => sum + item.totalItemPrice,
                    0
                );
                
                if (voucher.discountType === 'PERCENTAGE') {
                    const discount = (applicableAmount * voucher.discountValue) / 100;
                    totalDiscount += voucher.maxDiscountValue 
                        ? Math.min(discount, voucher.maxDiscountValue)
                        : discount;
                } else {
                    totalDiscount += Math.min(voucher.discountValue, applicableAmount);
                }
            } else if (voucher.appliesTo === 'PRODUCTS' && voucher.applicableProductIds && voucher.applicableProductIds.length > 0) {
                const applicableItems = order.orderItemResponses.filter((item: any) => 
                    voucher.applicableProductIds?.includes(item.productVariant.product.id)
                );
                
                if (applicableItems.length > 0) {
                    if (voucher.discountType === 'PERCENTAGE') {
                        applicableAmount = applicableItems.reduce((sum: number, item: any) => sum + item.totalItemPrice, 0);
                        const discount = (applicableAmount * voucher.discountValue) / 100;
                        totalDiscount += voucher.maxDiscountValue 
                            ? Math.min(discount, voucher.maxDiscountValue)
                            : discount;
                    } else {
                        // FIXED_AMOUNT - Giảm cho mỗi sản phẩm instance
                        const discountPerProduct = voucher.discountValue;
                        applicableItems.forEach((item: any) => {
                            const itemDiscount = Math.min(discountPerProduct, item.priceAtTime);
                            totalDiscount += itemDiscount * item.quantity;
                        });
                    }
                }
            }
        }
    });
    
    return totalDiscount;
};

  const handlePlaceOrder = async (): Promise<void> => {
    if (!checkoutData || !selectedAddress) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Vui lòng chọn địa chỉ giao hàng',
        confirmButtonColor: '#22c55e'
      });
      return;
    }

    const totalAmount: number = getTotalAmount(checkoutData) + getTotalShipping(checkoutData) - calculateTotalDiscount();

    // Prepare orderRequest
    const orderIds = checkoutData.orderResponse.map((order: any) => order.id);
    const voucherIdMap = new Map<number, number>();
    checkoutData.orderResponse.forEach((order: any) => {
      const voucher = selectedVouchers[order.store.id];
      if (voucher) {
        voucherIdMap.set(order.id, voucher.id);
      }
    });

    const note = new Map<number, string>();
    checkoutData.orderResponse.forEach((order: any) => {
      const orderNote = (selectedNotes[order.store.id] || '').trim();
      note.set(order.id, orderNote);
    });

    const notesObject = Object.fromEntries(note);
    const voucherIdsObject = voucherIdMap.size > 0 ? Object.fromEntries(voucherIdMap) : undefined;

    const orderRequest: OrderRequest = {
      addressId: selectedAddress.id as number,
      shippingMethod,
      paymentMethod,
      voucherIds: voucherIdsObject,
      notes: notesObject,
      orderIds
    };

    if (paymentMethod === 'WALLET' && balance < totalAmount) {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Số dư không đủ!',
        html: `
          <div class="text-left">
            <p class="mb-2">Số dư ví hiện tại: <strong>${formatCurrency(balance)}</strong></p>
            <p class="mb-2">Tổng thanh toán: <strong>${formatCurrency(totalAmount)}</strong></p>
            <p>Cần nạp thêm: <strong class="text-red-600">${formatCurrency(totalAmount - balance)}</strong></p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#22c55e',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Nạp tiền ngay',
        cancelButtonText: 'Để sau'
      });

      if (result.isConfirmed) {
        dispatch(setAmount((totalAmount - balance).toString()));
        setOrderRequestForDeposit(orderRequest);
        setShowDepositModal(true);
      }
      return;
    }

    const result = await Swal.fire({
      title: 'Xác nhận đặt hàng?',
      html: `
        <div class="text-left">
          <p class="mb-2">Tổng tiền hàng: <strong>${formatCurrency(getTotalAmount(checkoutData))}</strong></p>
          <p class="mb-2">Phí vận chuyển: <strong>${formatCurrency(getTotalShipping(checkoutData))}</strong></p>
          ${calculateTotalDiscount() > 0 ? `<p class="mb-2 text-green-600">Giảm giá: <strong>-${formatCurrency(calculateTotalDiscount())}</strong></p>` : ''}
          <hr class="my-2">
          <p class="text-lg">Tổng thanh toán: <strong class="text-green-600">${formatCurrency(totalAmount)}</strong></p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xác nhận đặt hàng',
      cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      setError(null);

      const resultAction = await dispatch(createOrder(orderRequest));
      if (createOrder.fulfilled.match(resultAction)) {
        const { redirectUrl } = resultAction.payload;
        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        } else {
          dispatch(clearCheckoutData());
          Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Đơn hàng đã được đặt thành công.',
            confirmButtonColor: '#22c55e'
          }).then(() => {
            // Redirect to orders page or home
            window.location.href = '/orders';
          });
        }
      } else {
        throw new Error(
          typeof resultAction.payload === 'object' &&
          resultAction.payload !== null &&
          'message' in resultAction.payload
            ? (resultAction.payload as { message: string }).message
            : 'Đã xảy ra lỗi khi đặt hàng'
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.';
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: errorMessage,
        confirmButtonColor: '#22c55e'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || orderLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || orderError || !checkoutData) {
    let errorMessage = error || orderError?.message || 'Không có sản phẩm nào được chọn';
    if (orderError && orderError.code === 'INSUFFICIENT_STOCK') {
      errorMessage = 'Một số sản phẩm trong đơn hàng không đủ tồn kho. Vui lòng kiểm tra lại giỏ hàng.';
    } else if (orderError && orderError.message.includes('không đủ tồn kho')) {
      errorMessage = 'Một số sản phẩm trong đơn hàng không đủ tồn kho. Vui lòng kiểm tra lại giỏ hàng.';
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <button 
            onClick={() => window.history.back()} 
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Thanh toán</h1>
          <p className="text-gray-600">Xem lại đơn hàng và hoàn tất thanh toán</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Address, Payment, Shipping */}
          <div className="lg:col-span-4">
            <AddressSection selectedAddress={selectedAddress} setSelectedAddress={setSelectedAddress} />
            <PaymentSection paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
            <ShippingSection
              shippingMethod={shippingMethod}
              setShippingMethod={setShippingMethod}
              totalShipping={getTotalShipping(checkoutData)}
            />
          </div>

          {/* Middle Column - Order Items */}
          <div className="lg:col-span-5">
            <div className="space-y-6">
              {checkoutData.orderResponse.map((order: any) => (
                <OrderSection
                  key={order.id}
                  order={order}
                  selectedVouchers={selectedVouchers}
                  handleVoucherSelect={handleVoucherSelect}
                  onNoteChange={handleNoteChange}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-3">
            <OrderSummary
              checkoutData={checkoutData}
              selectedVouchers={selectedVouchers}
              handlePlaceOrder={handlePlaceOrder}
            />
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      <DepositModal 
        open={showDepositModal} 
        onOpenChange={setShowDepositModal} 
        orderRequest={orderRequestForDeposit}
      />
    </div>
  );
};

export default CheckoutPage;