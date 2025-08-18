class OrderItem {
  final String itemName;
  late String? variant;
  final double price;
  final int quantity;
  final String imageUrl;

  OrderItem({
    required this.itemName,
    this.variant,
    required this.price,
    required this.quantity,
    required this.imageUrl,
  });
}
