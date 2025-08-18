import 'package:quarda_mall_home_app/components/order/order_model.dart';
import 'package:quarda_mall_home_app/components/order/order_data.dart';

// Hàm tạo dữ liệu bổ sung cho OrderDetail
List<Map<String, dynamic>> generateOrderDetailExtras(List<Order> orders) {
  final List<String> names = [
    "Nguyễn Văn A",
    "Trần Thị B",
    "Lê Văn C",
    "Phạm Thị D",
    "Hoàng Văn E",
    "Nguyễn Thị F",
    "Trần Văn G",
    "Lê Thị H",
  ];
  final List<String> addresses = [
    "123 Đường Láng, Đống Đa, Hà Nội",
    "456 Lê Lợi, Quận 1, TP.HCM",
    "789 Nguyễn Huệ, Huế",
    "101 Trần Phú, Nha Trang",
    "202 Hai Bà Trưng, Đà Lạt",
    "303 Kim Mã, Ba Đình, Hà Nội",
    "404 Lý Thường Kiệt, Cần Thơ",
    "505 Nguyễn Trãi, Thanh Xuân, Hà Nội",
  ];
  final List<String> paymentMethods = [
    "Credit Card",
    "Cash on Delivery",
    "Bank Transfer",
  ];

  return List.generate(orders.length, (index) {
    final status = orders[index].status;
    return {
      'shippingName': names[index % names.length],
      'shippingAddress': addresses[index % addresses.length],
      'shippingCost': orders[index].isFreeShipping ? 0.0 : (15000 + index * 5000).toDouble(),
      'paymentMethod': paymentMethods[index % paymentMethods.length],
      'paymentStatus': status == "CANCELLED"
          ? "Refunded"
          : (status == "DELIVERED" || status == "COMPLETED")
          ? "Paid"
          : "Pending",
    };
  });
}

// Tạo danh sách orderDetails từ orders và generateOrderDetailExtras
final List<OrderDetail> orderDetails = List.generate(
  orders.length,
      (index) => OrderDetail(
    shopName: orders[index].shopName,
    orderId: orders[index].orderId,
    items: orders[index].items,
    discount: orders[index].discount,
    status: orders[index].status,
    orderDate: orders[index].orderDate,
    isFreeShipping: orders[index].isFreeShipping,
    totalPrice: orders[index].totalPrice,
    totalQuantity: orders[index].totalQuantity,
    shippingName: generateOrderDetailExtras(orders)[index]['shippingName'] as String,
    shippingAddress: generateOrderDetailExtras(orders)[index]['shippingAddress'] as String,
    shippingCost: generateOrderDetailExtras(orders)[index]['shippingCost'] as double,
    paymentMethod: generateOrderDetailExtras(orders)[index]['paymentMethod'] as String,
    paymentStatus: generateOrderDetailExtras(orders)[index]['paymentStatus'] as String,
  ),
);