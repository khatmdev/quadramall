
import 'package:flutter/material.dart';

class HeaderWidget extends StatelessWidget {
  final List<String> breadcrumb;

  const HeaderWidget({
    super.key,
    required this.breadcrumb,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: breadcrumb.asMap().entries.map((entry) {
                  final isLast = entry.key == breadcrumb.length - 1;
                  return Row(
                    children: [
                      Text(
                        entry.value,
                        style: TextStyle(
                          color: isLast ? Colors.black : Colors.green,
                          fontSize: 14,
                        ),
                      ),
                      if (!isLast) ...[
                        const SizedBox(width: 4),
                        Icon(Icons.navigate_next, size: 16,),
                        const SizedBox(width: 4),
                      ],
                    ],
                  );
                }).toList(),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
