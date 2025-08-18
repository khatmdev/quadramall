class CartProduct {
  final String name;
  final double price;
  int quantity;
  bool isSelected;

  CartProduct({
    required this.name,
    required this.price,
    this.quantity = 1,
    this.isSelected = false,
  });
}

class CartShop {
  final String name;
  final String location;
  final List<CartProduct> products;
  bool isSelected;

  CartShop({
    required this.name,
    required this.location,
    required this.products,
    this.isSelected = false,
  });
}

List<CartShop> cartData = [
  CartShop(
    name: 'Logitech Indonesia',
    location: 'Central Jakarta',
    products: [
      CartProduct(name: 'Logitech G435 Gaming Headset blallalalalalala', price: 280),
      CartProduct(name: 'Logitech G502 Hero', price: 89),
      CartProduct(name: 'Logitech G303 Shroud Edition', price: 46),
    ],
  ),
  CartShop(
    name: 'Uniqlo',
    location: 'Central Jakarta',
    products: [
      CartProduct(name: 'Logitech G435 Gaming Headset', price: 280),
    ],
  ),
];