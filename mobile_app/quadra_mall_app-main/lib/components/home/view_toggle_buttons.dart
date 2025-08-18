import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/components/home/filter_modal.dart';

class ViewToggleButtons extends StatelessWidget {
  final bool isGrid;
  final void Function(bool) onChanged;

  const ViewToggleButtons({
    super.key,
    required this.isGrid,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        IconButton(
          icon: const Icon(Icons.filter_alt_outlined, size: 32,),
          onPressed: () {
            showFilterModal(context, (filters) {
              // Xử lý filters ở đây, ví dụ: cập nhật danh sách sản phẩm
              print(filters);
            });
          },
        ),
        const SizedBox(width: 8),
        // Grid view button
        GestureDetector(
          onTap: () {
            onChanged(true);
          },
          child: Container(
            decoration: BoxDecoration(
              color: isGrid ? const Color(0xFF1F4B3F) : Colors.transparent,
              border: Border.all(
                color: isGrid ? const Color(0xFF1F4B3F) : Colors.grey.shade300,
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            padding: const EdgeInsets.all(8),
            child: Icon(
              Icons.grid_view,
              color: isGrid ? Colors.white : Colors.black54,
            ),
          ),
        ),
        const SizedBox(width: 8),
        // List view button
        GestureDetector(
          onTap: () {
            onChanged(false);
          },
          child: Container(
            decoration: BoxDecoration(
              color: !isGrid ? const Color(0xFF1F4B3F) : Colors.transparent,
              border: Border.all(
                color: !isGrid ? const Color(0xFF1F4B3F) : Colors.grey.shade300,
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            padding: const EdgeInsets.all(8),
            child: Icon(
              Icons.view_list,
              color: !isGrid ? Colors.white : Colors.black54,
            ),
          ),
        ),
      ],
    );
  }
}