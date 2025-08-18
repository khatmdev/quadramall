import 'package:flutter/material.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  _NotificationScreenState createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF4CAF50), // Xanh lá cây chủ đạo
        title: const Text(
          'Thông báo',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: [
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Thông báo'),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Text(
                      '3', // Tổng số thông báo chưa đọc (Khuyến mãi + Cập nhật Quadra Mall)
                      style: TextStyle(color: Colors.white, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Đơn hàng'),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Text(
                      '1', // Số thông báo chưa đọc cho Đơn hàng
                      style: TextStyle(color: Colors.white, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Tab 1: Thông báo (Notifications)
          Container(
            color: Colors.grey[100], // Nền xám nhạt
            child: ListView(
              padding: EdgeInsets.symmetric(
                horizontal: screenWidth * 0.03, // Padding responsive
                vertical: 10,
              ),
              children: [
                // Section 1: Khuyến mãi (Promotions)
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const CategoryNotificationScreen(
                          category: 'Khuyến mãi',
                          notifications: [
                            NotificationData(
                              icon: Icons.local_offer,
                              title: 'Khuyến mãi đặc biệt!',
                              description: 'Giảm 30% cho đơn hàng đầu tiên của bạn.',
                              time: '2 phút trước',
                              actionText: 'Xem ngay',
                              hasImage: false,
                            ),
                            NotificationData(
                              icon: Icons.local_offer,
                              title: 'Ưu đãi cuối tuần!',
                              description: 'Mua 1 tặng 1 cho tất cả sản phẩm.',
                              time: '5 giờ trước',
                              actionText: 'Xem ngay',
                              hasImage: false,
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Khuyến mãi',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                          ),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.red,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Text(
                                  '2', // Số thông báo chưa đọc
                                  style: TextStyle(color: Colors.white, fontSize: 12),
                                ),
                              ),
                              const Icon(Icons.chevron_right, color: Colors.grey),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      const NotificationCard(
                        icon: Icons.local_offer,
                        title: 'Khuyến mãi đặc biệt!',
                        description: 'Giảm 30% cho đơn hàng đầu tiên của bạn.',
                        time: '2 phút trước',
                        actionText: 'Xem ngay',
                        hasImage: false,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                // Section 2: Cập nhật Quadra Mall (Quadra Mall Updates)
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const CategoryNotificationScreen(
                          category: 'Cập nhật Quadra Mall',
                          notifications: [
                            NotificationData(
                              icon: Icons.card_giftcard,
                              title: 'Sản phẩm mới',
                              description: 'Áo thun mùa hè mới đã có mặt, nhanh tay đặt mua!',
                              time: '3 giờ trước',
                              actionText: 'Mua ngay',
                              hasImage: true,
                            ),
                            NotificationData(
                              icon: Icons.card_giftcard,
                              title: 'Sự kiện mới',
                              description: 'Flash Sale 24h sắp diễn ra, đừng bỏ lỡ!',
                              time: '6 giờ trước',
                              actionText: 'Xem ngay',
                              hasImage: true,
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Cập nhật Quadra Mall',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                          ),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.red,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Text(
                                  '1', // Số thông báo chưa đọc
                                  style: TextStyle(color: Colors.white, fontSize: 12),
                                ),
                              ),
                              const Icon(Icons.chevron_right, color: Colors.grey),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      const NotificationCard(
                        icon: Icons.card_giftcard,
                        title: 'Sản phẩm mới',
                        description: 'Áo thun mùa hè mới đã có mặt, nhanh tay đặt mua!',
                        time: '3 giờ trước',
                        actionText: 'Mua ngay',
                        hasImage: true,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Tab 2: Đơn hàng (Order Updates)
          Container(
            color: Colors.grey[100], // Nền xám nhạt
            child: ListView(
              padding: EdgeInsets.symmetric(
                horizontal: screenWidth * 0.03, // Padding responsive
                vertical: 10,
              ),
              children: const [
                Text(
                  'Cập nhật đơn hàng',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                ),
                SizedBox(height: 10),
                NotificationCard(
                  icon: Icons.local_shipping,
                  title: 'Đơn hàng đã giao',
                  description: 'Đơn hàng #12345 đã được giao thành công.',
                  time: '1 giờ trước',
                  actionText: 'Xem chi tiết',
                  hasImage: false,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Data class to hold notification data for passing to the new screen
class NotificationData {
  final IconData icon;
  final String title;
  final String description;
  final String time;
  final String actionText;
  final bool hasImage;

  const NotificationData({
    required this.icon,
    required this.title,
    required this.description,
    required this.time,
    required this.actionText,
    this.hasImage = false,
  });
}

// New screen to display all notifications for a specific category
class CategoryNotificationScreen extends StatelessWidget {
  final String category;
  final List<NotificationData> notifications;

  const CategoryNotificationScreen({
    super.key,
    required this.category,
    required this.notifications,
  });

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF4CAF50),
        title: Text(
          category,
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        elevation: 0,
      ),
      body: Container(
        color: Colors.grey[100],
        child: ListView(
          padding: EdgeInsets.symmetric(
            horizontal: screenWidth * 0.03,
            vertical: 10,
          ),
          children: notifications.map((notification) {
            return NotificationCard(
              icon: notification.icon,
              title: notification.title,
              description: notification.description,
              time: notification.time,
              actionText: notification.actionText,
              hasImage: notification.hasImage,
            );
          }).toList(),
        ),
      ),
    );
  }
}

class NotificationCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final String time;
  final String actionText;
  final bool hasImage;

  const NotificationCard({
    super.key,
    required this.icon,
    required this.title,
    required this.description,
    required this.time,
    required this.actionText,
    this.hasImage = false,
  });

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 5),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
      child: Padding(
        padding: const EdgeInsets.all(10),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon bên trái
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF4CAF50).withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                icon,
                color: const Color(0xFF4CAF50), // Xanh lá cây
                size: 24,
              ),
            ),
            const SizedBox(width: 10),
            // Nội dung thông báo
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                    overflow: TextOverflow.ellipsis, // Tránh tràn tiêu đề
                  ),
                  const SizedBox(height: 5),
                  Text(
                    description,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
                    ),
                    maxLines: 2, // Giới hạn số dòng mô tả
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 5),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Flexible(
                        child: Text(
                          time,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[500],
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      // Nút hành động
                      TextButton(
                        onPressed: () {
                          // Xử lý hành động khi nhấn nút
                        },
                        style: TextButton.styleFrom(
                          padding: EdgeInsets.symmetric(
                            horizontal: screenWidth * 0.03, // Responsive padding
                            vertical: 0,
                          ),
                          backgroundColor: const Color(0xFF4CAF50).withOpacity(0.1),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(15),
                          ),
                        ),
                        child: Text(
                          actionText,
                          style: const TextStyle(
                            color: Color(0xFF4CAF50), // Xanh lá cây
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // Hình ảnh minh họa (nếu có)
            if (hasImage)
              Padding(
                padding: const EdgeInsets.only(left: 10),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    width: 50,
                    height: 50,
                    color: Colors.grey[300],
                    child: const Placeholder(), // Thay thế Image.network
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}