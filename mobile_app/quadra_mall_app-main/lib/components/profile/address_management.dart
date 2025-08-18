
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/components/profile/edit_address.dart';

class AddressManagementScreen extends StatefulWidget {
  const AddressManagementScreen({super.key});

  @override
  State<AddressManagementScreen> createState() => _AddressManagementScreenState();
}

class _AddressManagementScreenState extends State<AddressManagementScreen> {
  final List<Map<String, dynamic>> addresses = [
    {
      'id': '1',
      'name': 'Tạ Văn Đạt',
      'phone': '0559011438',
      'address': '123 Đường Láng, Đống Đa, Hà Nội',
      'isDefault': true,
    },
    {
      'id': '2',
      'name': 'Tạ Văn Đạt',
      'phone': '0559011438',
      'address': '456 Nguyễn Trãi, Thanh Xuân, Hà Nội',
      'isDefault': false,
    },
  ];

  void _addNewAddress() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const AddAddressScreen()),
    );
  }

  void _editAddress(Map<String, dynamic> address) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddAddressScreen(address: address),
      ),
    );
  }

  void _deleteAddress(String id) {
    setState(() {
      addresses.removeWhere((address) => address['id'] == id);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Đã xóa địa chỉ'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _setDefaultAddress(String id) {
    setState(() {
      for (var address in addresses) {
        address['isDefault'] = address['id'] == id;
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Đã đặt làm địa chỉ mặc định'),
        backgroundColor: Colors.green,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black87),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Địa chỉ giao hàng',
          style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w600),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: Colors.green),
            onPressed: _addNewAddress,
          ),
        ],
      ),
      body: addresses.isEmpty
          ? _buildEmptyAddress()
          : ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: addresses.length,
        itemBuilder: (context, index) {
          return _buildAddressCard(addresses[index]);
        },
      ),
    );
  }

  Widget _buildEmptyAddress() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.location_on_outlined,
            size: 80,
            color: Colors.grey[300],
          ),
          const SizedBox(height: 16),
          Text(
            'Chưa có địa chỉ nào',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w500,
              color: Colors.grey[500],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Hãy thêm địa chỉ giao hàng của bạn',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[400],
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _addNewAddress,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text('Thêm địa chỉ'),
          ),
        ],
      ),
    );
  }

  Widget _buildAddressCard(Map<String, dynamic> address) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                address['name'],
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
              if (address['isDefault'])
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'Mặc định',
                    style: TextStyle(
                      color: Colors.green,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            address['phone'],
            style: const TextStyle(
              fontSize: 14,
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            address['address'],
            style: const TextStyle(
              fontSize: 14,
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton(
                onPressed: () => _editAddress(address),
                child: const Text(
                  'Chỉnh sửa',
                  style: TextStyle(color: Colors.green),
                ),
              ),
              const SizedBox(width: 8),
              TextButton(
                onPressed: () => _deleteAddress(address['id']),
                child: const Text(
                  'Xóa',
                  style: TextStyle(color: Colors.red),
                ),
              ),
              if (!address['isDefault']) ...[
                const SizedBox(width: 8),
                TextButton(
                  onPressed: () => _setDefaultAddress(address['id']),
                  child: const Text(
                    'Đặt mặc định',
                    style: TextStyle(color: Colors.green),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}