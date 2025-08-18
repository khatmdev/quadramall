import React, { useEffect, useState } from 'react';
import CartItemList from '../../mock/Card/CartItemList';
import OrderSummary from './OrderSummary';
import RelatedProducts from '../../mock/Card/RelatedProduct';
import SortDropdown from '../../model/SoftDropdown';
import { getCartItems } from '@/api/cartApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { CartStoreDTO, CartItemDTO } from '@/types/cart/cart';

const CartPage: React.FC = () => {
  const [cartStores, setCartStores] = useState<CartStoreDTO[]>([]);
  const [selectedItems, setSelectedItems] = useState<CartItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchCartData = async () => {
      if (!user?.email) {
        setError('Vui lòng đăng nhập để xem giỏ hàng.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getCartItems();
        setCartStores(data);
      } catch (err) {
        setError('Không thể tải giỏ hàng. Vui lòng thử lại!');
        console.error('Fetch cart error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCartData();
  }, [user?.email]);

  const handleUpdate = (updatedItem: CartItemDTO) => {
    const updatedStores = cartStores.map((store) => ({
      ...store,
      items: store.items.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      ),
    }));
    setCartStores(updatedStores);
    setSelectedItems((prevItems) =>
      prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const handleDelete = (itemId: number) => {
    const updatedStores = cartStores
      .map((store) => ({
        ...store,
        items: store.items.filter((item) => item.id !== itemId),
      }))
      .filter((store) => store.items.length > 0);
    setCartStores(updatedStores);
    setSelectedItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const handleDeleteStore = (storeId: number) => {
    const updatedStores = cartStores.filter((store) => store.store.id !== storeId);
    setCartStores(updatedStores);
    const storeItemIds =
      cartStores
        .find((store) => store.store.id === storeId)
        ?.items.map((item) => item.id) || [];
    setSelectedItems((prevItems) =>
      prevItems.filter((item) => !storeItemIds.includes(item.id))
    );
  };

  const handleSelectionChange = (items: CartItemDTO[]) => {
    setSelectedItems(items);
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="relative">
      <div className="absolute top小米0 left-0 w-full h-[20vh] bg-gray-100 z-0" />
      <div className="container mx-auto px-4 py-8 relative z-10">

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-3/4">
            <CartItemList
              cartStores={cartStores}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onDeleteStore={handleDeleteStore}
              onSelectionChange={handleSelectionChange}
            />
          </div>
          <div className="lg:w-1/4">
            <OrderSummary selectedItems={selectedItems} />
          </div>
        </div>
        <div className="mt-12">
          <RelatedProducts />
        </div>
      </div>
    </div>
  );
};

export default CartPage;
