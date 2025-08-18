import 'package:flutter/material.dart';

class PaginationWidget extends StatefulWidget {
  final int totalPages;
  final int currentPage;
  final Function(int) onPageChanged;

  const PaginationWidget({
    required this.totalPages,
    required this.currentPage,
    required this.onPageChanged,
    super.key,
  });

  @override
  _PaginationWidgetState createState() => _PaginationWidgetState();
}

class _PaginationWidgetState extends State<PaginationWidget> {
  final TextEditingController _pageController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          ..._buildPageNumbers(),
        ],
      ),
    );
  }

  List<Widget> _buildPageNumbers() {
    List<Widget> pageWidgets = [];

    if (widget.totalPages <= 1) {
      return pageWidgets;
    }

    // Always show page 1
    pageWidgets.add(_buildPageButton(1));

    // Add ellipsis if current page is far from the start
    if (widget.currentPage >= 4) {
      pageWidgets.add(_buildEllipsis());
    }

    // Calculate range around current page
    int start = (widget.currentPage - 1).clamp(2, widget.totalPages - 1);
    int end = (widget.currentPage + 1).clamp(2, widget.totalPages - 1);
    for (int i = start; i <= end; i++) {
      pageWidgets.add(_buildPageButton(i));
    }

    // Add ellipsis if current page is far from the end
    if (widget.currentPage <= widget.totalPages - 3) {
      pageWidgets.add(_buildEllipsis());
    }

    // Always show last page if more than one page
    if (widget.totalPages > 1) {
      pageWidgets.add(_buildPageButton(widget.totalPages));
    }

    return pageWidgets;
  }

  Widget _buildPageButton(int page) {
    bool isCurrent = page == widget.currentPage;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4.0),
      child: ElevatedButton(
        onPressed: () {
          if (page != widget.currentPage) {
            widget.onPageChanged(page);
          }
        },
        style: ElevatedButton.styleFrom(
          minimumSize: const Size(30, 30),
          padding: const EdgeInsets.all(0),
          backgroundColor: isCurrent ? const Color(0xFF00C4B4) : Colors.white,
          foregroundColor: isCurrent ? Colors.white : const Color(0xFF00C4B4),
          side: isCurrent ? null : const BorderSide(color: Color(0xFF00C4B4)),
          shape: const CircleBorder(),
          elevation: isCurrent ? 2 : 0,
        ),
        child: Text(
          '$page',
          style: const TextStyle(fontSize: 14),
        ),
      ),
    );
  }

  Widget _buildEllipsis() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4.0),
      child: ElevatedButton(
        onPressed: _showPageInputDialog,
        style: ElevatedButton.styleFrom(
          minimumSize: const Size(30, 30),
          padding: const EdgeInsets.all(0),
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFF00C4B4),
          side: const BorderSide(color: Color(0xFF00C4B4)),
          shape: const CircleBorder(),
        ),
        child: const Text(
          '...',
          style: TextStyle(fontSize: 14),
        ),
      ),
    );
  }

  void _showPageInputDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Nhập số trang'),
          content: TextField(
            controller: _pageController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(hintText: 'Số trang'),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Hủy'),
            ),
            TextButton(
              onPressed: () {
                int? page = int.tryParse(_pageController.text);
                if (page != null) {
                  if (page > widget.totalPages) {
                    widget.onPageChanged(widget.totalPages);
                  } else if (page < 1) {
                    widget.onPageChanged(1);
                  } else {
                    widget.onPageChanged(page);
                  }
                }
                Navigator.pop(context);
              },
              child: const Text('OK'),
            ),
          ],
        );
      },
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }
}