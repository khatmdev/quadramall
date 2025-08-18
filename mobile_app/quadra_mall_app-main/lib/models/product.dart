class Product {
  final String name;
  final double price;
  final String imageUrl;
  final double rating;
  final int soldCount;
  final String seller;
  bool isFav;

  Product({
    required this.name,
    required this.price,
    required this.imageUrl,
    required this.rating,
    required this.soldCount,
    required this.seller,
    this.isFav = false,
  });
}