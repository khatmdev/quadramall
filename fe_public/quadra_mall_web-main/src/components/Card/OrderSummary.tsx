import React from 'react';
import { RiDiscountPercentLine } from 'react-icons/ri';
import { CartItemDTO } from '@/types/cart/cart';
import { formatCurrency } from '@/utils/currency';
import { AppDispatch } from '@/store';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSelectedItems, clearBuynowRequest } from '@/store/Order/OrderSlice';

interface OrderSummaryProps {
  selectedItems: CartItemDTO[];
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ selectedItems }) => {
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const discount = 0; // Giả định chưa có khuyến mãi
  const tax = totalPrice * 0.1; // Giả định 10% thuế
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    const selectedItemIds = selectedItems.map(item => ({ id: item.id }));
    
    // Clear any existing buy now request and set selected items
    dispatch(clearBuynowRequest());
    dispatch(setSelectedItems(selectedItemIds));
    
    navigate('/checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 w-full max-w-sm">
      <h2 className="text-base font-semibold mb-1">Tóm tắt đơn hàng</h2>
      <p className="text-sm text-gray-500 mb-4">
        {totalPrice === 0 ? 'Chưa chọn sản phẩm' : `${selectedItems.length} sản phẩm được chọn`}
      </p>
      <hr className="mb-4" />
      <div className="space-y-3 text-sm text-gray-600 mb-4">
        <div className="flex justify-between">
          <span>Tổng giá</span>
          <span>{formatCurrency(totalPrice)}</span>
        </div>
    
      </div>
      <div className="flex justify-between font-semibold text-base mt-2 mb-4">
        <span>Tổng cộng</span>
        <span>{formatCurrency(totalPrice)}</span>
      </div>
    
      <button
        className="w-full bg-green-700 text-white text-sm font-semibold py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
        disabled={totalPrice === 0}
        onClick={handleCheckoutClick}
      >
        Thanh toán
      </button>
    </div>
  );
};

export default OrderSummary;