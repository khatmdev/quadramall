import 'package:flutter/material.dart';

class CartItem extends StatelessWidget {
  final String productName;
  final String storeLocation;
  final double price;
  final int quantity;
  final bool isSelected;
  final bool isLast;
  final VoidCallback onSelect;
  final VoidCallback onIncrease;
  final VoidCallback onDecrease;
  final VoidCallback onDelete;

  const CartItem({
    super.key,
    required this.productName,
    required this.storeLocation,
    required this.price,
    required this.quantity,
    required this.isSelected,
    required this.isLast,
    required this.onSelect,
    required this.onIncrease,
    required this.onDecrease,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            children: [
              Checkbox(
                value: isSelected,
                onChanged: (value) => onSelect(),
                checkColor: Colors.white,
                activeColor: Colors.green,
              ),
              SizedBox(width: 4,),
              const Icon(Icons.headphones),
              SizedBox(width: 4,),
              Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    spacing: 5,
                    children: [
                      Text(
                        productName,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      Text(storeLocation, style: const TextStyle(color: Colors.grey)),
                      Text('\$$price', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                    ],
                  ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Thêm vào yêu thích', style: TextStyle(color: Colors.grey, fontSize: 14),),
              Row(
                children: [
                  DecoratedBox(
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: Colors.grey.shade300,
                      ),
                      borderRadius: BorderRadius.circular(15),
                      color: Colors.white,
                    ),
                    child: Row(
                      children: [
                        IconButton(
                            icon: const Icon(
                              Icons.remove,
                              size: 20,
                            ),
                            onPressed: onDecrease
                        ),
                        Text(
                          '$quantity',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        IconButton(
                          icon: Icon(Icons.add, color: Colors.green, size: 20,), 
                          onPressed: onIncrease,
                        )
                      ],
                    ),
                  ),
                  const SizedBox(width: 8,),
                  DecoratedBox(
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: Colors.grey.shade300,
                      ),
                      borderRadius: BorderRadius.circular(15),
                      color: Colors.white,
                    ),
                    child: IconButton(
                        icon: const Icon(Icons.delete_outline_rounded, color: Colors.red,),
                        onPressed: onDelete
                    ),
                  ),
                ],
              ),
            ],
          ),
          // Đường viền dưới 80%
          const SizedBox(height: 16), // khoảng cách với đường kẻ
          if(!isLast)
            FractionallySizedBox(
              widthFactor: 0.8, // ✅ Chiếm 80% chiều ngang
              child: Container(
                height: 1,
                color: Colors.grey.shade400,
              ),
            )
        ],
      ),
    );
  }
}