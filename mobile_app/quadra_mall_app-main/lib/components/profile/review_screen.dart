import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/components/profile/edit_review.dart';

class ReviewsScreen extends StatefulWidget {
  const ReviewsScreen({super.key});

  @override
  State<ReviewsScreen> createState() => _ReviewsScreenState();
}

class _ReviewsScreenState extends State<ReviewsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Updated reviews list with isPending and shopName
  final List<Map<String, dynamic>> reviews = [
    {
      'id': '1',
      'product': 'Áo thun nam basic',
      'shopName': 'QuadraSmall',
      'rating': 4.0,
      'comment': 'Chất liệu tốt, mặc thoải mái, giá cả hợp lý.',
      'date': '15/05/2024',
      'image': 'https://via.placeholder.com/60',
      'isPending': false,
      'helpful': 5,
    },
    {
      'id': '2',
      'product': 'Quần jeans nữ',
      'shopName': 'QuadraSmall',
      'rating': 4.0,
      'comment': 'Form dáng đẹp, nhưng hơi chật ở phần eo.',
      'date': '12/05/2024',
      'image': 'https://via.placeholder.com/60',
      'isPending': false,
      'helpful': 3,
    },
    {
      'id': '3',
      'product': 'Tai Nghe Nhét Tai Có Dây ZIYOU X6',
      'shopName': 'ZIYOU',
      'rating': 0.0, // Not yet rated
      'comment': '',
      'date': '10/05/2024',
      'image': 'https://via.placeholder.com/60',
      'isPending': true,
      'helpful': 0,
    },
    {
      'id': '4',
      'product': 'Bộ Chuyển Đổi Mini Type-C Sang USB',
      'shopName': 'gaotengyu',
      'rating': 0.0, // Not yet rated
      'comment': '',
      'date': '08/05/2024',
      'image': 'https://via.placeholder.com/60',
      'isPending': true,
      'helpful': 0,
    },
  ];

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

  void _addReview(Map<String, dynamic>? review) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddReviewScreen(review: review),
      ),
    ).then((value) {
      if (value != null && value is Map<String, dynamic>) {
        setState(() {
          if (review != null) {
            // Edit existing review
            final index = reviews.indexWhere((r) => r['id'] == review['id']);
            if (index != -1) {
              reviews[index] = {
                ...reviews[index],
                'rating': value['rating'],
                'comment': value['comment'],
                'isPending': false,
              };
            }
          } else {
            // Add new review
            reviews.add({
              'id': (reviews.length + 1).toString(),
              'product': value['product'] ?? 'Sản phẩm mới',
              'shopName': value['shopName'] ?? 'Shop mới',
              'rating': value['rating'] ?? 0.0,
              'comment': value['comment'] ?? '',
              'date': DateTime.now().toString().substring(0, 10),
              'image': 'https://via.placeholder.com/60',
              'isPending': false,
              'helpful': 0,
            });
          }
        });
      }
    });
  }

  void _deleteReview(String id) {
    setState(() {
      reviews.removeWhere((review) => review['id'] == id);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text(
          'Đã xóa đánh giá',
          style: TextStyle(fontFamily: 'Roboto'),
        ),
        backgroundColor: Colors.green.shade600,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  void _toggleHelpful(Map<String, dynamic> review) {
    setState(() {
      review['helpful'] = (review['helpful'] as int) + 1;
    });
  }

  @override
  Widget build(BuildContext context) {
    final pendingReviews = reviews.where((r) => r['isPending'] == true).toList();
    final completedReviews = reviews.where((r) => r['isPending'] == false).toList();

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
          'Đánh Giá Của Tôi',
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
              labelColor: Colors.green.shade600,
              unselectedLabelColor: Colors.grey.shade500,
              indicatorColor: Colors.green.shade600,
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
              tabs: [
                Tab(
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('Chưa đánh giá'),
                      if (pendingReviews.isNotEmpty) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.red.shade600,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '${pendingReviews.length}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const Tab(text: 'Đã đánh giá'),
              ],
            ),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildReviewList(pendingReviews, true),
          _buildReviewList(completedReviews, false),
        ],
      ),
    );
  }

  Widget _buildReviewList(List<Map<String, dynamic>> reviewList, bool isPending) {
    if (reviewList.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isPending ? Icons.star_border : Icons.star,
              size: 100,
              color: Colors.grey.shade300,
            ),
            const SizedBox(height: 16),
            Text(
              isPending ? 'Không có sản phẩm cần đánh giá' : 'Chưa có đánh giá nào',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey.shade600,
                fontWeight: FontWeight.w500,
                fontFamily: 'Roboto',
              ),
            ),
            if (isPending) ...[
              const SizedBox(height: 8),
              Text(
                'Đánh giá để nhận Xu và giúp người khác nhé!',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey.shade500,
                  fontFamily: 'Roboto',
                ),
              ),
            ],
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: reviewList.length,
      itemBuilder: (context, index) {
        final review = reviewList[index];
        return AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
          margin: const EdgeInsets.only(bottom: 16),
          child: _buildReviewCard(review, isPending),
        );
      },
    );
  }

  Widget _buildReviewCard(Map<String, dynamic> review, bool isPending) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Shop name
            Row(
              children: [
                Icon(
                  Icons.storefront,
                  size: 20,
                  color: Colors.grey.shade700,
                ),
                const SizedBox(width: 8),
                Text(
                  review['shopName'],
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    fontFamily: 'Roboto',
                    color: Colors.black87,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Product info
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    review['image'],
                    width: 60,
                    height: 60,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        width: 60,
                        height: 60,
                        color: Colors.grey.shade200,
                        child: Icon(
                          Icons.broken_image,
                          color: Colors.grey.shade400,
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        review['product'],
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w500,
                          fontFamily: 'Roboto',
                          color: Colors.black87,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(
                            Icons.calendar_today,
                            size: 16,
                            color: Colors.grey.shade600,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            review['date'],
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey.shade600,
                              fontFamily: 'Roboto',
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),

            if (isPending) ...[
              const SizedBox(height: 12),
              // Text(
              //   'Còn ${DateTime.parse('2025-06-01').difference(DateTime.parse(review['date'].replaceAll('/', '-'))).inDays} ngày để đánh giá',
              //   style: TextStyle(
              //     fontSize: 13,
              //     color: Colors.grey.shade600,
              //     fontFamily: 'Roboto',
              //   ),
              // ),
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerRight,
                child: ElevatedButton.icon(
                  onPressed: () => _addReview(review),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    elevation: 2,
                  ),
                  icon: const Icon(Icons.star, size: 18),
                  label: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        'Đánh giá',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          fontFamily: 'Roboto',
                        ),
                      ),
                      const SizedBox(width: 4),

                    ],
                  ),
                ),
              ),
            ] else ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  ...List.generate(5, (index) {
                    return Icon(
                      index < review['rating'].floor()
                          ? Icons.star
                          : Icons.star_border,
                      size: 18,
                      color: Colors.green.shade600,
                    );
                  }),
                  const SizedBox(width: 8),
                  Text(
                    review['rating'].toString(),
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.green.shade600,
                      fontFamily: 'Roboto',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                review['comment'],
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.black87,
                  fontFamily: 'Roboto',
                ),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      IconButton(
                        onPressed: () => _toggleHelpful(review),
                        icon: Icon(
                          Icons.thumb_up,
                          size: 20,
                          color: Colors.grey.shade600,
                        ),
                      ),
                      Text(
                        'Hữu ích (${review['helpful']})',
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey.shade600,
                          fontFamily: 'Roboto',
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      IconButton(
                        onPressed: () => _addReview(review),
                        icon: Icon(
                          Icons.edit,
                          size: 20,
                          color: Colors.green.shade600,
                        ),
                        tooltip: 'Chỉnh sửa',
                      ),
                      IconButton(
                        onPressed: () => _deleteReview(review['id']),
                        icon: Icon(
                          Icons.delete,
                          size: 20,
                          color: Colors.red.shade600,
                        ),
                        tooltip: 'Xóa',
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}