import 'package:flutter/material.dart';

class CartAppBar extends StatelessWidget implements PreferredSizeWidget {
  final bool isAllSelected;
  final bool isAnySelected;
  final VoidCallback onSelectAll;
  final VoidCallback onDeleteAll;

  const CartAppBar({
    super.key,
    required this.isAllSelected,
    required this.isAnySelected,
    required this.onSelectAll,
    required this.onDeleteAll,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      automaticallyImplyLeading: false,
      title: const Padding(
        padding: EdgeInsets.only(left: 8),
        child: Text(
          'Giỏ hàng',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: Color(0xFF4CAF50),
          ),
        ),
      ),
      actions: [
        Checkbox(
          value: isAllSelected,
          onChanged: (value) => onSelectAll(),
        ),
        IconButton(
          icon: Icon(Icons.delete_forever, color: isAnySelected ? Colors.red : Colors.grey, size: 30),
          onPressed: isAnySelected ? onDeleteAll : null,
        ),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
