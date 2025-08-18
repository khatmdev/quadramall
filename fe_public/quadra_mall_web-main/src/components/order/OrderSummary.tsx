import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { formatCurrency, getTotalAmount, getTotalShipping } from '@/utils/utils';
import type { CheckoutData, DiscountCodeDTO } from '@/types/Order/interface';

interface OrderSummaryProps {
    checkoutData: CheckoutData;
    selectedVouchers: { [storeId: number]: DiscountCodeDTO | null };
    handlePlaceOrder: () => Promise<void>;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
    checkoutData,
    selectedVouchers,
    handlePlaceOrder
}) => {
    // Calculate total discount from all selected vouchers với logic xử lý PRODUCTS
    const calculateTotalDiscount = (): number => {
    let totalDiscount = 0;
    
    checkoutData.orderResponse.forEach((order) => {
        const voucher = selectedVouchers[order.store.id];
        if (voucher) {
            let applicableAmount = 0;
            
            if (voucher.appliesTo === 'SHOP') {
                // Áp dụng cho toàn bộ sản phẩm của store
                applicableAmount = order.orderItemResponses.reduce(
                    (sum, item) => sum + item.totalItemPrice,
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
                // Chỉ áp dụng cho sản phẩm cụ thể
                const applicableItems = order.orderItemResponses.filter(item => 
                    voucher.applicableProductIds?.includes(item.productVariant.product.id)
                );
                
                if (applicableItems.length > 0) {
                    if (voucher.discountType === 'PERCENTAGE') {
                        applicableAmount = applicableItems.reduce((sum, item) => sum + item.totalItemPrice, 0);
                        const discount = (applicableAmount * voucher.discountValue) / 100;
                        totalDiscount += voucher.maxDiscountValue 
                            ? Math.min(discount, voucher.maxDiscountValue)
                            : discount;
                    } else {
                        // FIXED_AMOUNT - Giảm cho mỗi sản phẩm instance
                        const discountPerProduct = voucher.discountValue;
                        applicableItems.forEach(item => {
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

    // Lấy thông tin chi tiết về voucher đã áp dụng
    const getVoucherDetails = () => {
        const details: Array<{storeId: number, storeName: string, voucher: DiscountCodeDTO, discount: number}> = [];
        
        checkoutData.orderResponse.forEach((order) => {
            const voucher = selectedVouchers[order.store.id];
            if (voucher) {
                let discount = 0;
                let applicableAmount = 0;
                
                if (voucher.appliesTo === 'SHOP') {
                    applicableAmount = order.orderItemResponses.reduce(
                        (sum, item) => sum + item.totalItemPrice,
                        0
                    );
                } else if (voucher.appliesTo === 'PRODUCTS' && voucher.applicableProductIds) {
                    applicableAmount = order.orderItemResponses
                        .filter(item => voucher.applicableProductIds?.includes(item.productVariant.product.id))
                        .reduce((sum, item) => sum + item.totalItemPrice, 0);
                }
                
                if (applicableAmount > 0) {
                    if (voucher.discountType === 'PERCENTAGE') {
                        discount = (applicableAmount * voucher.discountValue) / 100;
                        discount = voucher.maxDiscountValue 
                            ? Math.min(discount, voucher.maxDiscountValue)
                            : discount;
                    } else {
                        discount = Math.min(voucher.discountValue, applicableAmount);
                    }
                }
                
                if (discount > 0) {
                    details.push({
                        storeId: order.store.id,
                        storeName: order.store.name,
                        voucher,
                        discount
                    });
                }
            }
        });
        
        return details;
    };

    const totalProductAmount = getTotalAmount(checkoutData);
    const totalShipping = getTotalShipping(checkoutData);
    const totalDiscount = calculateTotalDiscount();
    const finalAmount = totalProductAmount + totalShipping - totalDiscount;
    const voucherDetails = getVoucherDetails();

    return (
        <Card className="sticky top-4">
            <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Tổng đơn hàng</h3>
                
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tổng tiền hàng:</span>
                        <span>{formatCurrency(totalProductAmount)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phí vận chuyển:</span>
                        <span>{formatCurrency(totalShipping)}</span>
                    </div>
                    
                    {totalDiscount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Giảm giá:</span>
                            <span className="text-green-600">
                                -{formatCurrency(totalDiscount)}
                            </span>
                        </div>
                    )}
                    
                    <div className="pt-3 border-t">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold">Tổng thanh toán:</span>
                            <span className="text-xl font-bold text-green-600">
                                {formatCurrency(finalAmount)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Voucher Summary với chi tiết */}
                {voucherDetails.length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-800 mb-2">
                            Mã giảm giá đã áp dụng:
                        </p>
                        <div className="space-y-2">
                            {voucherDetails.map((detail) => (
                                <div key={detail.storeId} className="text-xs">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-medium text-green-700">{detail.storeName}:</span>
                                            <span className="text-green-600 ml-1">{detail.voucher.code}</span>
                                            {detail.voucher.appliesTo === 'PRODUCTS' && (
                                                <span className="text-green-500 text-xs block">
                                                    (Áp dụng cho {detail.voucher.applicableProductIds?.length} sản phẩm)
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-green-700 font-medium">
                                            -{formatCurrency(detail.discount)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <Button
                    onClick={handlePlaceOrder}
                    className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                >
                    Đặt hàng
                </Button>
                
                <p className="text-xs text-gray-500 text-center mt-3">
                    Bằng việc đặt hàng, bạn đồng ý với điều khoản sử dụng của chúng tôi
                </p>
            </div>
        </Card>
    );
};

export default OrderSummary;