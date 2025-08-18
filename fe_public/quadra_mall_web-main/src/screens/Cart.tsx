import React from 'react';
import CartPage from '@/components/Card/CartPage';
import ShoppingCartLayout from '@/components/Card/ShoppingCartLayout';


const Cart: React.FC = () => {
  return (
    <ShoppingCartLayout>
      <CartPage />
    </ShoppingCartLayout>
  );
};

export default Cart;
