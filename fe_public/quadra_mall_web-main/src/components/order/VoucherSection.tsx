import { useState } from 'react';
import { Ticket, ChevronRight, X, ShoppingBag, Tag } from 'lucide-react';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import type { DiscountCodeDTO, OrderItem } from '@/types/Order/interface';
import { formatCurrency } from '@/utils/utils';

interface VoucherSectionProps {
    selectedVoucher: DiscountCodeDTO | null;
    availableVouchers: DiscountCodeDTO[];
    onSelect: (voucher: DiscountCodeDTO | null) => void;
    orderAmount: number;
    orderItems?: OrderItem[]; // Danh sách sản phẩm trong order
}

export const VoucherSection: React.FC<VoucherSectionProps> = ({
    selectedVoucher,
    availableVouchers,
    onSelect,
    orderAmount,
    orderItems = []
}) => {
    const [showModal, setShowModal] = useState(false);
    const [manualCode, setManualCode] = useState('');

    // Tính toán giảm giá dựa trên loại voucher
    const calculateDiscount = (voucher: DiscountCodeDTO): number => {
    // Nếu voucher áp dụng cho toàn shop
    if (voucher.appliesTo === 'SHOP') {
        if (voucher.discountType === 'PERCENTAGE') {
            const discount = (orderAmount * voucher.discountValue) / 100;
            return voucher.maxDiscountValue 
                ? Math.min(discount, voucher.maxDiscountValue)
                : discount;
        } else {
            // FIXED cho toàn shop
            return Math.min(voucher.discountValue, orderAmount);
        }
    }
    
    // Nếu voucher chỉ áp dụng cho products cụ thể
    if (voucher.appliesTo === 'PRODUCTS' && voucher.applicableProductIds && voucher.applicableProductIds.length > 0) {
        const applicableItems = orderItems.filter(item => 
            voucher.applicableProductIds?.includes(item.productVariant.product.id)
        );
        
        if (applicableItems.length === 0) {
            return 0;
        }
        
        if (voucher.discountType === 'PERCENTAGE') {
            // Tính theo tổng giá trị sản phẩm được áp dụng
            const applicableAmount = applicableItems.reduce((sum, item) => sum + item.totalItemPrice, 0);
            const discount = (applicableAmount * voucher.discountValue) / 100;
            return voucher.maxDiscountValue 
                ? Math.min(discount, voucher.maxDiscountValue)
                : discount;
        } else {
            // FIXED_AMOUNT cho products - Giảm cho MỖI sản phẩm instance
            const discountPerProduct = voucher.discountValue;
            let totalDiscount = 0;
            
            // Tính giảm giá cho từng sản phẩm instance (theo quantity)
            applicableItems.forEach(item => {
                // Giảm giá không vượt quá giá sản phẩm cho mỗi instance
                const itemDiscount = Math.min(discountPerProduct, item.priceAtTime);
                totalDiscount += itemDiscount * item.quantity;
            });
            
            return totalDiscount;
        }
    }
    
    return 0;
};

    // Kiểm tra voucher có thể áp dụng không
    const isVoucherApplicable = (voucher: DiscountCodeDTO): boolean => {
        // Kiểm tra minimum order amount
        if (orderAmount < voucher.minOrderAmount) {
            return false;
        }
        
        // Nếu là voucher cho products cụ thể, kiểm tra có sản phẩm nào được áp dụng không
        if (voucher.appliesTo === 'PRODUCTS') {
            // Nếu không có applicableProductIds hoặc rỗng => không áp dụng được
            return voucher.applicableProductIds ? voucher.applicableProductIds.length > 0 : false;
        }
        
        return true;
    };

    // Format mô tả voucher
    const formatVoucherDescription = (voucher: DiscountCodeDTO): string => {
        let desc = '';
        
        if (voucher.discountType === 'PERCENTAGE') {
            desc = `Giảm ${voucher.discountValue}%`;
            if (voucher.maxDiscountValue) {
                desc += ` (tối đa ${formatCurrency(voucher.maxDiscountValue)})`;
            }
        } else {
            // FIXED amount
            if (voucher.appliesTo === 'PRODUCTS') {
                desc = `Giảm ${formatCurrency(voucher.discountValue)}/sản phẩm`;
            } else {
                desc = `Giảm ${formatCurrency(voucher.discountValue)}`;
            }
        }
        
        desc += ` cho đơn từ ${formatCurrency(voucher.minOrderAmount)}`;
        
        // Thêm thông tin về sản phẩm áp dụng nếu có
        if (voucher.appliesTo === 'PRODUCTS' && voucher.productNames && voucher.productNames.length > 0) {
            const productCount = voucher.productNames.length;
            if (productCount <= 2) {
                desc += ` - Áp dụng cho: ${voucher.productNames.join(', ')}`;
            } else {
                desc += ` - Áp dụng cho ${productCount} sản phẩm`;
            }
            
            // Thêm thông tin về cách tính
            if (voucher.discountType !== 'PERCENTAGE') {
                desc += ` (giảm cho mỗi sản phẩm)`;
            }
        }
        
        return desc;
    };

    // Lấy thông tin sản phẩm được áp dụng trong order
    const getApplicableProductsInfo = (voucher: DiscountCodeDTO): string => {
        if (voucher.appliesTo !== 'PRODUCTS' || !voucher.applicableProductIds) {
            return '';
        }
        
        const applicableItems = orderItems.filter(item => 
            voucher.applicableProductIds?.includes(item.productVariant.product.id)
        );
        
        if (applicableItems.length === 0) {
            return 'Không có sản phẩm nào trong đơn hàng được áp dụng';
        }
        
        const totalApplicableAmount = applicableItems.reduce((sum, item) => sum + item.totalItemPrice, 0);
        return `Áp dụng cho ${applicableItems.length} sản phẩm (${formatCurrency(totalApplicableAmount)})`;
    };

    // Lấy danh sách sản phẩm được áp dụng
    const getApplicableProducts = (voucher: DiscountCodeDTO): OrderItem[] => {
        if (voucher.appliesTo !== 'PRODUCTS' || !voucher.applicableProductIds) {
            return orderItems;
        }
        
        return orderItems.filter(item => 
            voucher.applicableProductIds?.includes(item.productVariant.product.id)
        );
    };

    // Xử lý áp dụng mã thủ công
    const handleManualCodeApply = () => {
        const voucher = availableVouchers.find(v => v.code === manualCode.toUpperCase());
        if (voucher) {
            if (isVoucherApplicable(voucher)) {
                onSelect(voucher);
                setShowModal(false);
                setManualCode('');
            } else {
                let errorMsg = 'Mã giảm giá không thể áp dụng. ';
                if (voucher.appliesTo === 'PRODUCTS' && (!voucher.applicableProductIds || voucher.applicableProductIds.length === 0)) {
                    errorMsg += 'Không có sản phẩm nào trong đơn hàng được áp dụng mã này.';
                } else if (orderAmount < voucher.minOrderAmount) {
                    errorMsg += `Đơn hàng cần tối thiểu ${formatCurrency(voucher.minOrderAmount)}.`;
                }
                alert(errorMsg);
            }
        } else {
            alert('Mã giảm giá không hợp lệ hoặc không khả dụng');
        }
    };

    return (
        <>
            <div onClick={() => setShowModal(true)}>
                <Card className="p-4 mb-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <Ticket className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">Mã giảm giá</h3>
                                {selectedVoucher ? (
                                    <div>
                                        <p className="text-sm text-green-600 font-medium">
                                            {selectedVoucher.code} - Giảm {formatCurrency(calculateDiscount(selectedVoucher))}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {selectedVoucher.description || formatVoucherDescription(selectedVoucher)}
                                        </p>
                                        {selectedVoucher.appliesTo === 'PRODUCTS' && (
                                            <p className="text-xs text-blue-600 mt-1">
                                                {getApplicableProductsInfo(selectedVoucher)}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        {availableVouchers.length > 0 
                                            ? `${availableVouchers.length} mã giảm giá khả dụng`
                                            : 'Chọn hoặc nhập mã giảm giá'}
                                    </p>
                                )}
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                </Card>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Chọn mã giảm giá</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Manual code input */}
                        <div className="mb-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Nhập mã giảm giá"
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <Button
                                    onClick={handleManualCodeApply}
                                    disabled={!manualCode}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    Áp dụng
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <h4 className="font-semibold text-gray-700 mb-3">Mã giảm giá khả dụng</h4>
                            
                            {availableVouchers.length === 0 ? (
                                <div className="text-center py-8">
                                    <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">Không có mã giảm giá khả dụng</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {availableVouchers.map((voucher) => {
                                        const applicable = isVoucherApplicable(voucher);
                                        const discount = calculateDiscount(voucher);
                                        
                                        return (
                                            <div
                                                key={voucher.id}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                    selectedVoucher?.id === voucher.id
                                                        ? 'border-green-500 bg-green-50'
                                                        : applicable
                                                        ? 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                                                        : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                                                }`}
                                                onClick={() => {
                                                    if (applicable) {
                                                        onSelect(voucher);
                                                        setShowModal(false);
                                                    }
                                                }}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-lg ${
                                                        applicable ? 'bg-green-100' : 'bg-gray-200'
                                                    }`}>
                                                        <Ticket className={`w-5 h-5 ${
                                                            applicable ? 'text-green-600' : 'text-gray-400'
                                                        }`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h5 className="font-semibold text-gray-800">
                                                                    {voucher.code}
                                                                </h5>
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    {voucher.description || formatVoucherDescription(voucher)}
                                                                </p>
                                                                
                                                                {/* Hiển thị thông tin sản phẩm áp dụng */}
                                                                {voucher.appliesTo === 'PRODUCTS' && (
                                                                    <div className="mt-2">
                                                                        <p className="text-xs text-blue-600">
                                                                            {getApplicableProductsInfo(voucher)}
                                                                        </p>
                                                                        {voucher.applicableProductIds && voucher.applicableProductIds.length > 0 && (
                                                                            <div className="flex items-center gap-1 mt-1">
                                                                                <ShoppingBag className="w-3 h-3 text-gray-400" />
                                                                                <span className="text-xs text-gray-500">
                                                                                    Áp dụng cho {voucher.applicableProductIds.length}/{orderItems.length} sản phẩm
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {/* Hiển thị tên sản phẩm nếu ít */}
                                                                        {voucher.productNames && voucher.productNames.length <= 3 && (
                                                                            <div className="mt-1 flex flex-wrap gap-1">
                                                                                {voucher.productNames.map((name, idx) => (
                                                                                    <span key={idx} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                                                                        <Tag className="w-3 h-3" />
                                                                                        {name}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                                        applicable 
                                                                            ? 'bg-green-100 text-green-700'
                                                                            : 'bg-gray-100 text-gray-500'
                                                                    }`}>
                                                                        {applicable 
                                                                            ? `Giảm ${formatCurrency(discount)}`
                                                                            : voucher.appliesTo === 'PRODUCTS' && (!voucher.applicableProductIds || voucher.applicableProductIds.length === 0)
                                                                                ? 'Không có sản phẩm áp dụng'
                                                                                : `Đơn tối thiểu ${formatCurrency(voucher.minOrderAmount)}`
                                                                        }
                                                                    </span>
                                                                    {voucher.usedCount < voucher.maxUses && (
                                                                        <span className="text-xs text-gray-500">
                                                                            Còn {voucher.maxUses - voucher.usedCount} lượt
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Thông tin thêm */}
                                                        <div className="flex items-center justify-between mt-2">
                                                            <p className="text-xs text-gray-500">
                                                                HSD: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                                                            </p>
                                                            {voucher.appliesTo === 'SHOP' && (
                                                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                                                    Toàn shop
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t">
                            {selectedVoucher && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        onSelect(null);
                                        setShowModal(false);
                                    }}
                                    className="flex-1"
                                >
                                    Bỏ chọn
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={() => setShowModal(false)}
                                className="flex-1"
                            >
                                Đóng
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};