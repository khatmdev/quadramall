import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class CurrencyFormatter {
  /// Format a number to Vietnamese currency format with dot (.) as thousand separator
  /// Example: 1000000 -> 1.000.000
  static String formatPlain(dynamic amount) {
    if (amount == null) return '0';

    // Convert to double if it's not already
    double value = 0;
    if (amount is int) {
      value = amount.toDouble();
    } else if (amount is double) {
      value = amount;
    } else if (amount is String) {
      value = double.tryParse(amount) ?? 0;
    }

    // Create a NumberFormat with Vietnamese locale settings
    final formatter = NumberFormat('#,###', 'vi_VN');
    String formattedValue = formatter.format(value);

    // Replace commas with dots for Vietnamese format
    formattedValue = formattedValue.replaceAll(',', '.');

    return formattedValue;
  }

  /// Creates a RichText widget with formatted currency value and styled đ symbol
  static Widget buildRichText(dynamic amount, {
    TextStyle? valueStyle,
    TextStyle? symbolStyle,
    bool underlineSymbol = true,
  }) {
    final formattedValue = formatPlain(amount);

    // Default text styles if not provided
    valueStyle ??= const TextStyle(
      fontSize: 18,
      fontWeight: FontWeight.bold,
      color: Colors.red,
    );

    // Symbol style with smaller font and superscript
    symbolStyle ??= TextStyle(
      fontSize: valueStyle.fontSize != null ? valueStyle.fontSize! * 0.7 : 14,
      fontWeight: FontWeight.bold,
      color: valueStyle.color ?? Colors.red,
      decoration: underlineSymbol ? TextDecoration.underline : null,
      decorationThickness: 2.0,
      textBaseline: TextBaseline.alphabetic,
      fontFeatures: const [FontFeature.superscripts()],
    );

    return RichText(
      text: TextSpan(
        children: [
          TextSpan(
            text: formattedValue,
            style: valueStyle,
          ),
          const TextSpan(text: ' '),
          TextSpan(
            text: 'đ',
            style: symbolStyle,
          ),
        ],
      ),
    );
  }

  // Giữ lại các phương thức khác...
  static String format(dynamic amount, {bool showSymbol = true}) {
    if (amount == null) return '0 đ';

    // Convert to double if it's not already
    double value = 0;
    if (amount is int) {
      value = amount.toDouble();
    } else if (amount is double) {
      value = amount;
    } else if (amount is String) {
      value = double.tryParse(amount) ?? 0;
    }

    // Create a NumberFormat with Vietnamese locale settings
    final formatter = NumberFormat('#,###', 'vi_VN');
    String formattedValue = formatter.format(value);

    // Replace commas with dots for Vietnamese format
    formattedValue = formattedValue.replaceAll(',', '.');

    // Add currency symbol if requested
    if (showSymbol) {
      formattedValue += ' đ';
    }

    return formattedValue;
  }

  static String formatCompact(dynamic amount) {
    // Giữ lại phương thức này như cũ
    if (amount == null) return '0 đ';

    double value = 0;
    if (amount is int) {
      value = amount.toDouble();
    } else if (amount is double) {
      value = amount;
    } else if (amount is String) {
      value = double.tryParse(amount) ?? 0;
    }

    if (value >= 1000000000) {
      final billionValue = value / 1000000000;
      return '${billionValue.toStringAsFixed(billionValue.truncateToDouble() == billionValue ? 0 : 1)} tỷ đ';
    } else if (value >= 1000000) {
      final millionValue = value / 1000000;
      return '${millionValue.toStringAsFixed(millionValue.truncateToDouble() == millionValue ? 0 : 1)} triệu đ';
    } else if (value >= 1000) {
      final thousandValue = value / 1000;
      return '${thousandValue.toStringAsFixed(thousandValue.truncateToDouble() == thousandValue ? 0 : 1)} nghìn đ';
    } else {
      return '${value.toInt()} đ';
    }
  }

  static String formatWithDecimal(dynamic amount, {int decimalDigits = 2, bool showSymbol = true}) {
    // Giữ lại phương thức này như cũ
    if (amount == null) return '0 đ';

    double value = 0;
    if (amount is int) {
      value = amount.toDouble();
    } else if (amount is double) {
      value = amount;
    } else if (amount is String) {
      value = double.tryParse(amount) ?? 0;
    }

    final formatter = NumberFormat('#,##0.${decimalDigits > 0 ? '#' * decimalDigits : ''}', 'vi_VN');
    String formattedValue = formatter.format(value);

    formattedValue = formattedValue.replaceAll(',', 'temp').replaceAll('.', ',').replaceAll('temp', '.');

    if (showSymbol) {
      formattedValue += ' đ';
    }

    return formattedValue;
  }

  static double parse(String formattedAmount) {
    // Giữ lại phương thức này như cũ
    if (formattedAmount.isEmpty) return 0;

    String cleaned = formattedAmount.replaceAll('đ', '').trim();
    cleaned = cleaned.replaceAll('.', '');
    cleaned = cleaned.replaceAll(',', '.');

    return double.tryParse(cleaned) ?? 0;
  }
}