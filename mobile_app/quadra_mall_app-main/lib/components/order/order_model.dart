import 'package:quarda_mall_home_app/components/order/order_item.dart';

class Order {
  final String shopName;
  final String orderId;
  final List<OrderItem> items;
  final double discount;
  final String status;
  final DateTime orderDate;
  final bool isFreeShipping;
  final double totalPrice; // Giá cuối cùng, đã bao gồm phí vận chuyển (do BE tính)
  final int totalQuantity; // Tổng số lượng sản phẩm

  Order({
    required this.shopName,
    required this.orderId,
    required this.items,
    required this.discount,
    required this.status,
    required this.orderDate,
    required this.isFreeShipping,
    required this.totalPrice,
    required this.totalQuantity,
  });
}

class OrderDetail extends Order {
  final String shippingName;
  final String shippingAddress;
  final double shippingCost; // Chỉ để hiển thị chi tiết, không ảnh hưởng totalPrice
  final String paymentMethod;
  final String paymentStatus;

  OrderDetail({
    required super.shopName,
    required super.orderId,
    required super.items,
    required super.discount,
    required super.status,
    required super.orderDate,
    required super.isFreeShipping,
    required super.totalPrice,
    required super.totalQuantity,
    required this.shippingName,
    required this.shippingAddress,
    required this.shippingCost,
    required this.paymentMethod,
    required this.paymentStatus,
  });
}
