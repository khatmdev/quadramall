import 'package:flutter/material.dart';

class ProductDescription extends StatefulWidget {
  final Map<String, dynamic> product;
  final Color? primaryColor;
  final Color? secondaryColor;

  const ProductDescription({
    Key? key,
    required this.product,
    this.primaryColor,
    this.secondaryColor,
  }) : super(key: key);

  @override
  State<ProductDescription> createState() => _ProductDescriptionState();
}

class _ProductDescriptionState extends State<ProductDescription> {
  bool _expanded = false;
  final double _collapsedHeight = 120.0;
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  // Hàm để cuộn đến vị trí cuối container khi mở rộng
  void _scrollToBottom() {
    if (_expanded) {
      Future.delayed(const Duration(milliseconds: 300), () {
        if (_scrollController.hasClients) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 500),
            curve: Curves.easeOut,
          );
        }
      });
    }
  }

  // Hàm để cuộn lên đầu container khi thu gọn
  void _scrollToTop() {
    if (!_expanded) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          0,
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeOut,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Sử dụng màu chủ đạo hoặc màu mặc định
    final primaryColor = widget.primaryColor ?? Theme.of(context).primaryColor;
    final secondaryColor = widget.secondaryColor ?? Colors.grey.shade600;

    // Lấy thông tin chi tiết sản phẩm từ product
    final String description = widget.product['description'] ?? 'Không có mô tả chi tiết';
    final List<String> highlights = List<String>.from(widget.product['highlights'] ?? []);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 2,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Tiêu đề phần mô tả
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Mô tả sản phẩm',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (description.isNotEmpty)
                TextButton(
                  onPressed: () {
                    setState(() {
                      _expanded = !_expanded;
                      if (_expanded) {
                        _scrollToTop(); // Cuộn lên đầu khi mở rộng
                      } else {
                        _scrollToTop(); // Cuộn lên đầu khi thu gọn
                      }
                    });
                  },
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        _expanded ? 'Thu gọn' : 'Xem thêm',
                        style: TextStyle(
                          color: primaryColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Icon(
                        _expanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                        color: primaryColor,
                        size: 16,
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),

          // Phần điểm nổi bật
          if (highlights.isNotEmpty) ...[
            const Text(
              'Điểm nổi bật',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            ...highlights.map((highlight) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.check_circle,
                    color: primaryColor,
                    size: 16,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      highlight,
                      style: const TextStyle(
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
            )).toList(),
            const SizedBox(height: 12),
          ],

          // Phần mô tả chi tiết
          const Text(
            'Chi tiết sản phẩm',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),

          // Sử dụng AnimatedContainer cho hiệu ứng mở rộng/thu gọn mượt mà
          AnimatedContainer(
            duration: const Duration(milliseconds: 500),
            curve: Curves.easeInOut,
            height: _expanded ? 400.0 : _collapsedHeight,
            child: Stack(
              children: [
                // ScrollView với controller để điều khiển cuộn
                Scrollbar(
                  child: SingleChildScrollView(
                    controller: _scrollController,
                    child: _buildFormattedDescription(description, secondaryColor),
                  ),
                ),

                // Hiệu ứng mờ dần ở cuối nếu ở trạng thái thu gọn
                if (!_expanded)
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      height: 60,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.white.withOpacity(0.0),
                            Colors.white.withOpacity(1.0),
                          ],
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // Nút xem thêm khi ở trạng thái thu gọn
          if (!_expanded)
            Center(
              child: Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: TextButton(
                  onPressed: () {
                    setState(() {
                      _expanded = true;
                      _scrollToTop(); // Cuộn lên đầu khi mở rộng
                    });
                  },
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Xem thêm chi tiết',
                        style: TextStyle(
                          color: primaryColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Icon(
                        Icons.keyboard_arrow_down,
                        color: primaryColor,
                        size: 18,
                      ),
                    ],
                  ),
                ),
              ),
            ),

          // Nút thu gọn ở dưới khi ở trạng thái mở rộng
          if (_expanded)
            Center(
              child: Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: TextButton(
                  onPressed: () {
                    setState(() {
                      _expanded = false;
                      _scrollToTop(); // Cuộn lên đầu khi thu gọn
                    });
                  },
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Thu gọn',
                        style: TextStyle(
                          color: primaryColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Icon(
                        Icons.keyboard_arrow_up,
                        color: primaryColor,
                        size: 18,
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  // Phương thức _buildFormattedDescription giữ nguyên như cũ
  Widget _buildFormattedDescription(String description, Color textColor) {
    // Nếu nội dung có dấu hiệu là HTML
    if (description.contains('<') && description.contains('>')) {
      // Loại bỏ các thẻ HTML và tách thành các đoạn văn
      String plainText = _removeHtmlTags(description);
      List<String> paragraphs = plainText.split('\n\n');

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: paragraphs.map((paragraph) {
          // Kiểm tra xem đoạn văn có phải là mục trong danh sách hay không
          if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('•')) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 8.0),
              child: Text(
                paragraph.trim(),
                style: TextStyle(
                  fontSize: 14,
                  color: textColor,
                  height: 1.5,
                ),
              ),
            );
          } else {
            return Padding(
              padding: const EdgeInsets.only(bottom: 12.0),
              child: Text(
                paragraph.trim(),
                style: TextStyle(
                  fontSize: 14,
                  color: textColor,
                  height: 1.5,
                ),
              ),
            );
          }
        }).toList(),
      );
    } else {
      // Nếu không phải HTML, xử lý văn bản thường
      List<String> paragraphs = description.split('\n\n');

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: paragraphs.map((paragraph) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12.0),
            child: Text(
              paragraph.trim(),
              style: TextStyle(
                fontSize: 14,
                color: textColor,
                height: 1.5,
              ),
            ),
          );
        }).toList(),
      );
    }
  }

  // Phương thức _removeHtmlTags giữ nguyên như cũ
  String _removeHtmlTags(String htmlText) {
    // Loại bỏ các thẻ HTML
    String result = htmlText.replaceAll(RegExp(r"<[^>]*>"), '');

    // Thay thế một số ký tự đặc biệt của HTML
    result = result.replaceAll('&nbsp;', ' ')
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&quot;', '"')
        .replaceAll('&#39;', "'");

    // Chuẩn hóa khoảng trắng và xuống dòng
    result = result.replaceAll(RegExp(r'\s+'), ' ');

    // Chuyển các dấu chấm trong danh sách thành dấu gạch ngang để dễ nhận biết
    if (result.contains('• ')) {
      result = result.replaceAll('• ', '\n\n• ');
    }

    return result;
  }
}