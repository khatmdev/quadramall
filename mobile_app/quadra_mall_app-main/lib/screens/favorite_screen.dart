import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/components/favorite/toast_fav.dart';
import 'package:quarda_mall_home_app/components/home/view_toggle_buttons.dart';
import 'package:quarda_mall_home_app/components/shared/pagination_widget.dart';
import 'package:quarda_mall_home_app/components/shared/product_listing_view.dart';
import 'package:quarda_mall_home_app/components/shared/search_text_field.dart';
import 'package:quarda_mall_home_app/models/product_data.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  _FavoritesScreenState createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  bool isGridView = true; // True: grid view, False: list view
  String selectedFilter = 'Books'; // Bộ lọc được chọn
  int currentPage = 1; // Trang hiện tại
  List<Product> favoriteProducts = [ // Dữ liệu giả lập
    Product(name: 'Nintendo Switch Lite Amarelo', description: 'Console portátil amarelo', imageUrl: 'assets/images/sgk-lop12.jpg'),
    Product(name: 'Neuromancer: 1 - Brazilian Portug...', description: 'Livro de ficção científica', imageUrl: 'assets/images/qianlong-3.jpeg'),
    Product(name: '1984 - Brazilian Portug...', description: 'Clássico distópico', imageUrl: 'assets/images/dong-ho-nu.jpeg'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _buildAppBar(),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildFilters(),
            _buildIconVisibleLayout(),
            _buildPagination(),
            _buildProductList(),
          ],
        ),
      ),
    );
  }
  AppBar _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      automaticallyImplyLeading: false,
      title: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8),
        child: Row(
          children: [
            const Text(
              'Yêu thích',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Color(0xFF4CAF50),
              ),
            ),
            const SizedBox(width: 8), // Thêm khoảng cách giữa Text và TextField
            Expanded(
              child: SearchTextField(),
            ),
          ],
        ),
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.delete_forever, color: Colors.red, size: 30),
          onPressed: () {},
        ),
      ],
    );
  }
  Widget _buildFilters() {
    List<String> filters = ['Books', 'Electronics', 'Clothes', 'E-Books', 'Furniture'];
    List<Color> colors = [
      Colors.blue,
      Colors.green,
      Colors.orange,
      Colors.purple,
      Colors.red,
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8.0),
      child: Wrap(
        spacing: 8.0, // Horizontal spacing between chips
        runSpacing: 8.0, // Vertical spacing between rows
        children: filters.asMap().entries.map((entry) {
          int index = entry.key;
          String filter = entry.value;
          Color color = colors[index % colors.length]; // Cycle through colors

          bool isSelected = selectedFilter == filter;

          return ActionChip(
            label: Text(
              filter,
              style: TextStyle(
                color: isSelected ? Colors.white : color,
              ),
            ),
            backgroundColor: isSelected ? color : color.withAlpha(30),
            side: BorderSide.none,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20.0),
            ),
            onPressed: () {
              setState(() {
                selectedFilter = filter;
              });
            },
          );
        }).toList(),
      ),
    );
  }

  Widget _buildIconVisibleLayout() {
    return ViewToggleButtons(
      isGrid: isGridView,
      onChanged: (value){
        setState(() {
          isGridView = value;
        });
      }
    );
  }

  Widget _buildPagination() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: PaginationWidget(
                totalPages: 10,
                currentPage: currentPage,
                onPageChanged: (page) {
                  setState(() {
                    currentPage = page;
                  });
                },
            )
    );
  }


// Hàm thay đổi trạng thái yêu thích
  void _toggleFavorite(int index) {
    setState(() {
      products[index].isFav = !products[index].isFav;
      showFavToast(isFav: products[index].isFav);
    });
  }

  Widget _buildProductList() {
    return ProductListingView(
        products: products,
        isGridView: isGridView,
        onFavPressed: _toggleFavorite
    );
  }
}

class ProductCard extends StatelessWidget {
  final Product product;
  final bool isListView;

  const ProductCard({super.key, required this.product, this.isListView = false});

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8.0)),
      child: isListView
          ? Row(
        children: [
          Image.asset(product.imageUrl, width: 100, height: 100, fit: BoxFit.cover),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.name, style: TextStyle(fontWeight: FontWeight.bold)),
                  Text(product.description, maxLines: 2, overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
          ),
          Icon(Icons.favorite, color: Colors.red),
        ],
      )
          : Column(
        children: [
          Image.asset(product.imageUrl, height: 150, width: 150, fit: BoxFit.cover),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(product.name, style: TextStyle(fontWeight: FontWeight.bold)),
                Text(product.description, maxLines: 2, overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
          Align(
            alignment: Alignment.topRight,
            child: Icon(Icons.favorite, color: Colors.red),
          ),
        ],
      ),
    );
  }
}

class Product {
  final String name;
  final String description;
  final String imageUrl;

  Product({required this.name, required this.description, required this.imageUrl});
}