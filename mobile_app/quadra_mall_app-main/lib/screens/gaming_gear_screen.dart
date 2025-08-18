
import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/components/home/view_toggle_buttons.dart';
import 'package:quarda_mall_home_app/components/shared/product_listing_view.dart';
import 'package:quarda_mall_home_app/components/shared/search_text_field.dart';
import 'package:quarda_mall_home_app/models/product_data.dart';
import '../components/home/header_widget.dart';

class GamingGearScreen extends StatefulWidget {
  const GamingGearScreen({super.key});

  @override
  State<GamingGearScreen> createState() => _GamingGearScreenState();
}
class _GamingGearScreenState extends State<GamingGearScreen> {
  bool isGrid = true;
  // Hàm thay đổi trạng thái yêu thích
  void _toggleFavorite(int index) {
    setState(() {
      products[index].isFav = !products[index].isFav;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
            onPressed: () {
            Navigator.of(context).pop(); // Quay lại HomeScreen
          },
        ),
        title: SearchTextField(),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const HeaderWidget(
              breadcrumb: ['Trang chủ', 'Ăn uống', 'Cà phê'],
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Kết quả cho "Cà phê"',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const Text('Hiển thị 1 - 60 sản phẩm'),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      DropdownButton<String>(
                        value: 'relevant',
                        items: const [
                          DropdownMenuItem(value: 'relevant', child: Text('Liên quan')),
                          DropdownMenuItem(value: 'price_low', child: Text('Giá: Thấp đến cao')),
                          DropdownMenuItem(value: 'price_high', child: Text('Giá: Cao đến Thấp')),
                        ],
                        onChanged: (value) {},
                      ),
                      Row(
                        children: [
                          ViewToggleButtons(
                            isGrid: isGrid,
                            onChanged: (value) {
                              setState(() {
                                isGrid = value;
                              });
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ProductListingView(
                      products: products,
                      onFavPressed: _toggleFavorite,
                      isGridView: isGrid
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      TextButton(
                        onPressed: () {},
                        child: const Text('1'),
                      ),
                      TextButton(
                        onPressed: () {},
                        child: const Text('2'),
                      ),
                      const Text('...'),
                      TextButton(
                        onPressed: () {},
                        child: const Text('274'),
                      ),
                      IconButton(
                        icon: const Icon(Icons.chevron_right),
                        onPressed: () {},
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
