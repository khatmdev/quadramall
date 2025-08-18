import 'package:flutter/material.dart';

class FilterModal extends StatefulWidget {
  final Function(Map<String, dynamic>) onApplyFilter;

  const FilterModal({super.key, required this.onApplyFilter});

  @override
  _FilterModalState createState() => _FilterModalState();
}

class _FilterModalState extends State<FilterModal> {
  String? selectedLocation;
  String? selectedCategory;
  double minPrice = 0;
  double maxPrice = 1500;
  bool fourStars = false;
  bool sameDayDelivery = false;
  bool cod = false;
  bool discount = false;

  final List<String> locations = ['Bandung', 'Jakarta', 'Medan', 'Surabaya', 'Jogja'];
  final List<String> categories = ['Electronic', 'Fashion', 'Action Figure', 'Book', 'Gaming'];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Filter Option',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          const Text('Best Filter'),
          CheckboxListTile(
            title: const Text('4 stars or upper'),
            value: fourStars,
            onChanged: (value) {
              setState(() {
                fourStars = value ?? false;
              });
            },
          ),
          CheckboxListTile(
            title: const Text('Same-day delivery'),
            value: sameDayDelivery,
            onChanged: (value) {
              setState(() {
                sameDayDelivery = value ?? false;
              });
            },
          ),
          CheckboxListTile(
            title: const Text('COD'),
            value: cod,
            onChanged: (value) {
              setState(() {
                cod = value ?? false;
              });
            },
          ),
          CheckboxListTile(
            title: const Text('Discount'),
            value: discount,
            onChanged: (value) {
              setState(() {
                discount = value ?? false;
              });
            },
          ),
          const SizedBox(height: 16),
          const Text('Location'),
          DropdownButton<String>(
            hint: const Text('Select Location'),
            value: selectedLocation,
            isExpanded: true,
            items: locations.map((String value) {
              return DropdownMenuItem<String>(
                value: value,
                child: Text(value),
              );
            }).toList(),
            onChanged: (value) {
              setState(() {
                selectedLocation = value;
              });
            },
          ),
          const SizedBox(height: 16),
          const Text('Category'),
          DropdownButton<String>(
            hint: const Text('Select Category'),
            value: selectedCategory,
            isExpanded: true,
            items: categories.map((String value) {
              return DropdownMenuItem<String>(
                value: value,
                child: Text(value),
              );
            }).toList(),
            onChanged: (value) {
              setState(() {
                selectedCategory = value;
              });
            },
          ),
          const SizedBox(height: 16),
          const Text('Price Range'),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Minimum price'),
                  initialValue: minPrice.toString(),
                  onChanged: (value) {
                    setState(() {
                      minPrice = double.tryParse(value) ?? 0;
                    });
                  },
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: TextFormField(
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Maximum price'),
                  initialValue: maxPrice.toString(),
                  onChanged: (value) {
                    setState(() {
                      maxPrice = double.tryParse(value) ?? 1500;
                    });
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () {
                  final filters = {
                    'fourStars': fourStars,
                    'sameDayDelivery': sameDayDelivery,
                    'cod': cod,
                    'discount': discount,
                    'location': selectedLocation,
                    'category': selectedCategory,
                    'minPrice': minPrice,
                    'maxPrice': maxPrice,
                  };
                  widget.onApplyFilter(filters);
                  Navigator.pop(context);
                },
                child: const Text('Apply'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

void showFilterModal(BuildContext context, Function(Map<String, dynamic>) onApplyFilter) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    builder: (context) => Padding(
      padding: MediaQuery.of(context).viewInsets,
      child: FilterModal(onApplyFilter: onApplyFilter),
    ),
  );
}