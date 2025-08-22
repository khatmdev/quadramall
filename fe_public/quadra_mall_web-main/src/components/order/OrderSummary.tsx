import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { formatCurrency, getTotalAmount, getTotalShipping } from '@/utils/utils';
import { Gift, ShoppingBag, DollarSign } from 'lucide-react';
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
    // Sử dụng trực tiếp totalItemPrice từ server
    const totalWithFlashSale = checkoutData.orderResponse.reduce((total, order) => 
        total + order.orderItemResponses.reduce((sum, item) => sum + item.totalItemPrice, 0), 0
    );

    // Tổng shipping
    const totalShipping = getTotalShipping(checkoutData);

    // Calculate voucher discount
    const calculateTotalVoucherDiscount = (): number => {
        let totalDiscount = 0;
        
        checkoutData.orderResponse.forEach((order) => {
            const voucher = selectedVouchers[order.store.id];
            if (voucher) {
                let applicableAmount = 0;
                
                if (voucher.appliesTo === 'SHOP') {
                    applicableAmount = order.orderItemResponses.reduce((sum, item) => sum + item.totalItemPrice, 0);
                    
                    if (voucher.discountType === 'PERCENTAGE') {
                        const discount = (applicableAmount * voucher.discountValue) / 100;
                        totalDiscount += voucher.maxDiscountValue 
                            ? Math.min(discount, voucher.maxDiscountValue)
                            : discount;
                    } else {
                        totalDiscount += Math.min(voucher.discountValue, applicableAmount);
                    }
                } else if (voucher.appliesTo === 'PRODUCTS' && voucher.applicableProductIds && voucher.applicableProductIds.length > 0) {
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

    // Tính tổng tiết kiệm từ Flash Sale
    const calculateTotalFlashSavings = (): number => {
        return checkoutData.orderResponse.reduce((total, order) => {
            return total + order.orderItemResponses.reduce((sum, item) => {
                if (item.flashSale && item.originalPrice) {
                    return sum + ((item.originalPrice * item.quantity) - item.totalItemPrice);
                }
                return sum;
            }, 0);
        }, 0);
    };

    const totalVoucherDiscount = calculateTotalVoucherDiscount();
    const totalFlashSavings = calculateTotalFlashSavings();
    const totalSavings = totalFlashSavings + totalVoucherDiscount;
    const finalAmount = totalWithFlashSale + totalShipping - totalVoucherDiscount;

    return (
        <Card className="sticky top-4 shadow-lg">
            <div className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Chi tiết đơn hàng</h3>
                
                {/* Chi tiết từng cửa hàng và sản phẩm */}
                <div className="space-y-4 mb-6">
                    {checkoutData.orderResponse.map((order) => (
                        <div key={order.id} className="pb-4 border-b border-gray-200 last:border-b-0">
                            {/* Store header */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-blue-600">🏪</span>
                                </div>
                                <h4 className="font-medium text-gray-800 text-sm">{order.store.name}</h4>
                            </div>
                            
                            {/* Sản phẩm */}
                            <div className="space-y-3 ml-8">
                                {order.orderItemResponses.map((item) => {
                                    const hasFlashSale = !!item.flashSale;
                                    const originalItemTotal = item.originalPrice ? item.originalPrice * item.quantity : item.priceAtTime * item.quantity;
                                    const flashSavings = hasFlashSale && item.originalPrice ? originalItemTotal - item.totalItemPrice : 0;
                                    
                                    return (
                                        <div key={item.id} className="text-sm">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-gray-800 truncate">
                                                        {item.productVariant.product.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1 space-y-1">
                                                        {hasFlashSale && item.originalPrice ? (
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="line-through text-gray-400">
                                                                    {formatCurrency(item.originalPrice)}
                                                                </span>
                                                                <span className="text-red-600 font-medium">
                                                                    {formatCurrency(item.priceAtTime)}
                                                                </span>
                                                                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                                                                    -{item.flashSale!.percentageDiscount}%
                                                                </span>
                                                                <span className="text-gray-600">x {item.quantity}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-gray-600">
                                                                {formatCurrency(item.priceAtTime)} x {item.quantity}
                                                            </div>
                                                        )}
                                                        {flashSavings > 0 && (
                                                            <div className="text-red-600 font-medium">
                                                                Tiết kiệm: {formatCurrency(flashSavings)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="font-semibold text-gray-800">
                                                        {formatCurrency(item.totalItemPrice)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tổng kết thanh toán */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tổng tiền hàng:</span>
                        <span className="font-medium text-gray-800">{formatCurrency(totalWithFlashSale)}</span>
                    </div>

                    {/* Voucher discounts */}
                    {checkoutData.orderResponse.map((order) => {
                        const voucher = selectedVouchers[order.store.id];
                        if (!voucher) return null;
                        
                        let discount = 0;
                        if (voucher.appliesTo === 'SHOP') {
                            const applicableAmount = order.orderItemResponses.reduce((sum, item) => sum + item.totalItemPrice, 0);
                            if (voucher.discountType === 'PERCENTAGE') {
                                discount = (applicableAmount * voucher.discountValue) / 100;
                                discount = voucher.maxDiscountValue ? Math.min(discount, voucher.maxDiscountValue) : discount;
                            } else {
                                discount = Math.min(voucher.discountValue, applicableAmount);
                            }
                        } else if (voucher.appliesTo === 'PRODUCTS' && voucher.applicableProductIds) {
                            const applicableItems = order.orderItemResponses.filter(item => 
                                voucher.applicableProductIds?.includes(item.productVariant.product.id)
                            );
                            
                            if (applicableItems.length > 0) {
                                if (voucher.discountType === 'PERCENTAGE') {
                                    const applicableAmount = applicableItems.reduce((sum, item) => sum + item.totalItemPrice, 0);
                                    discount = (applicableAmount * voucher.discountValue) / 100;
                                    discount = voucher.maxDiscountValue ? Math.min(discount, voucher.maxDiscountValue) : discount;
                                } else {
                                    discount = applicableItems.reduce((sum, item) => {
                                        const itemDiscount = Math.min(voucher.discountValue, item.priceAtTime);
                                        return sum + (itemDiscount * item.quantity);
                                    }, 0);
                                }
                            }
                        }
                        
                        if (discount > 0) {
                            return (
                                <div key={order.store.id} className="flex justify-between text-sm">
                                    <span className="text-gray-600 flex items-center gap-1">
                                        <Gift className="w-3 h-3 text-green-600" />
                                        {order.store.name} - {voucher.code}:
                                    </span>
                                    <span className="text-green-600 font-medium">
                                        -{formatCurrency(discount)}
                                    </span>
                                </div>
                            );
                        }
                        return null;
                    })}
                    
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phí vận chuyển:</span>
                        <span className="font-medium text-gray-800">{formatCurrency(totalShipping)}</span>
                    </div>
                    
                    {/* Tổng thanh toán */}
                    <div className="pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-800">Tổng thanh toán:</span>
                            <span className="text-xl font-bold text-green-600">
                                {formatCurrency(finalAmount)}
                            </span>
                        </div>
                    </div>

                    {/* Tổng tiết kiệm */}
                    {totalSavings > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-semibold text-green-800">
                                    💰 Tổng tiết kiệm: {formatCurrency(totalSavings)}
                                </span>
                            </div>
                            <div className="text-xs text-green-700 space-y-1">
                                {totalFlashSavings > 0 && (
                                    <div>• Flash Sale: {formatCurrency(totalFlashSavings)}</div>
                                )}
                                {totalVoucherDiscount > 0 && (
                                    <div>• Voucher: {formatCurrency(totalVoucherDiscount)}</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Button đặt hàng */}
                <Button
                    onClick={handlePlaceOrder}
                    className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Đặt hàng</span>
                    {totalSavings > 0 && (
                        <span className="bg-white/20 px-2 py-1 rounded-full text-sm font-medium">
                            Tiết kiệm {formatCurrency(totalSavings)}
                        </span>
                    )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center mt-3 leading-relaxed">
                    Bằng việc đặt hàng, bạn đồng ý với điều khoản sử dụng của chúng tôi
                </p>
            </div>
        </Card>
    );
};

export default OrderSummary;