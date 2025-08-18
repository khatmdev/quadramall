import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/models/product_detail_model.dart';
import 'dart:convert';

class ProductTabNavigationSegmented extends StatefulWidget {
  final ProductDetail product;
  final Color? primaryColor;

  const ProductTabNavigationSegmented({
    Key? key,
    required this.product,
    this.primaryColor,
  }) : super(key: key);

  @override
  State<ProductTabNavigationSegmented> createState() =>
      _ProductTabNavigationSegmentedState();
}

class _ProductTabNavigationSegmentedState
    extends State<ProductTabNavigationSegmented> {
  int _selectedIndex = 0;

  final List<TabData> _tabs = [
    TabData(
      title: 'Mô tả',
      icon: Icons.article_outlined,
      activeIcon: Icons.article,
    ),
    TabData(
      title: 'Thông số',
      icon: Icons.info_outline,
      activeIcon: Icons.info,
    ),
    TabData(
      title: 'Chính sách',
      icon: Icons.verified_user_outlined,
      activeIcon: Icons.verified_user,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final primaryColor = widget.primaryColor ?? Colors.orange;

    return SingleChildScrollView(
      child: Column(
        children: [
          // Segmented Control
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _tabs.asMap().entries.map((entry) {
                  final index = entry.key;
                  final tab = entry.value;
                  final isSelected = _selectedIndex == index;

                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        _selectedIndex = index;
                      });
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeInOut,
                      margin: EdgeInsets.only(
                        right: index < _tabs.length - 1 ? 4 : 0,
                      ),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      decoration: BoxDecoration(
                        color: isSelected ? primaryColor : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                        boxShadow: isSelected
                            ? [
                          BoxShadow(
                            color: primaryColor.withOpacity(0.3),
                            spreadRadius: 1,
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ]
                            : null,
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          AnimatedSwitcher(
                            duration: const Duration(milliseconds: 200),
                            child: Icon(
                              isSelected ? tab.activeIcon : tab.icon,
                              key: ValueKey(isSelected),
                              size: 18,
                              color: isSelected
                                  ? Colors.white
                                  : Colors.grey.shade600,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            tab.title,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: isSelected
                                  ? FontWeight.w600
                                  : FontWeight.normal,
                              color: isSelected
                                  ? Colors.white
                                  : Colors.grey.shade600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // Nội dung tab
          Padding(
            padding: const EdgeInsets.all(16),
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              transitionBuilder: (Widget child, Animation<double> animation) {
                return FadeTransition(
                  opacity: animation,
                  child: SlideTransition(
                    position: Tween<Offset>(
                      begin: const Offset(0.3, 0),
                      end: Offset.zero,
                    ).animate(animation),
                    child: child,
                  ),
                );
              },
              child: Builder(
                key: ValueKey(_selectedIndex),
                builder: (context) {
                  try {
                    return _getTabContent(_selectedIndex);
                  } catch (e) {
                    return Center(
                      child: Text(
                        'Đã xảy ra lỗi khi tải nội dung: $e',
                        style: const TextStyle(color: Colors.red),
                      ),
                    );
                  }
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _getTabContent(int index) {
    switch (index) {
      case 0:
        return ProductDescriptionSegmented(product: widget.product);
      case 1:
        return ProductSpecificationsSegmented(product: widget.product);
      case 2:
        return ProductPoliciesSegmented(product: widget.product);
      default:
        return ProductDescriptionSegmented(product: widget.product);
    }
  }
}

class TabData {
  final String title;
  final IconData icon;
  final IconData activeIcon;

  TabData({required this.title, required this.icon, required this.activeIcon});
}

class ProductDescriptionSegmented extends StatelessWidget {
  final ProductDetail product;

  const ProductDescriptionSegmented({Key? key, required this.product})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Parse description JSON
    List<dynamic> descriptionItems = [];
    try {
      descriptionItems = jsonDecode(product.description);
    } catch (e) {
      descriptionItems = [
        {'type': 'text', 'content': 'Không có mô tả sản phẩm'}
      ];
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Colors.blue.withOpacity(0.1),
                Colors.purple.withOpacity(0.1),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              const Icon(Icons.smartphone, color: Colors.blue, size: 24),
              const SizedBox(width: 8),
              const Text(
                'Mô tả sản phẩm',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        ...descriptionItems.map((item) {
          if (item['type'] == 'text') {
            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Text(
                item['content'] ?? 'Không có nội dung',
                style: TextStyle(
                  fontSize: 15,
                  height: 1.6,
                  color: Colors.grey.shade800,
                ),
              ),
            );
          } else if (item['type'] == 'image') {
            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Image.network(
                item['url'] ?? 'https://via.placeholder.com/300',
                width: double.infinity,
                height: 200,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return const Text(
                    'Không thể tải hình ảnh',
                    style: TextStyle(color: Colors.red),
                  );
                },
              ),
            );
          }
          return const SizedBox.shrink();
        }).toList(),
      ],
    );
  }
}

class ProductSpecificationsSegmented extends StatelessWidget {
  final ProductDetail product;

  const ProductSpecificationsSegmented({Key? key, required this.product})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Colors.green.withOpacity(0.1),
                Colors.teal.withOpacity(0.1),
              ],
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              const Icon(Icons.settings, color: Colors.green, size: 24),
              const SizedBox(width: 12),
              const Text(
                'Thông số kỹ thuật',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.green,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        Table(
          border: TableBorder.all(
            color: Colors.grey.shade200,
            width: 1,
          ),
          columnWidths: const {
            0: FlexColumnWidth(1),
            1: FlexColumnWidth(1),
          },
          children: product.specifications.map((spec) {
            return TableRow(
              children: [
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(
                    spec.name,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.grey.shade800,
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(
                    spec.value,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ),
              ],
            );
          }).toList(),
        ),
      ],
    );
  }
}

class ProductPoliciesSegmented extends StatelessWidget {
  final ProductDetail product;

  const ProductPoliciesSegmented({Key? key, required this.product})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Colors.purple.withOpacity(0.1),
                Colors.blue.withOpacity(0.1),
              ],
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              const Icon(Icons.policy, color: Colors.purple, size: 24),
              const SizedBox(width: 12),
              const Text(
                'Chính sách & Bảo hành',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.purple,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        _buildPolicyCard('🛡️ Bảo hành', 'Chính hãng 12 tháng', Colors.blue),
        _buildPolicyCard('🚚 Giao hàng', 'Miễn phí toàn quốc', Colors.green),
        _buildPolicyCard('↩️ Đổi trả', '7 ngày không lý do', Colors.orange),
        _buildPolicyCard('💳 Thanh toán', 'Đa dạng phương thức', Colors.purple),
      ],
    );
  }

  Widget _buildPolicyCard(String title, String subtitle, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              title.split(' ')[0],
              style: const TextStyle(fontSize: 16),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(fontWeight: FontWeight.bold, color: color),
                ),
                Text(subtitle, style: TextStyle(color: Colors.grey.shade600)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}