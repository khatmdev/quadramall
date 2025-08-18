import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/models/product_detail_model.dart';

class ProductReviews extends StatelessWidget {
  final List<Review> reviews;
  final double averageRating;
  final int reviewCount;

  const ProductReviews({
    Key? key,
    required this.reviews,
    required this.averageRating,
    required this.reviewCount,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 16),
          // Ratings Overview Card
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade200),
            ),
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Average Rating Circle
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: Colors.red,
                      width: 3,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      averageRating.toStringAsFixed(1),
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                // Star Rating
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: List.generate(
                        5,
                            (index) => Icon(
                          Icons.star,
                          color: index < averageRating.floor() ? Colors.red : Colors.grey.shade300,
                          size: 20,
                        ),
                      ),
                    ),
                    Text(
                      'from $reviewCount reviews',
                      style: const TextStyle(
                        color: Colors.grey,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Review Lists Title
          const Text(
            'Review Lists',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),

          // Reviews List or Empty State
          reviews.isEmpty
              ? Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.grey.shade200,
                  ),
                  child: const Icon(
                    Icons.chat_bubble_outline,
                    color: Colors.grey,
                    size: 32,
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Chưa có đánh giá nào',
                  style: TextStyle(
                    fontSize: 18,
                    color: Colors.grey,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Hãy là người đầu tiên đánh giá sản phẩm này!',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          )
              : Column(
            children: reviews.asMap().entries.map((entry) {
              final index = entry.key;
              final review = entry.value;
              return Column(
                children: [
                  _buildReviewItem(
                    review.userName,
                    review.comment,
                    review.createdAt,
                    review.likes.toString(),
                    review.avatarUrl,
                    review.rating,
                  ),
                  index < reviews.length - 1 ? const Divider() : const SizedBox(),
                ],
              );
            }).toList(),
          ),

          // Pagination (giữ nguyên nhưng ẩn nếu không có đánh giá)
          if (reviews.isNotEmpty) ...[
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildPaginationItem('1', true),
                _buildPaginationItem('2', false),
                const Text('...', style: TextStyle(color: Colors.grey)),
                _buildPaginationItem('274', false),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.chevron_right, color: Colors.green),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildReviewItem(String name, String comment, String date, String likes, String avatarUrl, int rating) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: List.generate(
            5,
                (index) => Icon(
              Icons.star,
              color: index < rating ? Colors.red : Colors.grey.shade300,
              size: 16,
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          comment,
          style: const TextStyle(fontSize: 14),
        ),
        const SizedBox(height: 4),
        Text(
          date,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade600,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            CircleAvatar(
              radius: 16,
              backgroundImage: NetworkImage(avatarUrl),
            ),
            const SizedBox(width: 8),
            Text(
              name,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
            const Spacer(),
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.thumb_up_outlined, size: 16),
                  onPressed: () {},
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
                const SizedBox(width: 4),
                Text(likes, style: const TextStyle(fontSize: 12)),
                const SizedBox(width: 16),
                IconButton(
                  icon: const Icon(Icons.thumb_down_outlined, size: 16),
                  onPressed: () {},
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 12),
      ],
    );
  }

  Widget _buildPaginationItem(String number, bool isSelected) {
    return Container(
      width: 36,
      height: 36,
      margin: const EdgeInsets.symmetric(horizontal: 4),
      decoration: BoxDecoration(
        color: isSelected ? Colors.green : Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isSelected ? Colors.green : Colors.grey.shade300,
        ),
      ),
      child: Center(
        child: Text(
          number,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.black,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}