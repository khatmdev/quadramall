import React from 'react';
import { Card } from '@/ui/Card';
import { Textarea } from '@/components/ui/textarea';
import { VoucherSection } from './VoucherSection';
import { formatCurrency } from '@/utils/utils';
import { CheckCircle, Clock, Flame, Timer } from 'lucide-react';
import type { Order, DiscountCodeDTO, OrderItem } from '@/types/Order/interface';

interface OrderSectionProps {
    order: Order;
    selectedVouchers: { [storeId: number]: DiscountCodeDTO | null };
    handleVoucherSelect: (storeId: number, voucher: DiscountCodeDTO | null) => void;
    onNoteChange: (storeId: number, note: string) => void;
}

// Flash Sale Countdown Component
const FlashSaleCountdown: React.FC<{ endTime: string }> = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = React.useState<{
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);

    React.useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(endTime).getTime();
            const difference = end - now;

            if (difference > 0) {
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                setTimeLeft({ hours, minutes, seconds });
            } else {
                setTimeLeft(null);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    if (!timeLeft) return null;

    return (
        <div className="flex items-center gap-1 text-white text-xs">
            <Timer className="w-3 h-3" />
            <span>
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
            </span>
        </div>
    );
};

// Flash Sale Progress Bar
const FlashSaleProgress: React.FC<{ soldCount: number; quantity: number }> = ({ 
    soldCount, 
    quantity 
}) => {
    const percentage = Math.min((soldCount / quantity) * 100, 100);

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white">
                    Đã bán {soldCount}/{quantity}
                </span>
                <span className="text-xs text-white font-medium">{Math.round(percentage)}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2">
                <div
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

const OrderSection: React.FC<OrderSectionProps> = ({
    order,
    selectedVouchers,
    handleVoucherSelect,
    onNoteChange
}) => {
    // Sử dụng trực tiếp dữ liệu từ server
    const productTotal = order.orderItemResponses.reduce((sum, item) => sum + item.totalItemPrice, 0);

    // Calculate voucher discount
    const calculateVoucherDiscount = (voucher: DiscountCodeDTO): number => {
        let applicableAmount = 0;
        
        if (voucher.appliesTo === 'PRODUCTS' && voucher.applicableProductIds && voucher.applicableProductIds.length > 0) {
            const applicableItems = order.orderItemResponses.filter(item => 
                voucher.applicableProductIds?.includes(item.productVariant.product.id)
            );
            
            if (applicableItems.length === 0) return 0;
            
            if (voucher.discountType === 'PERCENTAGE') {
                applicableAmount = applicableItems.reduce((sum, item) => sum + item.totalItemPrice, 0);
                const discount = (applicableAmount * voucher.discountValue) / 100;
                return voucher.maxDiscountValue 
                    ? Math.min(discount, voucher.maxDiscountValue)
                    : discount;
            } else {
                const discountPerProduct = voucher.discountValue;
                let totalDiscount = 0;
                
                applicableItems.forEach(item => {
                    const itemDiscount = Math.min(discountPerProduct, item.priceAtTime);
                    totalDiscount += itemDiscount * item.quantity;
                });
                
                return totalDiscount;
            }
        } else if (voucher.appliesTo === 'SHOP') {
            applicableAmount = productTotal;
            
            if (voucher.discountType === 'PERCENTAGE') {
                const discount = (applicableAmount * voucher.discountValue) / 100;
                return voucher.maxDiscountValue 
                    ? Math.min(discount, voucher.maxDiscountValue)
                    : discount;
            } else {
                return Math.min(voucher.discountValue, applicableAmount);
            }
        }
        
        return 0;
    };

    // Calculate item discount for voucher display
    const calculateItemDiscount = (item: OrderItem, voucher: DiscountCodeDTO | null): number => {
        if (!voucher || !voucher.applicableProductIds?.includes(item.productVariant.product.id) || voucher.appliesTo !== 'PRODUCTS') {
            return 0;
        }
        
        if (voucher.discountType === 'PERCENTAGE') {
            const discount = (item.totalItemPrice * voucher.discountValue) / 100;
            return voucher.maxDiscountValue 
                ? Math.min(discount, voucher.maxDiscountValue)
                : discount;
        } else {
            const discountPerProduct = Math.min(voucher.discountValue, item.priceAtTime);
            return discountPerProduct * item.quantity;
        }
    };

    // Check if product is discounted by voucher
    const isProductDiscounted = (productId: number): boolean => {
        const voucher = selectedVouchers[order.store.id];
        if (!voucher) return false;
        
        if (voucher.appliesTo === 'SHOP') return true;
        
        return voucher.applicableProductIds?.includes(productId) || false;
    };

    return (
        <Card className="shadow-lg">
            <div className="p-6">
                {/* Store Header - Đơn giản, không hiển thị flash sale */}
                <div className="flex items-center space-x-3 mb-4 pb-4 border-b">
                    <img
                        src={order.store.image || '/default-store.png'}
                        alt={order.store.name}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <h3 className="font-semibold text-lg">{order.store.name}</h3>
                </div>

                {/* Order Items */}
                <div className="space-y-4 mb-4">
                    {order.orderItemResponses.map((item) => {
                        const isDiscounted = isProductDiscounted(item.productVariant.product.id);
                        const itemDiscount = calculateItemDiscount(item, selectedVouchers[order.store.id]);
                        const hasFlashSale = !!item.flashSale;
                        
                        return (
                            <div key={item.id} className="relative">
                                {/* Flash Sale Banner chỉ cho sản phẩm */}
                                {hasFlashSale && (
                                    <div className="bg-gradient-to-r from-red-500 to-red-600 p-2 rounded-t-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 bg-white/20 rounded px-2 py-1">
                                                    <Flame className="w-3 h-3 text-white" />
                                                    <span className="text-white text-xs font-medium">
                                                        FLASH SALE -{item.flashSale!.percentageDiscount}%
                                                    </span>
                                                </div>
                                                <FlashSaleCountdown endTime={item.flashSale!.endTime} />
                                            </div>
                                            <div className="w-24">
                                                <FlashSaleProgress
                                                    soldCount={item.flashSale!.soldCount}
                                                    quantity={item.flashSale!.quantity}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className={`flex items-start space-x-3 p-3 border border-gray-200 ${
                                    isDiscounted ? 'bg-green-50 border-green-200' : ''
                                } ${hasFlashSale ? 'rounded-t-none' : 'rounded-lg'}`}>
                                    
                                    <div className="relative">
                                        <img
                                            src={item.productVariant.imageUrl || item.productVariant.product.thumbnailUrl}
                                            alt={item.productVariant.product.name}
                                            className="w-20 h-20 rounded-lg object-cover"
                                        />
                                        
                                        {/* Voucher indicator */}
                                        {isDiscounted && (
                                            <div className="absolute -top-2 -right-2 bg-green-600 rounded-full p-1">
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-800 line-clamp-2 mb-1">
                                            {item.productVariant.product.name}
                                        </h4>
                                        <p className="text-sm text-gray-500 mb-2">
                                            SKU: {item.productVariant.sku}
                                        </p>
                                        
                                        {/* Voucher discount display */}
                                        {isDiscounted && selectedVouchers[order.store.id]?.appliesTo === 'PRODUCTS' && (
                                            <div className="inline-flex items-center gap-1 mb-2">
                                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                                    ✓ Voucher -{formatCurrency(itemDiscount)} ({selectedVouchers[order.store.id]?.code})
                                                </span>
                                            </div>
                                        )}
                                        
                                        {/* Addons */}
                                        {item.addons && item.addons.length > 0 && (
                                            <div className="mb-2 space-y-1">
                                                {item.addons.map((addon, idx) => (
                                                    <p key={idx} className="text-xs text-gray-600">
                                                        + {addon.addonGroupName}: {addon.addonName} 
                                                        ({formatCurrency(addon.priceAdjust)})
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm">
                                                {hasFlashSale && item.originalPrice ? (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-red-600 font-bold">
                                                                {formatCurrency(item.priceAtTime)}
                                                            </span>
                                                            <span className="text-gray-500 line-through text-sm">
                                                                {formatCurrency(item.originalPrice)}
                                                            </span>
                                                            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
                                                                -{item.flashSale!.percentageDiscount}%
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-600">x {item.quantity}</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-600">
                                                        <span>{formatCurrency(item.priceAtTime)} x {item.quantity}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="text-right">
                                                <p className="font-semibold text-green-600">
                                                    {formatCurrency(item.totalItemPrice)}
                                                </p>
                                                
                                                {itemDiscount > 0 && (
                                                    <p className="text-xs text-green-600 font-medium">
                                                        Voucher: -{formatCurrency(itemDiscount)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Voucher Section */}
                <VoucherSection
                    selectedVoucher={selectedVouchers[order.store.id]}
                    availableVouchers={order.availableVouchers || []}
                    onSelect={(voucher) => handleVoucherSelect(order.store.id, voucher)}
                    orderAmount={productTotal}
                    orderItems={order.orderItemResponses}
                />

                {/* Note Section */}
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ghi chú cho cửa hàng
                    </label>
                    <Textarea
                        placeholder="Nhập ghi chú (tùy chọn)"
                        className="w-full resize-none"
                        rows={2}
                        onChange={(e) => onNoteChange(order.store.id, e.target.value)}
                    />
                </div>

                {/* Order Summary - Chi tiết từng mục */}
                <div className="mt-4 pt-4 border-t space-y-2">
                    <h4 className="font-medium text-gray-800 mb-3">Chi tiết thanh toán</h4>
                    
                    {/* Chi tiết từng sản phẩm */}
                    {order.orderItemResponses.map((item) => {
                        const hasFlashSale = !!item.flashSale;
                        const originalItemTotal = item.originalPrice ? item.originalPrice * item.quantity : item.priceAtTime * item.quantity;
                        const flashSavings = hasFlashSale && item.originalPrice ? originalItemTotal - item.totalItemPrice : 0;
                        
                        return (
                            <div key={item.id} className="text-sm">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <span className="text-gray-700">{item.productVariant.product.name}</span>
                                        <div className="text-xs text-gray-500">
                                            {hasFlashSale && item.originalPrice ? (
                                                <span>
                                                    <span className="line-through">{formatCurrency(item.originalPrice)}</span>
                                                    {' → '}
                                                    <span className="text-red-600 font-medium">{formatCurrency(item.priceAtTime)}</span>
                                                    {' x '}{item.quantity}
                                                </span>
                                            ) : (
                                                <span>{formatCurrency(item.priceAtTime)} x {item.quantity}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{formatCurrency(item.totalItemPrice)}</div>
                                        {flashSavings > 0 && (
                                            <div className="text-xs text-red-600">Tiết kiệm: {formatCurrency(flashSavings)}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    <div className="border-t pt-2 mt-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tổng tiền hàng:</span>
                            <span>{formatCurrency(productTotal)}</span>
                        </div>
                        
                        {selectedVouchers[order.store.id] && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    Giảm giá voucher ({selectedVouchers[order.store.id]?.code}):
                                </span>
                                <span className="text-green-600">
                                    -{formatCurrency(calculateVoucherDiscount(selectedVouchers[order.store.id]!))}
                                </span>
                            </div>
                        )}
                        
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Phí vận chuyển:</span>
                            <span>{formatCurrency(order.shippingCost)}</span>
                        </div>
                        
                        <div className="flex justify-between font-semibold text-base pt-2 border-t">
                            <span>Tổng cộng:</span>
                            <span className="text-green-600">
                                {formatCurrency(
                                    productTotal + order.shippingCost - 
                                    (selectedVouchers[order.store.id] 
                                        ? calculateVoucherDiscount(selectedVouchers[order.store.id]!)
                                        : 0)
                                )}
                            </span>
                        </div>
                        
                        {/* Tổng tiết kiệm */}
                        {(() => {
                            const totalFlashSavings = order.orderItemResponses.reduce((sum, item) => {
                                if (item.flashSale && item.originalPrice) {
                                    return sum + ((item.originalPrice * item.quantity) - item.totalItemPrice);
                                }
                                return sum;
                            }, 0);
                            
                            const voucherSavings = selectedVouchers[order.store.id] 
                                ? calculateVoucherDiscount(selectedVouchers[order.store.id]!) 
                                : 0;
                            
                            const totalSavings = totalFlashSavings + voucherSavings;
                            
                            if (totalSavings > 0) {
                                return (
                                    <div className="bg-green-50 p-2 rounded-lg mt-2">
                                        <div className="text-sm text-green-700 font-medium">
                                            💰 Bạn đã tiết kiệm: {formatCurrency(totalSavings)}
                                        </div>
                                        <div className="text-xs text-green-600 mt-1">
                                            {totalFlashSavings > 0 && `Flash Sale: ${formatCurrency(totalFlashSavings)}`}
                                            {totalFlashSavings > 0 && voucherSavings > 0 && ' • '}
                                            {voucherSavings > 0 && `Voucher: ${formatCurrency(voucherSavings)}`}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default OrderSection;