import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/components/profile/edit_payment.dart';

class PaymentMethodScreen extends StatefulWidget {
  const PaymentMethodScreen({super.key});

  @override
  State<PaymentMethodScreen> createState() => _PaymentMethodScreenState();
}

class _PaymentMethodScreenState extends State<PaymentMethodScreen> {
  final List<Map<String, dynamic>> paymentMethods = [
    {
      'id': '1',
      'type': 'Visa',
      'cardNumber': '**** **** **** 1234',
      'expiry': '12/26',
      'isDefault': true,
      'imageUrl': 'assets/images/vnpay.png', // Placeholder for Visa logo
    },
    {
      'id': '2',
      'type': 'Momo',
      'cardNumber': '**** **** **** 5678',
      'expiry': '',
      'isDefault': false,
      'imageUrl': 'assets/images/momo.png', // Placeholder for Momo logo
    },
  ];

  void _addNewPaymentMethod() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const AddPaymentMethodScreen()),
    ).then((value) {
      if (value != null && value is Map<String, dynamic>) {
        setState(() {
          paymentMethods.add(value);
        });
      }
    });
  }

  void _deletePaymentMethod(String id) {
    setState(() {
      paymentMethods.removeWhere((method) => method['id'] == id);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text(
          'Đã xóa phương thức thanh toán',
          style: TextStyle(fontFamily: 'Roboto'),
        ),
        backgroundColor: Colors.green.shade600,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  void _setDefaultPaymentMethod(String id) {
    setState(() {
      for (var method in paymentMethods) {
        method['isDefault'] = method['id'] == id;
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text(
          'Đã đặt làm phương thức mặc định',
          style: TextStyle(fontFamily: 'Roboto'),
        ),
        backgroundColor: Colors.green.shade600,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
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
          'Phương Thức Thanh Toán',
          style: TextStyle(
            color: Colors.black87,
            fontWeight: FontWeight.w700,
            fontSize: 20,
            fontFamily: 'Roboto',
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.add, color: Colors.green.shade600),
            onPressed: _addNewPaymentMethod,
            tooltip: 'Thêm phương thức',
          ),
        ],
      ),
      body: paymentMethods.isEmpty
          ? _buildEmptyPaymentMethod()
          : ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        itemCount: paymentMethods.length,
        itemBuilder: (context, index) {
          return AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeInOut,
            margin: const EdgeInsets.only(bottom: 16),
            child: _buildPaymentMethodCard(paymentMethods[index]),
          );
        },
      ),
    );
  }

  Widget _buildEmptyPaymentMethod() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.payment_outlined,
            size: 100,
            color: Colors.grey.shade300,
          ),
          const SizedBox(height: 16),
          Text(
            'Chưa có phương thức thanh toán',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w500,
              color: Colors.grey.shade600,
              fontFamily: 'Roboto',
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Hãy thêm phương thức thanh toán của bạn',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade500,
              fontFamily: 'Roboto',
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _addNewPaymentMethod,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green.shade600,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 2,
            ),
            icon: const Icon(Icons.add, size: 20),
            label: const Text(
              'Thêm phương thức',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                fontFamily: 'Roboto',
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentMethodCard(Map<String, dynamic> method) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.asset(
                method['imageUrl'],
                width: 50,
                height: 50,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: Colors.green.shade50,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      Icons.broken_image,
                      color: Colors.green.shade600,
                      size: 24,
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        method['type'],
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          fontFamily: 'Roboto',
                          color: Colors.black87,
                        ),
                      ),
                      if (method['isDefault'])
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.green.shade600.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.green.shade600.withOpacity(0.3)),
                          ),
                          child: Text(
                            'Mặc định',
                            style: TextStyle(
                              color: Colors.green.shade600,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              fontFamily: 'Roboto',
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    method['cardNumber'],
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey.shade600,
                      fontFamily: 'Roboto',
                    ),
                  ),
                  if (method['expiry'].isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      'Hết hạn: ${method['expiry']}',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade600,
                        fontFamily: 'Roboto',
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 12),
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (!method['isDefault'])
                  IconButton(
                    onPressed: () => _setDefaultPaymentMethod(method['id']),
                    icon: Icon(
                      Icons.check_circle,
                      color: Colors.green.shade600,
                      size: 24,
                    ),
                    tooltip: 'Đặt làm mặc định',
                  ),
                IconButton(
                  onPressed: () => _deletePaymentMethod(method['id']),
                  icon: Icon(
                    Icons.delete,
                    color: Colors.red.shade600,
                    size: 24,
                  ),
                  tooltip: 'Xóa',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}