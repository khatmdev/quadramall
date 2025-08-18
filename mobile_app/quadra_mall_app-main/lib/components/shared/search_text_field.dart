import 'package:flutter/material.dart';
import 'dart:async'; // Cho debounce
import 'package:http/http.dart' as http; // Giả định dùng http để gọi API

class SearchTextField extends StatefulWidget {
  final String hintText;
  final Function(String)? onSearch; // Callback để xử lý kết quả tìm kiếm
  final String? apiUrl; // Tùy chọn để ghi đè URL mặc định

  const SearchTextField({
    super.key,
    this.hintText = 'Tìm kiếm ...', // Giá trị mặc định
    this.onSearch,
    this.apiUrl, // Tùy chọn
  });

  @override
  _SearchTextFieldState createState() => _SearchTextFieldState();
}

class _SearchTextFieldState extends State<SearchTextField> {
  final TextEditingController _controller = TextEditingController();
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _controller.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    if (_debounce?.isActive ?? false) _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      if (_controller.text.isNotEmpty) {
        _search(_controller.text);
      }
    });
  }

  Future<void> _search(String query) async {
    // Sử dụng apiUrl từ widget, nếu null thì dùng giá trị mặc định
    final String effectiveApiUrl = widget.apiUrl ?? 'https://your-default-api-endpoint/search';
    try {
      final response = await http.get(Uri.parse('$effectiveApiUrl?q=$query'));
      if (response.statusCode == 200) {
        // Xử lý kết quả từ API (giả định trả về JSON)
        if (widget.onSearch != null) {
          widget.onSearch!(query); // Truyền query hoặc dữ liệu từ response
        }
      } else {
        // Xử lý lỗi nếu cần
      }
    } catch (e) {
      // Xử lý ngoại lệ
    }
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: _controller,
      decoration: InputDecoration(
        contentPadding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
        hintText: widget.hintText,
        hintStyle: const TextStyle(color: Colors.grey),
        suffixIcon: const Icon(Icons.search, color: Colors.green),
        filled: true,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.0),
          borderSide: BorderSide.none,
        ),
        fillColor: Colors.green.withAlpha(30),
      ),
    );
  }
}