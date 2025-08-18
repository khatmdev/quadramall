import React, { useState, useMemo, useEffect } from 'react';
import { FaPlus, FaMinus, FaTrash, FaTimes, FaEdit, FaFire, FaClock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItemDTO, CartAddonDTO } from '@/types/cart/cart';
import { updateCartItemQuantity, deleteCartItem, deleteCartItemAddon, updateCartItemVariant } from '@/api/cartApi';
import { formatCurrency } from '@/utils/currency';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {useNavigate} from "react-router-dom";

interface CartItemProps {
  item: CartItemDTO;
  onUpdate: (updatedItem: CartItemDTO) => void;
  onDelete: (itemId: number) => void;
  onCheckboxChange: (isChecked: boolean) => void;
  isChecked: boolean;
  existingVariants: number[]; // Danh sách variantId đã có trong giỏ hàng cho cùng productId
}

// Component đếm ngược thời gian
const FlashSaleCountdown: React.FC<{ endTime: string }> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
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
    <div className="flex items-center gap-1 text-white text-xs font-bold">
      <FaClock className="w-3 h-3" />
      <span>
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

// Component hiển thị progress bar flash sale
const FlashSaleProgress: React.FC<{ soldCount: number; quantity: number }> = ({ soldCount, quantity }) => {
  const percentage = Math.min((soldCount / quantity) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-white font-medium">Đã bán {soldCount}/{quantity}</span>
        <span className="text-xs text-white font-bold">{Math.round(percentage)}%</span>
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

const CartItem: React.FC<CartItemProps> = ({ item, onUpdate, onDelete, onCheckboxChange, isChecked, existingVariants }) => {
  const isOutOfStock = !item.inStock;
  const isNotActive = !item.isActive;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string }>({});

  // Initialize selectedAttributes
  useEffect(() => {
    const currentVariantAttributes = item.variantAttributes.reduce((acc, attr) => ({
      ...acc,
      [attr.attributeName]: attr.attributeValue,
    }), {});
    setSelectedAttributes(currentVariantAttributes);
  }, [item.variantId, item.variantAttributes]);

  // Tạo variantAttributeMap từ allVariantAttributes
  const variantAttributeMap = useMemo(() => {
    const map: { [variantId: number]: { [attrName: string]: string } } = {};
    item.allVariantAttributes?.forEach((detail) => {
      if (detail) {
        const variantId = detail.variantId;
        const attrName = detail.attributeName;
        const attrValue = detail.attributeValue;
        if (!map[variantId]) {
          map[variantId] = {};
        }
        map[variantId][attrName] = attrValue;
      }
    });
    return map;
  }, [item.allVariantAttributes]);

  // Tìm matchingVariantId dựa trên selectedAttributes
  const matchingVariantId = useMemo(() => {
    if (!item.availableAttributes || !item.variants || item.variants.length === 0) {
      return null;
    }

    const allAttributesSelected = item.availableAttributes.every(
      (attr) => selectedAttributes[attr.name]
    );

    if (!allAttributesSelected) {
      return null;
    }

    const matchingVariant = item.variants.find((variant) => {
      const variantAttrs = variantAttributeMap[variant.id];
      if (!variantAttrs) {
        return false;
      }

      return item.availableAttributes.every((attr) => {
        const selectedValue = selectedAttributes[attr.name];
        const variantValue = variantAttrs[attr.name];
        return selectedValue === variantValue;
      });
    });

    return matchingVariant?.id || null;
  }, [selectedAttributes, item.availableAttributes, item.variants, variantAttributeMap]);

  // Kiểm tra xem matchingVariantId có trong giỏ hàng hay không
  const isVariantInCart = useMemo(() => {
    return matchingVariantId !== null && existingVariants.includes(matchingVariantId) && matchingVariantId !== item.variantId;
  }, [matchingVariantId, existingVariants, item.variantId]);

  // Tính giá với flash sale để hiển thị
  const displayPrice = useMemo(() => {
    if (item.flashSale) {
      return item.price * (100 - item.flashSale.percentageDiscount) / 100;
    }
    return item.price;
  }, [item.price, item.flashSale]);

  const handleDecreaseQuantity = async () => {
    if (isOutOfStock || isNotActive) return;

    if (item.quantity > 1) {
      try {
        await updateCartItemQuantity(item.id, item.quantity - 1);
        // totalPrice từ backend đã tính flash sale rồi, chỉ cần cập nhật quantity
        const newTotalPrice = (item.totalPrice / item.quantity) * (item.quantity - 1);
        onUpdate({
          ...item,
          quantity: item.quantity - 1,
          totalPrice: newTotalPrice,
        });
        toast.success(`Giảm số lượng ${item.productName} thành công!`);
      } catch (error) {
        console.error('Error decreasing quantity:', error);
        toast.error('Không thể giảm số lượng. Vui lòng thử lại!');
      }
    }
  };

  const handleIncreaseQuantity = async () => {
    if (isOutOfStock || isNotActive) return;

    try {
      await updateCartItemQuantity(item.id, item.quantity + 1);
      // totalPrice từ backend đã tính flash sale rồi, chỉ cần cập nhật quantity
      const newTotalPrice = (item.totalPrice / item.quantity) * (item.quantity + 1);
      onUpdate({
        ...item,
        quantity: item.quantity + 1,
        totalPrice: newTotalPrice,
      });
      toast.success(`Tăng số lượng ${item.productName} thành công!`);
    } catch (error) {
      console.error('Error increasing quantity:', error);
      toast.error('Không thể tăng số lượng. Vui lòng thử lại!');
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa',
      text: `Bạn có chắc muốn xóa sản phẩm "${item.productName}" khỏi giỏ hàng?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (result.isConfirmed) {
      try {
        await deleteCartItem(item.id);
        onDelete(item.id);
        toast.success(`Đã xóa sản phẩm ${item.productName}!`);
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Không thể xóa sản phẩm. Vui lòng thử lại!');
      }
    }
  };

  const handleRemoveAddon = async (addonId: number, addonName: string) => {
    if (isOutOfStock || isNotActive) return;

    const result = await Swal.fire({
      title: 'Xác nhận xóa',
      text: `Bạn có chắc muốn xóa phụ kiện "${addonName}" khỏi sản phẩm "${item.productName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (result.isConfirmed) {
      try {
        await deleteCartItemAddon(item.id, addonId);
        const updatedAddons = item.addons.filter((addon) => addon.addonId !== addonId);
        // Backend sẽ tính lại totalPrice với flash sale
        const addonPriceToRemove = item.addons.find(a => a.addonId === addonId)?.priceAdjust || 0;
        const newTotalPrice = item.totalPrice - (addonPriceToRemove * item.quantity);
        onUpdate({
          ...item,
          addons: updatedAddons,
          totalPrice: newTotalPrice,
        });
        toast.success(`Đã xóa phụ kiện ${addonName}!`);
      } catch (error) {
        console.error('Error removing addon:', error);
        toast.error('Không thể xóa phụ kiện. Vui lòng thử lại!');
      }
    }
  };

  const handleOpenModal = () => {
    if (isNotActive) return;

    const currentVariantAttributes = item.variantAttributes.reduce((acc, attr) => ({
      ...acc,
      [attr.attributeName]: attr.attributeValue,
    }), {});

    setSelectedAttributes(currentVariantAttributes);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);

    const currentVariantAttributes = item.variantAttributes.reduce((acc, attr) => ({
      ...acc,
      [attr.attributeName]: attr.attributeValue,
    }), {});

    setSelectedAttributes(currentVariantAttributes);
  };

  const handleAttributeChange = (attributeName: string, value: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeName]: value,
    }));
  };

  const handleUpdateVariant = async () => {
    try {
      if (!matchingVariantId) {
        toast.error('Vui lòng chọn đầy đủ các thuộc tính hoặc tổ hợp không hợp lệ!');
        return;
      }

      if (matchingVariantId === item.variantId) {
        toast.info('Bạn chưa thay đổi phân loại nào!');
        return;
      }

      if (isVariantInCart) {
        toast.error('Biến thể này đã có trong giỏ hàng. Vui lòng chọn biến thể khác!');
        return;
      }

      const addonIds = item.addons.map((addon) => addon.addonId);
      const response = await updateCartItemVariant(item.id, matchingVariantId, addonIds);

      onUpdate(response);
      toast.success(`Đã thay đổi phân loại ${item.productName} thành công!`);
      handleCloseModal();
    } catch (error) {
      console.error('Error updating variant:', error);
      toast.error('Không thể thay đổi phân loại. Vui lòng thử lại!');
    }
  };

  const navigate = useNavigate();
  const toProductDetail = (slug : string) => {
    navigate(`/products/${slug}`);
  }

  return (
    <AnimatePresence>
      <div className={`${isNotActive ? 'opacity-40 pointer-events-none' : ''}`}>
        <motion.div
          initial={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3 }}
          className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative ${
            isOutOfStock ? 'opacity-60' : ''
          }`}
        >
          {/* Flash Sale Banner */}
          {item.flashSale && (
            <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1">
                    <FaFire className="w-3 h-3 text-white animate-pulse" />
                    <span className="text-white text-xs font-bold">FLASH SALE -{item.flashSale.percentageDiscount}%</span>
                  </div>
                  <FlashSaleCountdown endTime={item.flashSale.endTime} />
                </div>
                <div className="w-32">
                  <FlashSaleProgress
                    soldCount={item.flashSale.soldCount}
                    quantity={item.flashSale.quantity}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-12 gap-4 items-start p-6">
            <div className="col-span-1 flex justify-center pt-2">
              {isOutOfStock || isNotActive ? (
                <div className="flex items-center justify-center w-20 h-6 bg-gray-100 rounded-md border border-gray-300">
                  <span className="text-xs text-red-700 font-medium">{isNotActive ? 'Không hoạt động' : 'Hết hàng'}</span>
                </div>
              ) : (
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  checked={isChecked}
                  onChange={(e) => onCheckboxChange(e.target.checked)}
                />
              )}
            </div>
            <div className="col-span-5 flex gap-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-20 h-20 rounded-lg object-cover border border-gray-100 shadow-sm cursor-pointer"
                    onClick={() => toProductDetail(item.slug)}
                  />
                  <div
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      isNotActive ? 'bg-red-400' : isOutOfStock ? 'bg-red-400' : 'bg-green-400'
                    }`}
                  ></div>
                  {/* Flash Sale Badge on Image */}
                  {item.flashSale && (
                    <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-lg">
                      -{item.flashSale.percentageDiscount}%
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-base text-gray-900 mb-1 line-clamp-2 cursor-pointer"
                    onClick={() => toProductDetail(item.slug)}>
                  {item.productName}</h4>
                <div
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    item.isActive && item.inStock
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {item.isActive ? (item.inStock ? 'Còn hàng' : 'Hết hàng') : 'Không hoạt động'}
                </div>

                {/* Price Display */}
                <div className="mt-2">
                  {item.flashSale ? (
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-bold text-red-600">{formatCurrency(displayPrice)}</div>
                      <div className="text-sm text-gray-500 line-through">{formatCurrency(item.price)}</div>
                    </div>
                  ) : (
                    <div className="text-lg font-bold text-green-600">{formatCurrency(item.price)}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-span-2 bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
              <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Biến thể</div>
              <div className="bg-white px-3 py-2 rounded-md text-sm font-semibold text-gray-800 border border-gray-200 shadow-sm">
                {item.variantAttributeNames}
              </div>
              {item.availableAttributes.length > 0 && !isNotActive && (
                <button
                  onClick={handleOpenModal}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1"
                >
                  <FaEdit className="w-3 h-3" />
                  Thay đổi phân loại
                </button>
              )}
            </div>
            <div className="col-span-2 bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
              <div className="text-xs text-blue-600 mb-2 font-medium uppercase tracking-wide">Số lượng</div>
              <div className={`flex items-center justify-center border border-gray-300 rounded-lg bg-white shadow-sm ${isNotActive || isOutOfStock ? 'opacity-50' : ''}`}>
                <button
                  onClick={handleDecreaseQuantity}
                  className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 rounded-l-lg"
                >
                  <FaMinus className="w-3 h-3" />
                </button>
                <div className="flex items-center justify-center w-10 h-8 text-base font-bold text-gray-800 bg-gray-50 border-x border-gray-300">
                  {item.quantity}
                </div>
                <button
                  onClick={handleIncreaseQuantity}
                  className="flex items-center justify-center w-8 h-8 text-green-500 hover:text-green-600 hover:bg-green-50 transition-all duration-200 rounded-r-lg"
                >
                  <FaPlus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="col-span-1 bg-green-50 rounded-lg p-3 text-center border border-green-100">
              <div className="text-xs text-green-600 mb-1 font-medium uppercase tracking-wide">Tổng</div>
              <div className="text-base font-bold text-green-700">{formatCurrency(item.totalPrice)}</div>
            </div>
            <div className="col-span-1 flex justify-center">
              <div className="pointer-events-auto">
                <button
                  onClick={handleDelete}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all duration-200 group shadow-sm"
                >
                  <FaTrash className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                </button>
              </div>
            </div>
          </div>

          {item.addons && item.addons.length > 0 && (
            <div className={`border-t border-gray-100 bg-gray-50 ${isOutOfStock ? 'opacity-50' : ''}`}>
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 font-semibold">
                  <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <span>Phụ kiện đi kèm</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <AnimatePresence>
                    {item.addons.map((addon: CartAddonDTO) => (
                      <motion.div
                        key={addon.addonId}
                        initial={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                          <span className="text-sm text-gray-700 font-medium">{addon.addonName}</span>
                          {addon.priceAdjust !== 0 && (
                            <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-200">
                              {addon.priceAdjust > 0 ? '+' : ''}{formatCurrency(addon.priceAdjust)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveAddon(addon.addonId, addon.addonName)}
                          className="p-1 hover:bg-red-100 rounded-full transition-all duration-200 group"
                        >
                          <FaTimes className="w-3 h-3 text-gray-400 group-hover:text-red-500" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-lg p-6 w-full max-w-md"
              >
                <h3 className="text-lg font-semibold mb-4">Thay đổi phân loại sản phẩm</h3>
                <div className="space-y-4">
                  {item.availableAttributes.map((attr) => (
                    <div key={attr.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{attr.name}</label>
                      <div className="flex flex-wrap gap-2">
                        {attr.values.map((value) => {
                          const isSelected = selectedAttributes[attr.name] === value;

                          return (
                            <button
                              key={value}
                              onClick={() => handleAttributeChange(attr.name, value)}
                              className={`px-3 py-1 rounded-md text-sm font-medium border transition-all duration-200 ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-200'
                              }`}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Variant hiện tại:</span> {item.variantId}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Variant mới:</span> {matchingVariantId || 'Chưa chọn đủ thuộc tính'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Thuộc tính đã chọn:</span> {Object.values(selectedAttributes).join(', ') || 'Chưa chọn'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Có thể chọn:</span> {
                    item.availableAttributes.map(attr =>
                      `${attr.name}: [${attr.values.join(', ')}]`
                    ).join(' | ')
                  }
                  </div>
                  {isVariantInCart && (
                    <div className="text-sm text-red-600 mt-2 font-medium">
                      Biến thể này đã có trong giỏ hàng. Vui lòng chọn biến thể khác!
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUpdateVariant}
                    className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                      matchingVariantId && matchingVariantId !== item.variantId && !isVariantInCart
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!matchingVariantId || matchingVariantId === item.variantId || isVariantInCart}
                  >
                    Cập nhật
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CartItem;
