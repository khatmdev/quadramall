import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/components/checkout/address/address_bottomSheet.dart';

class Address {
  String id;
  String name;
  String phone;
  String fullAddress;
  bool isDefault;

  Address({
    required this.id,
    required this.name,
    required this.phone,
    required this.fullAddress,
    this.isDefault = false,
  });
}

class AddressListScreen extends StatefulWidget {
  @override
  _AddressListScreenState createState() => _AddressListScreenState();
}

class _AddressListScreenState extends State<AddressListScreen> {
  List<Address> addresses = [
    Address(
      id: '1',
      name: 'Gofanny Karina',
      phone: '081277939572',
      fullAddress: '2021 Royalty Boulevard Portland, OR 98199',
      isDefault: true,
    ),
    Address(
      id: '2',
      name: 'Anna Lin',
      phone: '081234567890',
      fullAddress: '1234 NW Wilson St, Portland, OR 97229',
    ),
  ];

  void setDefaultAddress(String id) {
    setState(() {
      for (var address in addresses) {
        address.isDefault = address.id == id;
      }
    });
  }

  void editAddress(Address address) {
    // TODO: Điều hướng tới màn hình chỉnh sửa địa chỉ

      showAddressFormBottomSheet(
        context: context,
        existingAddress: {
          'name': address.name,
          'phone': address.phone,
          'address': address.fullAddress,
          'isMain': address.isDefault,
        },
        onSave: (data) {
          setState(() {
            address.name = data['name'];
            address.phone = data['phone'];
            address.fullAddress = data['address'];
            address.isDefault = data['isMain'];

            if (address.isDefault) {
              setDefaultAddress(address.id);
            }
          });
        },
      );
  }

  void addNewAddress() {
    // TODO: Điều hướng tới màn hình thêm địa chỉ mới
      showAddressFormBottomSheet(
        context: context,
        onSave: (data) {
          setState(() {
            final newId = (addresses.length + 1).toString();
            addresses.add(Address(
              id: newId,
              name: data['name'],
              phone: data['phone'],
              fullAddress: data['address'],
              isDefault: data['isMain'],
            ));

            // Nếu chọn là mặc định thì reset các địa chỉ khác
            if (data['isMain']) {
              setDefaultAddress(newId);
            }
          });
        },
      );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Địa chỉ của tôi'),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      body: ListView.builder(
        itemCount: addresses.length,
        itemBuilder: (context, index) {
          final addr = addresses[index];
          return Card(
            margin: EdgeInsets.all(12),
            child: ListTile(
              leading: Icon(Icons.location_on, color: Colors.green),
              title: Row(
                children: [
                  Text(addr.name, style: TextStyle(fontWeight: FontWeight.bold)),
                  SizedBox(width: 8),
                  if (addr.isDefault)
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.green.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text('Mặc định', style: TextStyle(fontSize: 12, color: Colors.green)),
                    ),
                ],
              ),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(addr.phone),
                  SizedBox(height: 2),
                  Text(addr.fullAddress),
                ],
              ),
              trailing: PopupMenuButton<String>(
                onSelected: (value) {
                  if (value == 'default') setDefaultAddress(addr.id);
                  if (value == 'edit') editAddress(addr);
                },
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 6,
                offset: const Offset(0, 40), // Hiển thị thấp hơn một chút
                itemBuilder: (context) => [
                  PopupMenuItem(
                    value: 'default',
                    child: Row(
                      children: const [
                        Icon(Icons.check_circle_outline, color: Colors.green),
                        SizedBox(width: 10),
                        Text(
                          'Chọn làm mặc định',
                          style: TextStyle(fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                  ),
                  PopupMenuItem(
                    value: 'edit',
                    child: Row(
                      children: const [
                        Icon(Icons.edit_outlined, color: Colors.blue),
                        SizedBox(width: 10),
                        Text(
                          'Chỉnh sửa',
                          style: TextStyle(fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                  ),
                ],
                icon: Icon(Icons.more_vert, color: Colors.grey[700]),
              ),

            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: addNewAddress,
        label: Text('Thêm địa chỉ'),
        icon: Icon(Icons.add_location_alt),
        backgroundColor: Colors.green,
      ),
    );
  }
}
