import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/components/order/order_model.dart';
import '../../utils/formater.dart';

class OrderDetailScreen extends StatelessWidget {
  final OrderDetail orderDetail;

  const OrderDetailScreen({super.key, required this.orderDetail});

  String _secondaryLabel() {
    switch (orderDetail.status) {
      case 'PENDING':
        return 'Hủy đơn';
      case 'CONFIRMED':
        return '';
      case 'SHIPPING':
        return 'Xem lộ trình';
      case 'DELIVERED':
        return 'Đã nhận hàng';
      case 'COMPLETED':
        return 'Đánh giá';
      case 'CANCELLED':
        return 'Mua lại';
      default:
        return '';
    }
  }

  Widget _buildStatusChip(String status) {
    Color color;
    String text;
    IconData icon;

    switch (status) {
      case 'PENDING':
        color = Colors.orange.shade700;
        text = 'Chờ xử lý';
        icon = Icons.hourglass_empty;
        break;
      case 'CONFIRMED':
        color = Colors.blue;
        text = 'Đã xác nhận';
        icon = Icons.verified;
        break;
      case 'SHIPPING':
        color = Colors.indigo.shade600;
        text = 'Đang giao hàng';
        icon = Icons.local_shipping;
        break;
      case 'DELIVERED':
        color = Colors.teal.shade600;
        text = 'Đã giao hàng';
        icon = Icons.home;
        break;
      case 'COMPLETED':
        color = Colors.green.shade600;
        text = 'Hoàn thành';
        icon = Icons.done_all;
        break;
      case 'CANCELLED':
        color = Colors.red.shade600;
        text = 'Đã hủy/Hoàn tiền';
        icon = Icons.cancel;
        break;
      default:
        color = Colors.grey.shade600;
        text = 'Không xác định';
        icon = Icons.help;
    }

    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: color),
        borderRadius: BorderRadius.circular(5),
        color: color.withAlpha(50),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(width: 6),
          Text(
            text,
            style: TextStyle(color: color, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        foregroundColor: Colors.green,
        title: Text('Chi tiết đơn hàng #${orderDetail.orderId}', style: TextStyle(fontWeight: FontWeight.bold),),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Shop + status
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Image.asset(
                        'assets/shop.png',
                        width: 20,
                        height: 20,
                        errorBuilder: (_, __, ___) => const Icon(Icons.store, size: 20),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        orderDetail.shopName,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  _buildStatusChip(orderDetail.status),
                ],
              ),
              const Divider(height: 16),

              // Danh sách OrderItem
              ...orderDetail.items.map((it) {
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  child: Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(6),
                        child: Image.asset(
                          it.imageUrl,
                          width: 60,
                          height: 60,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                          const Icon(Icons.image_outlined, size: 60),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              it.itemName,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                  fontSize: 14, fontWeight: FontWeight.w500),
                            ),
                            if (it.variant != null) ...[
                              const SizedBox(height: 2),
                              Text(
                                it.variant!,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                    color: Colors.grey[600], fontSize: 13),
                              ),
                            ],
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                Text(
                                  Formatter.formatCurrencyWithSymbol(it.price),
                                  style: const TextStyle(
                                      fontSize: 14, fontWeight: FontWeight.w600),
                                ),
                                const Spacer(),
                                Text(
                                  'x${it.quantity}',
                                  style: TextStyle(
                                      color: Colors.grey[700], fontSize: 13),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              }),

              const SizedBox(height: 12),
              const Divider(height: 16),

              // Thông tin chi tiết bổ sung của OrderDetail
              const Text(
                'Thông tin giao hàng',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 8),
              _buildDetailRow('Tên người nhận', orderDetail.shippingName),
              _buildDetailRow('Địa chỉ giao hàng', orderDetail.shippingAddress),
              _buildDetailRow(
                'Phí vận chuyển',
                Formatter.formatCurrencyWithSymbol(orderDetail.shippingCost),
              ),

              const SizedBox(height: 12),
              const Divider(height: 16),

              // Thông tin thanh toán
              const Text(
                'Thông tin thanh toán',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 8),
              _buildDetailRow('Phương thức thanh toán', orderDetail.paymentMethod),
              _buildDetailRow('Trạng thái thanh toán', orderDetail.paymentStatus),
              _buildDetailRow(
                'Giảm giá',
                Formatter.formatCurrencyWithSymbol(orderDetail.discount),
              ),
              _buildDetailRow(
                'Tổng cộng (${orderDetail.totalQuantity} sản phẩm)',
                Formatter.formatCurrencyWithSymbol(orderDetail.totalPrice),
                isBold: true,
              ),

              const SizedBox(height: 16),
              // Nút hành động
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    style: TextButton.styleFrom(
                      foregroundColor: Colors.blueGrey.shade600,
                    ),
                    child: const Text('Quay lại'),
                  ),
                  if (_secondaryLabel().isNotEmpty)
                    OutlinedButton(
                      onPressed: () {
                        // Thực hiện hành động dựa trên _secondaryLabel
                      },
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        foregroundColor: Colors.green.shade600,
                        side: BorderSide(color: Colors.green.shade600),
                      ),
                      child: Text(_secondaryLabel()),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '$label: ',
            style: TextStyle(
              color: Colors.grey[600],
              fontWeight: isBold ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                color: Colors.black,
                fontWeight: isBold ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ),
        ],
      ),
    );
  }
}