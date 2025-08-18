import 'package:quarda_mall_home_app/service/api_service.dart';
import 'package:quarda_mall_home_app/models/product_detail_model.dart';
import 'dart:developer';

class ProductsService {
  final ApiService _apiService;

  ProductsService(this._apiService);

  Future<ProductDetail> getProductDetail(String slug) async {
    final response = await _apiService.get('/products/$slug');
    log('API Response: $response'); // In dữ liệu JSON nhận được
    return ProductDetail.fromJson(response);
  }
}