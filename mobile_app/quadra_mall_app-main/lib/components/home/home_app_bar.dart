import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/components/chat/shop_list_screen.dart';
import 'package:quarda_mall_home_app/components/shared/badge_icon.dart';
import 'package:quarda_mall_home_app/screens/notification_screen.dart';

class HomeAppBar extends StatelessWidget {
  const HomeAppBar({super.key});

  @override
  Widget build(BuildContext context) {
    final double topPadding = MediaQuery.of(context).padding.top;

    return SliverAppBar(
      pinned: true,
      floating: false,
      backgroundColor: Colors.white,
      automaticallyImplyLeading: false,
      expandedHeight: 105,
      flexibleSpace: LayoutBuilder(
        builder: (context, constraints) {
          final bool isCollapsed = constraints.maxHeight <= kToolbarHeight + topPadding + 10;

          return AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            padding: EdgeInsets.only(
              top: topPadding + 8,
              left: 16,
              right: 16,
              bottom: 8,
            ),
            child: AnimatedCrossFade(
              firstCurve: Curves.easeIn,
              secondCurve: Curves.easeOut,
              duration: const Duration(milliseconds: 250),
              crossFadeState: isCollapsed ? CrossFadeState.showSecond : CrossFadeState.showFirst,
              layoutBuilder: (topChild, topChildKey, bottomChild, bottomChildKey) {
                return Stack(
                  alignment: Alignment.topCenter,
                  children: [
                    Positioned(
                      key: bottomChildKey,
                      top: 0,
                      left: 0,
                      right: 0,
                      child: bottomChild,
                    ),
                    Positioned(
                      key: topChildKey,
                      top: 0,
                      left: 0,
                      right: 0,
                      child: topChild,
                    ),
                  ],
                );
              },
              firstChild: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Image.asset(
                            'assets/images/logo.png',
                            height: 32,
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'Quadra Mall',
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: Colors.pink,
                            ),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          BadgeIcon(
                            icon: Icons.chat_bubble_outline,
                            unread: true,
                            onTap: () {
                              _openChat(context);
                            },
                          ),
                          const SizedBox(width: 8),
                          BadgeIcon(
                            icon: Icons.notifications_none_outlined,
                            unread: false,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const NotificationScreen()),
                              );
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _buildSearchBar(fullWidth: true),
                ],
              ),
              secondChild: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Thanh tìm kiếm ngắn hơn
                  Expanded(
                    child: _buildSearchBar(fullWidth: false),
                  ),
                  const SizedBox(width: 8),
                  BadgeIcon(
                    icon: Icons.chat_bubble_outline,
                    unread: true,
                    onTap: () {
                      _openChat(context);
                    },
                  ),
                  const SizedBox(width: 8),
                  BadgeIcon(
                    icon: Icons.notifications_none_outlined,
                    unread: false,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const NotificationScreen()),
                      );
                    },
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSearchBar({required bool fullWidth}) {
    return Container(
      height: 40,
      width: fullWidth ? double.infinity : null,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.grey.shade400),
      ),
      child: Row(
        children: [
          const SizedBox(width: 12),
          const Icon(Icons.search, color: Colors.green),
          const SizedBox(width: 8),
          const Expanded(
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Tìm sản phẩm',
                border: InputBorder.none,
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.tune, color: Colors.grey),
            onPressed: () {},
          ),
        ],
      ),
    );
  }
  
  void _openChat(context){
    Navigator.push(
        context, 
        MaterialPageRoute(builder: (_) => ShopListScreen())
    );
  }
}

