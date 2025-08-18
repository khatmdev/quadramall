import { api } from '@/main';

export const getCartItems = async () => {
  try {
    const response = await api.get('/cart');
    return response.data;
  } catch (error) {
    console.error('Fetch cart error:', error);
    throw error;
  }
};

export const addToCart = async (productId: number, variantId: number, quantity: number, addonIds: number[]) => {
  try {
    const response = await api.post('/cart/add', {
      productId,
      variantId,
      quantity,
      addonIds,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItemQuantity = async (cartItemId: number, quantity: number) => {
  try {
    const response = await api.put(`/cart/${cartItemId}/quantity`, null, { params: { quantity } });
    return response.data;
  } catch (error) {
    console.error('Error updating quantity:', error);
    throw error;
  }
};

export const deleteCartItem = async (cartItemId: number) => {
  try {
    const response = await api.delete(`/cart/${cartItemId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};


export const deleteCartItemAddon = async (cartItemId: number, addonId: number) => {
  try {
    const response = await api.delete(`/cart/${cartItemId}/addons/${addonId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting addon:', error);
    throw error;
  }
};

export const updateCartItemVariant = async (cartItemId: number, variantId: number, addonIds: number[]) => {
  try {
    const response = await api.put(`/cart/items/${cartItemId}/variant`, {
      variantId,
      addonIds,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating variant:', error);
    throw error;
  }
};
