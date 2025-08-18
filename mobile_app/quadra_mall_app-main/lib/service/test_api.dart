import 'dart:developer';
import 'package:quarda_mall_home_app/service/api_service.dart';
import 'package:quarda_mall_home_app/service/products_service.dart';
import 'package:quarda_mall_home_app/models/product_detail_model.dart';

void testApi() async {
  try {
    // Khởi tạo service
    final apiService = ApiService();
    final productService = ProductsService(apiService);

    // Gọi API với slug mẫu
    const slug = 'test-lan-cuoi-14';
    log('Đang gọi API cho slug: $slug');

    final productDetail = await productService.getProductDetail(slug);

    // In thông tin cơ bản để kiểm tra
    log('Dữ liệu sản phẩm nhận được:');
    log('ID: ${productDetail.id}');
    log('Tên: ${productDetail.name}');
    log('Slug: ${productDetail.slug}');
    log('Mô tả: ${productDetail.description}');
    log('Thumbnail URL: ${productDetail.thumbnailUrl}');
    log('Số lượng biến thể: ${productDetail.variants.length}');
    log('Số lượng addon groups: ${productDetail.addonGroups.length}');
    log('Số lượng discount codes: ${productDetail.discountCodes.length}');
    log('Số lượng reviews: ${productDetail.reviews.length}');
  } catch (e) {
    log('Lỗi khi gọi API: $e');
  }
}

void main() {
  testApi();
}