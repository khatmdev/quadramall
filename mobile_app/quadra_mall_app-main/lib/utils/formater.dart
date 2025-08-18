import 'package:intl/intl.dart';

class Formatter {
  /// Định dạng số tiền theo chuẩn Việt Nam, ví dụ: 10000 -> "10.000"
  static String formatCurrency(double amount) {
    final formatter = NumberFormat.currency(
      locale: 'vi_VN',
      symbol: '',        // Không hiện ₫, chỉ hiển thị số
      decimalDigits: 0,  // Không hiển thị phần thập phân
    );
    return formatter.format(amount).trim();
  }

  /// Nếu bạn muốn hiển thị có ký hiệu ₫:
  static String formatCurrencyWithSymbol(double amount) {
    final formatter = NumberFormat.currency(
      locale: 'vi_VN',
      symbol: '₫',
      decimalDigits: 0,
    );
    return formatter.format(amount);
  }
}