import React, { useState, useMemo } from 'react';
import { FaFire, FaTag } from 'react-icons/fa';
import CartItem from '../../components/Card/CartItem';
import { CartStoreDTO, CartItemDTO } from '@/types/cart/cart';
import { deleteCartItem } from '@/api/cartApi';
import { formatCurrency } from '@/utils/currency';
import { toast } from 'react-toastify';

interface CartItemListProps {
  cartStores: CartStoreDTO[];
  onUpdate: (updatedItem: any) => void;
  onDelete: (itemId: number) => void;
  onDeleteStore: (storeId: number) => void;
  onSelectionChange: (selectedItems: CartItemDTO[]) => void;
}

const CartItemList: React.FC<CartItemListProps> = ({ cartStores, onUpdate, onDelete, onDeleteStore, onSelectionChange }) => {
  const [selectedItems, setSelectedItems] = useState<CartItemDTO[]>([]);

  // Tạo danh sách variantId cho mỗi productId
  const variantIdsByProduct = useMemo(() => {
    const map: { [productId: number]: number[] } = {};
    cartStores.forEach((store) => {
      store.items.forEach((item) => {
        if (!map[item.productId]) {
          map[item.productId] = [];
        }
        if (!map[item.productId].includes(item.variantId)) {
          map[item.productId].push(item.variantId);
        }
      });
    });
    return map;
  }, [cartStores]);

  // Tính toán thống kê Flash Sale cho mỗi store
  const storeFlashSaleStats = useMemo(() => {
    const stats: { [storeId: number]: { flashSaleCount: number; totalSavings: number; originalTotal: number; discountedTotal: number } } = {};

    cartStores.forEach((store) => {
      let flashSaleCount = 0;
      let totalSavings = 0;
      let originalTotal = 0;
      let discountedTotal = 0;

      store.items.forEach((item) => {
        if (item.isActive) {
          const itemOriginalPrice = item.price * item.quantity;
          const itemAddonPrice = item.addons.reduce((sum, addon) => sum + addon.priceAdjust, 0) * item.quantity;

          originalTotal += itemOriginalPrice + itemAddonPrice;
          discountedTotal += item.totalPrice;

          if (item.flashSale) {
            flashSaleCount++;
            const discountAmount = (item.price * item.flashSale.percentageDiscount / 100) * item.quantity;
            totalSavings += discountAmount;
          }
        }
      });

      stats[store.store.id] = {
        flashSaleCount,
        totalSavings,
        originalTotal,
        discountedTotal
      };
    });

    return stats;
  }, [cartStores]);

  // Tách sản phẩm thành hoạt động và không hoạt động
  const activeStores: CartStoreDTO[] = cartStores
    .map((store) => ({
      ...store,
      items: store.items.filter((item) => item.isActive),
    }))
    .filter((store) => store.items.length > 0);

  const inactiveItems: CartItemDTO[] = cartStores
    .flatMap((store) => store.items.filter((item) => !item.isActive));

  const handleCheckboxChange = (item: CartItemDTO, isChecked: boolean) => {
    if (!item.isActive) return; // Không cho phép chọn sản phẩm không hoạt động
    let updatedSelection: CartItemDTO[];
    if (isChecked) {
      updatedSelection = [...selectedItems, item];
    } else {
      updatedSelection = selectedItems.filter((selectedItem) => selectedItem.id !== item.id);
    }
    setSelectedItems(updatedSelection);
    onSelectionChange(updatedSelection);
  };

  const handleSelectAll = (store: CartStoreDTO, isChecked: boolean) => {
    let updatedSelection: CartItemDTO[];
    if (isChecked) {
      const storeItems = store.items.filter(
        (item) => !selectedItems.some((selected) => selected.id === item.id) && item.isActive
      );
      updatedSelection = [...selectedItems, ...storeItems];
    } else {
      updatedSelection = selectedItems.filter(
        (selectedItem) => !store.items.some((item) => item.id === selectedItem.id)
      );
    }
    setSelectedItems(updatedSelection);
    onSelectionChange(updatedSelection);
  };

  const handleDeleteAll = async (store: CartStoreDTO) => {
    if (window.confirm(`Bạn có chắc muốn xóa tất cả ${store.items.length} sản phẩm của ${store.store.name}?`)) {
      try {
        await Promise.all(store.items.map((item) => deleteCartItem(item.id)));
        onDeleteStore(store.store.id);
        toast.success(`Đã xóa tất cả sản phẩm của ${store.store.name}!`, {
          position: 'top-right',
          autoClose: 3000,
        });
      } catch (error) {
        console.error('Error deleting all items:', error);
        toast.error('Không thể xóa tất cả sản phẩm. Vui lòng thử lại!', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    }
  };

  if (!cartStores || (activeStores.length === 0 && inactiveItems.length === 0)) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 text-center">
        <div className="text-gray-500 text-lg">Giỏ hàng trống.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sản phẩm hoạt động (nhóm theo store) */}
      {activeStores.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Giỏ hàng</h2>
          {activeStores.map((cartStore) => {
            const stats = storeFlashSaleStats[cartStore.store.id];

            return (
              <div key={cartStore.store.id} className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden mb-6">
                <div className="bg-gray-50 border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        onChange={(e) => handleSelectAll(cartStore, e.target.checked)}
                        checked={cartStore.items.every((item) =>
                          selectedItems.some((selected) => selected.id === item.id)
                        )}
                      />
                      <img
                        src={cartStore.store.image}
                        alt={cartStore.store.name}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                      />
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{cartStore.store.name}</h2>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{cartStore.items.length} sản phẩm</span>
                          {stats.flashSaleCount > 0 && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1 text-red-600 font-medium">
                                <FaFire className="w-3 h-3" />
                                <span>{stats.flashSaleCount} Flash Sale</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Hiển thị tổng tiết kiệm */}
                      {stats.totalSavings > 0 && (
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Tiết kiệm</div>
                          <div className="text-red-600 font-bold flex items-center gap-1">
                            <FaTag className="w-3 h-3" />
                            {formatCurrency(stats.totalSavings)}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => handleDeleteAll(cartStore)}
                        className="text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-1 rounded hover:bg-red-50"
                      >
                        Xóa tất cả
                      </button>
                    </div>
                  </div>

                  {/* Flash Sale Summary Bar */}
                  {stats.flashSaleCount > 0 && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-red-600 font-semibold">
                            <FaFire className="w-4 h-4 animate-pulse" />
                            <span>Flash Sale đang diễn ra!</span>
                          </div>
                          <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                            {stats.flashSaleCount} sản phẩm
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Tổng giá trị đơn hàng</div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 line-through text-sm">{formatCurrency(stats.originalTotal)}</span>
                            <span className="text-green-600 font-bold">{formatCurrency(stats.discountedTotal)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="space-y-4">
                    {cartStore.items.map((item, itemIndex) => (
                      <div key={item.id}>
                        <CartItem
                          item={item}
                          onUpdate={onUpdate}
                          onDelete={onDelete}
                          onCheckboxChange={(isChecked) => handleCheckboxChange(item, isChecked)}
                          isChecked={selectedItems.some((selected) => selected.id === item.id)}
                          existingVariants={variantIdsByProduct[item.productId] || []}
                        />
                        {itemIndex < cartStore.items.length - 1 && (
                          <div className="my-4 border-t border-gray-100"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sản phẩm không hoạt động (không nhóm theo store) */}
      {inactiveItems.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-red-700">Danh sách sản phẩm không hoạt động</h2>
          <div className="space-y-4">
            {inactiveItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
                <CartItem
                  item={item}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onCheckboxChange={(isChecked) => handleCheckboxChange(item, isChecked)}
                  isChecked={false}
                  existingVariants={variantIdsByProduct[item.productId] || []}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartItemList;
