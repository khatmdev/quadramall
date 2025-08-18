import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/utils/formater.dart';
import 'package:quarda_mall_home_app/components/checkout/note/note.dart';
import 'package:quarda_mall_home_app/components/checkout/product_item.dart';

class OrderHistoryScreen extends StatefulWidget {
  const OrderHistoryScreen({super.key});

  @override
  State<OrderHistoryScreen> createState() => _OrderHistoryScreenState();
}

class _OrderHistoryScreenState extends State<OrderHistoryScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<Map<String, dynamic>> orders = [
    {
      'id': 'ORD001',
      'date': '15/05/2024',
      'status': 'delivered',
      'total': 299000,
      'quantity': 3,
      'imageUrl': 'assets/images/ao.webp',
      'name': 'Áo thun nam basic',
      'shopName': 'QuadraSmall',
    },
    {
      'id': 'ORD002',
      'date': '12/05/2024',
      'status': 'shipping',
      'total': 450000,
      'quantity': 2,
      'imageUrl': 'assets/images/chuot1.webp',
      'name': 'Quần jeans nữ',
      'shopName': 'QuadraSmall',
    },
    {
      'id': 'ORD003',
      'date': '10/05/2024',
      'status': 'processing',
      'total': 199000,
      'quantity': 1,
      'imageUrl': 'assets/images/tainghe1.webp',
      'name': 'Giày sneaker',
      'shopName': 'FashionHub',
    },
    {
      'id': 'ORD004',
      'date': '08/05/2024',
      'status': 'cancelled',
      'total': 350000,
      'quantity': 2,
      'imageUrl': 'assets/images/tuixach_nu.webp',
      'name': 'Túi xách nữ',
      'shopName': 'FashionHub',
    },
  ];

  Map<String, List<Map<String, dynamic>>> _groupOrdersByShop(
      List<Map<String, dynamic>> orderList) {
    Map<String, List<Map<String, dynamic>>> grouped = {};
    for (var order in orderList) {
      final shopName = order['shopName'] as String;
      if (!grouped.containsKey(shopName)) {
        grouped[shopName] = [];
      }
      grouped[shopName]!.add(order);
    }
    return grouped;
  }

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black87),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Đơn Hàng Của Tôi',
          style: TextStyle(
            color: Colors.black87,
            fontWeight: FontWeight.w700,
            fontSize: 20,
            fontFamily: 'Roboto',
          ),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Container(
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
            ),
            child: TabBar(
              controller: _tabController,
              isScrollable: true,
              labelColor: const Color(0xFF22C55E),
              unselectedLabelColor: Colors.grey.shade500,
              indicatorColor: const Color(0xFF22C55E),
              indicatorWeight: 3,
              labelStyle: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 14,
                fontFamily: 'Roboto',
              ),
              unselectedLabelStyle: const TextStyle(
                fontWeight: FontWeight.w500,
                fontSize: 14,
                fontFamily: 'Roboto',
              ),
              tabs: const [
                Tab(text: 'Tất cả'),
                Tab(text: 'Chờ xử lý'),
                Tab(text: 'Đang giao'),
                Tab(text: 'Đã giao'),
                Tab(text: 'Đã hủy'),
              ],
            ),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildShopList(orders),
          _buildShopList(orders.where((o) => o['status'] == 'processing').toList()),
          _buildShopList(orders.where((o) => o['status'] == 'shipping').toList()),
          _buildShopList(orders.where((o) => o['status'] == 'delivered').toList()),
          _buildShopList(orders.where((o) => o['status'] == 'cancelled').toList()),
        ],
      ),
    );
  }

  Widget _buildShopList(List<Map<String, dynamic>> orderList) {
    if (orderList.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.shopping_bag_outlined,
              size: 100,
              color: Colors.grey.shade300,
            ),
            const SizedBox(height: 16),
            Text(
              'Không có đơn hàng nào',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey.shade600,
                fontWeight: FontWeight.w500,
                fontFamily: 'Roboto',
              ),
            ),
          ],
        ),
      );
    }

    final groupedOrders = _groupOrdersByShop(orderList);

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: groupedOrders.keys.length,
      itemBuilder: (context, index) {
        final shopName = groupedOrders.keys.elementAt(index);
        final shopOrders = groupedOrders[shopName]!;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
          margin: const EdgeInsets.only(bottom: 16),
          child: _buildShopCard(shopName, shopOrders),
        );
      },
    );
  }

  Widget _buildShopCard(String shopName, List<Map<String, dynamic>> shopOrders) {
    final totalPrice = shopOrders.fold(0.0, (sum, order) => sum + (order['total'] as int).toDouble());
    String? note;

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Shop name and order status
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.storefront,
                      color: Colors.grey.shade700,
                      size: 24,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      shopName,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        fontFamily: 'Roboto',
                        color: Colors.black87,
                      ),
                    ),
                  ],
                ),
                _buildStatusChip(shopOrders[0]['status']),
              ],
            ),
            const SizedBox(height: 12),
            Divider(color: Colors.grey.shade200, height: 1),

            // Order items
            ...shopOrders.map((order) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: ProductItem(
                name: order['name'],
                price: order['total'].toDouble(),
                quantity: order['quantity'],
                imageUrl: order['imageUrl'],
                onTap: () => _showOrderDetails(order),
              ),
            )),

            const SizedBox(height: 8),
            Divider(color: Colors.grey.shade200, height: 1),



            // Total price
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Tổng tiền hàng (5 sản phẩm)  ',
                    style: TextStyle(
                      fontSize: 15,
                      color: Colors.black87,
                      fontFamily: 'Roboto',
                    ),
                  ),
                  Text(
                    Formatter.formatCurrencyWithSymbol(totalPrice),
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: Colors.red.shade600,
                      fontFamily: 'Roboto',
                    ),
                  ),
                ],
              ),
            ),

            // Action buttons
            Row(
              children: [
                Expanded(
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    child: OutlinedButton(
                      onPressed: () => _showShopOrderDetails(shopOrders),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: Colors.green.shade600, width: 1.5),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      child: Text(
                        'Thông tin đơn hàng  ',
                        style: TextStyle(
                          color: Colors.green.shade600,
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          fontFamily: 'Roboto',
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    child: ElevatedButton(
                      onPressed: () => _handleOrderAction(shopOrders[0]),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green.shade600,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        elevation: 2,
                      ),
                      child: Text(
                        _getActionText(shopOrders[0]['status']),
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          fontFamily: 'Roboto',
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }



  Widget _buildStatusChip(String status) {
    Color color;
    String text;
    IconData icon;

    switch (status) {
      case 'delivered':
        color = Colors.green.shade600;
        text = 'Hoàn thành';
        icon = Icons.check_circle;
        break;
      case 'shipping':
        color = Colors.blue.shade600;
        text = 'Đang giao';
        icon = Icons.local_shipping;
        break;
      case 'processing':
        color = Colors.orange.shade600;
        text = 'Chờ xử lý';
        icon = Icons.hourglass_empty;
        break;
      case 'cancelled':
        color = Colors.red.shade600;
        text = 'Đã hủy';
        icon = Icons.cancel;
        break;
      default:
        color = Colors.grey.shade600;
        text = 'Không xác định';
        icon = Icons.help;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w600,
              fontFamily: 'Roboto',
            ),
          ),
        ],
      ),
    );
  }

  String _getActionText(String status) {
    switch (status) {
      case 'delivered':
        return 'Mua lại';
      case 'shipping':
        return 'Theo dõi';
      case 'processing':
        return 'Hủy đơn';
      case 'cancelled':
        return 'Mua lại';
      default:
        return 'Xem';
    }
  }

  void _handleOrderAction(Map<String, dynamic> order) {
    String message;
    switch (order['status']) {
      case 'delivered':
        message = 'Đã thêm vào giỏ hàng';
        break;
      case 'shipping':
        message = 'Đang theo dõi đơn hàng';
        break;
      case 'processing':
        message = 'Đơn hàng đã được hủy';
        break;
      case 'cancelled':
        message = 'Đã thêm vào giỏ hàng';
        break;
      default:
        message = 'Thao tác thành công';
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: const TextStyle(fontFamily: 'Roboto'),
        ),
        backgroundColor: Colors.green.shade600,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  void _showOrderDetails(Map<String, dynamic> order) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      backgroundColor: Colors.white,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        expand: false,
        builder: (context, scrollController) {
          return Container(
            padding: const EdgeInsets.all(20),
            child: SingleChildScrollView(
              controller: scrollController,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 5,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2.5),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'Chi Tiết Đơn Hàng #${order['id']}',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      fontFamily: 'Roboto',
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildDetailRow('Tên sản phẩm:', order['name']),
                  _buildDetailRow('Ngày đặt:', order['date']),
                  _buildDetailRow('Trạng thái:', order['status']),
                  _buildDetailRow('Số lượng:', '${order['quantity']} sản phẩm'),
                  _buildDetailRow('Tổng tiền:', Formatter.formatCurrencyWithSymbol(order['total'].toDouble())),
                  _buildDetailRow('Cửa hàng:', order['shopName']),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green.shade600,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 2,
                      ),
                      child: const Text(
                        'Đóng',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                          fontFamily: 'Roboto',
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  void _showShopOrderDetails(List<Map<String, dynamic>> shopOrders) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      backgroundColor: Colors.white,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        expand: false,
        builder: (context, scrollController) {
          final totalPrice = shopOrders.fold(0.0, (sum, order) => sum + (order['total'] as int).toDouble());
          return Container(
            padding: const EdgeInsets.all(20),
            child: SingleChildScrollView(
              controller: scrollController,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 5,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2.5),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'Chi Tiết Đơn Hàng - ${shopOrders[0]['shopName']}',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      fontFamily: 'Roboto',
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ...shopOrders.map((order) => Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildDetailRow('Mã đơn hàng:', order['id']),
                      _buildDetailRow('Tên sản phẩm:', order['name']),
                      _buildDetailRow('Số lượng:', '${order['quantity']} sản phẩm'),
                      _buildDetailRow('Giá:', Formatter.formatCurrencyWithSymbol(order['total'].toDouble())),
                      const SizedBox(height: 12),
                      Divider(color: Colors.grey.shade200),
                    ],
                  )),
                  _buildDetailRow('Ngày đặt:', shopOrders[0]['date']),
                  _buildDetailRow('Trạng thái:', shopOrders[0]['status']),
                  _buildDetailRow('Tổng tiền:', Formatter.formatCurrencyWithSymbol(totalPrice)),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green.shade600,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 2,
                      ),
                      child: const Text(
                        'Đóng',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                          fontFamily: 'Roboto',
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              color: Colors.grey.shade600,
              fontSize: 14,
              fontWeight: FontWeight.w500,
              fontFamily: 'Roboto',
            ),
          ),
          Flexible(
            child: Text(
              value,
              style: const TextStyle(
                color: Colors.black87,
                fontSize: 14,
                fontWeight: FontWeight.w600,
                fontFamily: 'Roboto',
              ),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }
}