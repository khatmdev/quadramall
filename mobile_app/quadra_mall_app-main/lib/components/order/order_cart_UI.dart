import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/components/order/order_detail_data.dart';
import 'package:quarda_mall_home_app/components/order/order_model.dart';
import 'package:quarda_mall_home_app/screens/order_detail_screen.dart';
import '../../utils/formater.dart';

class OrderCard extends StatelessWidget {
  final Order order;
  const OrderCard({super.key, required this.order});

  String _secondaryLabel() {
    switch (order.status) {
      case 'PENDING':    return 'Hủy đơn';
      case 'CONFIRMED':  return '';
      case 'SHIPPING':   return 'Xem lộ trình';
      case 'DELIVERED':  return 'Đã nhận hàng';
      case 'COMPLETED':  return 'Đánh giá';
      case 'CANCELLED':  return 'Mua lại';
      default:           return '';
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
        icon = Icons.verified; // hoặc Icons.handshake nếu bạn thích
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
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: color),
          SizedBox(width: 6),
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
    final totalQ = order.items.fold<int>(0, (s, i) => s + i.quantity);
    final totalP = order.items.fold<double>(0.0, (s, i) => s + i.price * i.quantity) - order.discount;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Shop + status
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(children: [
                  // fix asset: nếu asset không có, hiển thị icon
                  Image.asset(
                    'assets/shop.png',
                    width: 20, height: 20,
                    errorBuilder: (_, __, ___) => const Icon(Icons.store, size: 20),
                  ),
                  const SizedBox(width: 6),
                  Text(order.shopName, style: const TextStyle(fontWeight: FontWeight.bold)),
                ]),
                _buildStatusChip(order.status),
              ],
            ),
            const Divider(height: 16),

            // Mỗi OrderItem
            ...order.items.map((it) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Row(children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: Image.asset(
                        it.imageUrl,
                        width: 60,
                        height: 60,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Icon(Icons.image_outlined, size: 60),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Tên + variant
                        Text(it.itemName,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                        if (it.variant != null) ...[
                          const SizedBox(height: 2),
                          Text(it.variant!,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                        ],
                        const SizedBox(height: 6),
                        // price left, qty right
                        Row(children: [
                          Text(
                            Formatter.formatCurrencyWithSymbol(it.price),
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                          ),
                          const Spacer(),
                          Text(
                            'x${it.quantity}',
                            style: TextStyle(color: Colors.grey[700], fontSize: 13),
                          ),
                        ]),
                      ],
                    ),
                  ),
                ]),
              );
            }),

            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerRight,
              child: Text.rich(
                TextSpan(
                  children: [
                    TextSpan(
                      text: 'Tổng cộng ($totalQ sản phẩm): ',
                      style: TextStyle(color: Colors.blueGrey.shade700,),
                    ),
                    TextSpan(
                      text: Formatter.formatCurrencyWithSymbol(totalP),
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: Colors.black, // màu bạn muốn tô
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TextButton(
                  onPressed: () {
                    // Tìm OrderDetail tương ứng với Order
                    final orderDetail = orderDetails.firstWhere(
                          (detail) => detail.orderId == order.orderId,
                      orElse: () => throw Exception('OrderDetail not found for orderId: ${order.orderId}'),
                    );
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => OrderDetailScreen(orderDetail: orderDetail),
                      ),
                    );
                  },
                  style: TextButton.styleFrom(
                    foregroundColor: Colors.blueGrey.shade600,
                  ),
                  child: const Text('Xem chi tiết'),
                ),
                const SizedBox(width: 8),
                if (_secondaryLabel().isNotEmpty)
                  OutlinedButton(
                      onPressed: () {/*action*/},
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        foregroundColor: Colors.green.shade600,
                        overlayColor: Colors.green,
                          side: BorderSide(color: Colors.green.shade600),
                      ),
                      child: Text(_secondaryLabel())
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

