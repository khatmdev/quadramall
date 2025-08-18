import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:video_thumbnail/video_thumbnail.dart';
import 'package:quarda_mall_home_app/models/product_detail_model.dart';
import 'package:quarda_mall_home_app/utils/currency_formatter.dart';
import 'package:quarda_mall_home_app/widgets/media_view.dart';

class ProductInfo extends StatefulWidget {
  final ProductDetail product;

  const ProductInfo({
    super.key,
    required this.product,
  });

  @override
  _ProductInfoState createState() => _ProductInfoState();
}

class _ProductInfoState extends State<ProductInfo> {
  late String _mainMediaUrl;
  late bool _isMainVideo;
  Uint8List? _videoThumbnail;

  @override
  void initState() {
    super.initState();

    // Ưu tiên video nếu có, nếu không thì dùng thumbnail
    if (widget.product.videoUrl?.isNotEmpty == true) {
      _mainMediaUrl = widget.product.videoUrl!;
      _isMainVideo = true;
      _loadVideoThumbnail(widget.product.videoUrl!);
    } else {
      _mainMediaUrl = widget.product.thumbnailUrl ?? '';
      _isMainVideo = false;
    }
  }

  Future<void> _loadVideoThumbnail(String videoUrl) async {
    final thumb = await VideoThumbnail.thumbnailData(
      video: videoUrl,
      imageFormat: ImageFormat.JPEG,
      maxWidth: 128,
      quality: 50,
    );
    if (mounted) {
      setState(() {
        _videoThumbnail = thumb;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final subImages = <Map<String, dynamic>>[];

    if (widget.product.videoUrl?.isNotEmpty == true) {
      subImages.add({
        'url': widget.product.videoUrl!,
        'isVideo': true,
        'altText': 'Video sản phẩm',
        'thumbnailBytes': _videoThumbnail,
      });
    }

    if (widget.product.thumbnailUrl != null) {
      subImages.add({
        'url': widget.product.thumbnailUrl!,
        'isVideo': false,
        'altText': 'Thumbnail',
      });
    }

    subImages.addAll(widget.product.images.map((image) => {
      'url': image.imageUrl,
      'isVideo': false,
      'altText': image.altText,
    }));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // === Media lớn ===
        MediaView(
          url: _mainMediaUrl,
          isVideo: _isMainVideo,
          height: 300,
        ),

        const SizedBox(height: 8),

        // === Media phụ (thumbnail) ===
        SizedBox(
          height: 50,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: subImages.length,
            itemBuilder: (context, index) {
              final item = subImages[index];
              final isSelected = _mainMediaUrl == item['url'];

              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: GestureDetector(
                  onTap: () {
                    setState(() {
                      _mainMediaUrl = item['url'];
                      _isMainVideo = item['isVideo'] == true;
                    });
                  },
                  child: Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: isSelected ? Colors.green : Colors.grey[300]!,
                        width: isSelected ? 2 : 1,
                      ),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: item['isVideo'] == true
                          ? Stack(
                        fit: StackFit.expand,
                        children: [
                          _videoThumbnail != null
                              ? Image.memory(
                            _videoThumbnail!,
                            fit: BoxFit.cover,
                          )
                              : Container(
                            color: Colors.grey[300],
                            child: const Center(
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                          ),
                          const Center(
                            child: Icon(
                              Icons.play_circle_fill,
                              color: Colors.white,
                              size: 30,
                            ),
                          ),
                        ],
                      )
                          : Image.network(
                        item['url'],
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),

        const SizedBox(height: 16),

        // === Tên sản phẩm ===
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            widget.product.name,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
        ),

        const SizedBox(height: 8),

        // === Giá sản phẩm ===
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            CurrencyFormatter.format(
              widget.product.variants.isNotEmpty
                  ? widget.product.variants[0].price
                  : 0.0,
            ),
            style: const TextStyle(fontSize: 18, color: Colors.red, fontWeight: FontWeight.bold),
          ),
        ),

        const SizedBox(height: 8),

        // === Đánh giá và lượt bán ===
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              const Icon(Icons.star, color: Colors.yellow, size: 20),
              const SizedBox(width: 4),
              Text(widget.product.averageRating.toStringAsFixed(1),
                  style: const TextStyle(fontSize: 16)),
              const SizedBox(width: 8),
              Text('(${widget.product.reviewCount} đánh giá)',
                  style: TextStyle(fontSize: 16, color: Colors.grey[600])),
              const Spacer(),
              Text('Đã bán: ${widget.product.soldCount}',
                  style: TextStyle(fontSize: 16, color: Colors.grey[600])),
            ],
          ),
        ),
      ],
    );
  }
}
