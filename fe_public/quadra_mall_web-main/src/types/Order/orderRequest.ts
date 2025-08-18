export interface OrderRequest {
    addressId: number; // ID địa chỉ giao hàng
    shippingMethod: string; // Phương thức vận chuyển
    paymentMethod: string; // Phương thức thanh toán
    voucherIds?: { [key: number]: number }; // { orderId: voucherId } - optional object
    orderIds: number[]; // Danh sách ID đơn hàng
    notes?: { [key: number]: string }; // { orderId: note } - optional object
}