import { Card } from '@/ui/Card';
import { Textarea } from '@/components/ui/textarea';
import { VoucherSection } from './VoucherSection';
import { formatCurrency } from '@/utils/utils';
import type { Order, DiscountCodeDTO, OrderItem } from '@/types/Order/interface';
import { CheckCircle } from 'lucide-react';

interface OrderSectionProps {
    order: Order;
    selectedVouchers: { [storeId: number]: DiscountCodeDTO | null };
    handleVoucherSelect: (storeId: number, voucher: DiscountCodeDTO | null) => void;
    onNoteChange: (storeId: number, note: string) => void;
}

const OrderSection: React.FC<OrderSectionProps> = ({
    order,
    selectedVouchers,
    handleVoucherSelect,
    onNoteChange
}) => {
    // Tính tổng tiền sản phẩm (không bao gồm ship)
    const productTotal = order.orderItemResponses.reduce(
        (sum, item) => sum + item.totalItemPrice,
        0
    );

    // Helper function để tính discount amount cho voucher
    const calculateVoucherDiscount = (voucher: DiscountCodeDTO): number => {
    let applicableAmount = 0;
    
    // Nếu voucher chỉ áp dụng cho products cụ thể
    if (voucher.appliesTo === 'PRODUCTS' && voucher.applicableProductIds && voucher.applicableProductIds.length > 0) {
        const applicableItems = order.orderItemResponses.filter(item => 
            voucher.applicableProductIds?.includes(item.productVariant.product.id)
        );
        
        if (applicableItems.length === 0) {
            return 0;
        }
        
        if (voucher.discountType === 'PERCENTAGE') {
            // Tính theo tổng giá trị sản phẩm được áp dụng
            applicableAmount = applicableItems.reduce((sum, item) => sum + item.totalItemPrice, 0);
            const discount = (applicableAmount * voucher.discountValue) / 100;
            return voucher.maxDiscountValue 
                ? Math.min(discount, voucher.maxDiscountValue)
                : discount;
        } else {
            // FIXED_AMOUNT - Giảm cho MỖI sản phẩm instance
            const discountPerProduct = voucher.discountValue;
            let totalDiscount = 0;
            
            applicableItems.forEach(item => {
                const itemDiscount = Math.min(discountPerProduct, item.priceAtTime);
                totalDiscount += itemDiscount * item.quantity;
            });
            
            return totalDiscount;
        }
    } else if (voucher.appliesTo === 'SHOP') {
        // Áp dụng cho toàn bộ sản phẩm
        applicableAmount = order.orderItemResponses.reduce(
            (sum, item) => sum + item.totalItemPrice,
            0
        );
        
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

// Helper function để tính discount cho từng item (dùng cho UI)
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
        // FIXED_AMOUNT - Giảm cho mỗi instance
        const discountPerProduct = Math.min(voucher.discountValue, item.priceAtTime);
        return discountPerProduct * item.quantity;
    }
};
// Kiểm tra xem sản phẩm có được áp dụng voucher không
const isProductDiscounted = (productId: number): boolean => {
    const voucher = selectedVouchers[order.store.id];
    if (!voucher) return false;
    
    if (voucher.appliesTo === 'SHOP') return true;
    
    return voucher.applicableProductIds?.includes(productId) || false;
};

return (
    <Card className="shadow-lg">
        <div className="p-6">
            {/* Store Header */}
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
                    
                    return (
                        <div key={item.id} className={`flex items-start space-x-3 ${isDiscounted ? 'bg-green-50 p-2 rounded-lg' : ''}`}>
                            <div className="relative">
                                <img
                                    src={item.productVariant.imageUrl || item.productVariant.product.thumbnailUrl}
                                    alt={item.productVariant.product.name}
                                    className="w-20 h-20 rounded-lg object-cover"
                                />
                                {isDiscounted && (
                                    <div className="absolute -top-2 -right-2 bg-green-600 rounded-full p-1">
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-800 line-clamp-2">
                                    {item.productVariant.product.name}
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    SKU: {item.productVariant.sku}
                                </p>
                                
                                {/* Hiển thị nếu sản phẩm này được áp dụng voucher */}
                                {isDiscounted && selectedVouchers[order.store.id]?.appliesTo === 'PRODUCTS' && (
                                    <div className="inline-flex items-center gap-1 mt-1">
                                        <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                            ✓ Giảm {formatCurrency(itemDiscount)} ({selectedVouchers[order.store.id]?.code})
                                        </span>
                                    </div>
                                )}
                                
                                {/* Addons */}
                                {item.addons && item.addons.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {item.addons.map((addon, idx) => (
                                            <p key={idx} className="text-xs text-gray-600">
                                                + {addon.addonGroupName}: {addon.addonName} 
                                                ({formatCurrency(addon.priceAdjust)})
                                            </p>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-sm text-gray-600">
                                        {formatCurrency(item.priceAtTime)} x {item.quantity}
                                    </p>
                                    <div className="text-right">
                                        {itemDiscount > 0 && (
                                            <p className="text-sm text-gray-500 line-through">
                                                {formatCurrency(item.totalItemPrice)}
                                            </p>
                                        )}
                                        <p className="font-semibold text-green-600">
                                            {formatCurrency(item.totalItemPrice - itemDiscount)}
                                        </p>
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

            {/* Order Summary for this store */}
            <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tổng tiền hàng:</span>
                    <span>{formatCurrency(productTotal)}</span>
                </div>
                
                {selectedVouchers[order.store.id] && (
                    <>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Giảm giá:</span>
                            <span className="text-green-600">
                                -{formatCurrency(calculateVoucherDiscount(selectedVouchers[order.store.id]!))}
                            </span>
                        </div>
                        
                        {/* Hiển thị chi tiết voucher products */}
                        {selectedVouchers[order.store.id]!.appliesTo === 'PRODUCTS' && 
                         selectedVouchers[order.store.id]!.applicableProductIds && (
                            <div className="ml-4 space-y-1">
                                <p className="text-xs text-gray-500 italic">
                                    Áp dụng cho {selectedVouchers[order.store.id]!.applicableProductIds!.length}/{order.orderItemResponses.length} sản phẩm
                                </p>
                                {selectedVouchers[order.store.id]!.discountType === 'FIXED' && (
                                    <p className="text-xs text-gray-500">
                                        Giảm {formatCurrency(selectedVouchers[order.store.id]!.discountValue)}/sản phẩm
                                    </p>
                                )}
                            </div>
                        )}
                    </>
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
            </div>
        </div>
    </Card>
);
};
export default OrderSection;