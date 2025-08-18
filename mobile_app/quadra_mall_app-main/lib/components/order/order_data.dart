import 'package:quarda_mall_home_app/components/order/order_item.dart';
import 'package:quarda_mall_home_app/components/order/order_model.dart';

final List<Order> orders = [
  Order(
    shopName: "WWOOR Official Store",
    orderId: "LZ001",
    items: [
      OrderItem(
        itemName: "Đồng Hồ WWOOR Nữ - Dây Kim Loại",
        variant: 'Vàng, dây đeo da',
        price: 156618,
        quantity: 1,
        imageUrl: "assets/images/dong-ho-nu.jpeg",
      ),
      OrderItem(
        itemName: "Đồng Hồ WWOOR Nam - Thể Thao",
        variant: 'Đen, dây đeo da',
        price: 179000,
        quantity: 1,
        imageUrl: "assets/images/dong-ho-nam.jpg",
      ),
    ],
    discount: 50000,
    status: "PENDING",
    orderDate: DateTime.now().subtract(Duration(hours: 1)),
    isFreeShipping: true,
    totalPrice: 285618, // (156618 + 179000) - 50000
    totalQuantity: 2, // 1 + 1
  ),
  Order(
    shopName: "Lazada Global",
    orderId: "LZ002",
    items: [
      OrderItem(
        itemName: "Qianlong Tiền Đồng Cổ",
        variant: 'Mẫu thông thường 2.8 Càn Long (3 chiếc)',
        price: 36100,
        quantity: 3,
        imageUrl: "assets/images/qianlong-3.jpeg",
      ),
      OrderItem(
        itemName: "Ngọc Dạ Minh Châu Trưng Bày",
        variant: '60cm',
        price: 99000,
        quantity: 1,
        imageUrl: "assets/images/da-minh-chau.jpeg",
      ),
    ],
    discount: 30000,
    status: "SHIPPING",
    orderDate: DateTime.now().subtract(Duration(days: 1)),
    isFreeShipping: false,
    totalPrice: 202300, // (36100 * 3 + 99000) - 30000 + 25000 (phí vận chuyển)
    totalQuantity: 4, // 3 + 1
  ),
  Order(
    shopName: "Lenovo Official",
    orderId: "LZ003",
    items: [
      OrderItem(
        itemName: "Đèn pin Lenovo R2",
        variant: 'Kích cỡ trung bình, Ánh sáng trắng',
        price: 369000,
        quantity: 1,
        imageUrl: "assets/images/den-pin-lenovo.jpeg",
      ),
    ],
    discount: 80000,
    status: "DELIVERED",
    orderDate: DateTime.now().subtract(Duration(hours: 6)),
    isFreeShipping: true,
    totalPrice: 289000, // 369000 - 80000
    totalQuantity: 1, // 1
  ),
  Order(
    shopName: "Xiaomi Official",
    orderId: "LZ004",
    items: [
      OrderItem(
        itemName: "Xiaomi 14 Pro (12GB + 256GB)",
        variant: 'Đỏ - đen',
        price: 15990000,
        quantity: 1,
        imageUrl: "assets/images/xiaomi-pro14-do.jpg",
      ),
      OrderItem(
        itemName: "Ốp lưng chính hãng Xiaomi",
        variant: null,
        price: 150000,
        quantity: 1,
        imageUrl: "assets/images/op-lung-xiaomi.jpeg",
      ),
    ],
    discount: 250000,
    status: "SHIPPING",
    orderDate: DateTime.now().subtract(Duration(days: 3)),
    isFreeShipping: false,
    totalPrice: 15925000, // (15990000 + 150000) - 250000 + 35000 (phí vận chuyển)
    totalQuantity: 2, // 1 + 1
  ),
  Order(
    shopName: "HANGDIAN Mall",
    orderId: "LZ005",
    items: [
      OrderItem(
        itemName: "Túi xách da cao cấp nữ HANGDIAN",
        variant: "Nâu, kèm khăn tay cao cấp",
        price: 450000,
        quantity: 1,
        imageUrl: "assets/images/tui-da-nu-hang-hieu.jpg",
      ),
    ],
    discount: 49000,
    status: "CANCELLED",
    orderDate: DateTime.now().subtract(Duration(days: 2)),
    isFreeShipping: true,
    totalPrice: 401000, // 450000 - 49000
    totalQuantity: 1, // 1
  ),
  Order(
    shopName: "Hanoi Bookstore",
    orderId: "LZ006",
    items: [
      OrderItem(
        itemName: "Bộ SGK lớp 12 (Full Môn)",
        variant: null,
        price: 250500,
        quantity: 1,
        imageUrl: "assets/images/sgk-lop12.jpg",
      ),
      OrderItem(
        itemName: "Sách ôn thi THPT Quốc Gia",
        variant: null,
        price: 105000,
        quantity: 1,
        imageUrl: "assets/images/sach-on-thi-thpt.jpg",
      ),
    ],
    discount: 52000,
    status: "PENDING",
    orderDate: DateTime.now().subtract(Duration(days: 5)),
    isFreeShipping: true,
    totalPrice: 303500, // (250500 + 105000) - 52000
    totalQuantity: 2, // 1 + 1
  ),
  Order(
    shopName: "XiaoZHUBANGCHU",
    orderId: "LZ007",
    items: [
      OrderItem(
        itemName: "Tai nghe Bluetooth XiaoZHUBANGCHU",
        variant: "Xanh dương, đệm mút",
        price: 89900,
        quantity: 2,
        imageUrl: "assets/images/tai-nghe-bluetooth-blue.jpeg",
      ),
    ],
    discount: 27000,
    status: "COMPLETED",
    orderDate: DateTime.now().subtract(Duration(days: 7)),
    isFreeShipping: false,
    totalPrice: 172800, // (89900 * 2) - 27000 + 20000 (phí vận chuyển)
    totalQuantity: 2, // 2
  ),
  Order(
    shopName: "Vối Cafe",
    orderId: "LZ008", // Sửa orderId để tránh trùng
    items: [
      OrderItem(
        itemName: "Cà phê sữa",
        variant: "L, Nhiều đá, Nhiều sữa",
        price: 20000,
        quantity: 2,
        imageUrl: "assets/images/cf_sua.png",
      ),
    ],
    discount: 4000,
    status: "CONFIRMED",
    orderDate: DateTime.now().subtract(Duration(days: 7)),
    isFreeShipping: false,
    totalPrice: 51000, // (20000 * 2) - 4000 + 15000 (phí vận chuyển)
    totalQuantity: 2, // 2
  ),
];