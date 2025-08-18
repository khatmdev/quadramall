import 'dart:convert';
import 'package:http/http.dart' as http;
import 'dart:developer';

class ApiService {
  static const String _baseUrl = 'http://10.0.2.2:8080';

  Future<Map<String, dynamic>> get(String endpoint) async {
    try {
      final url = Uri.parse('$_baseUrl$endpoint');
      log('Sending GET request to: $url');
      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
        },
      );

      log('Response status: ${response.statusCode}');
      log('Response body: ${response.body}');

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else if (response.statusCode == 404) {
        throw Exception('Sản phẩm không tìm thấy');
      } else {
        throw Exception('Lỗi khi gọi API: ${response.statusCode}, Body: ${response.body}');
      }
    } catch (e) {
      log('Error: $e');
      throw Exception('Lỗi kết nối: $e');
    }
  }
}