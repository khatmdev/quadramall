
import 'package:flutter/material.dart';

class FeatureShop extends StatelessWidget {
  final String name;
  final double rating;
  final String imageUrl;

  const FeatureShop({
    super.key,
    required this.name,
    required this.rating,
    required this.imageUrl,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 160,
      margin: const EdgeInsets.only(right: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 160,
            decoration: BoxDecoration(
              color: Colors.grey.shade200,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(child: Image.asset(imageUrl)),
          ),
          const SizedBox(height: 8),
          Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
          Row(
            children: [
              Text(rating.toString(), style: TextStyle(color: Colors.green.shade700)),
              Icon(Icons.star, color: Colors.red, size: 18,),
            ],
          ),
        ],
      ),
    );
  }
}
