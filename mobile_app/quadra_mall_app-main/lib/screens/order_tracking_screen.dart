import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/components/order/order_data.dart';
import 'package:quarda_mall_home_app/components/order/order_list_view.dart';
import 'package:quarda_mall_home_app/components/order/order_model.dart';

class OrderTrackingScreen extends StatefulWidget {
  const OrderTrackingScreen({super.key});

  @override
  State<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends State<OrderTrackingScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<String> tabs = [
    'Tất cả',
    'Chờ xử lý',
    'Đã xác nhận',
    'Đang giao hàng',
    'Đã giao hàng',
    'Hoàn thành',
    'Đã hủy/Hoàn tiền',
  ];

  final Map<String, String?> tabStatusMap = {
    'Tất cả': null,
    'Chờ xử lý' : 'PENDING',
    'Đã xác nhận': 'CONFIRMED',
    'Đang giao hàng': 'SHIPPING',
    'Đã giao hàng': 'DELIVERED',
    'Đã hủy/Hoàn tiền': 'CANCELLED',
    'Hoàn thành': 'COMPLETED',
  };

  List<Order> getOrdersByStatus(String tabTitle) {
    final status = tabStatusMap[tabTitle];
    if (status == null) return orders;
    return orders.where((o) => o.status == status).toList();
  }

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: tabs.length,
      vsync: this,
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: tabs.length,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Đơn hàng của tôi', style: TextStyle(fontWeight: FontWeight.bold),),
          backgroundColor: Colors.white,
          foregroundColor: Colors.green,
          bottom: TabBar(
            controller: _tabController,
            tabAlignment: TabAlignment.start,
            isScrollable: true,
            labelColor: Colors.pink,
            indicatorColor: Colors.pinkAccent,
            tabs: tabs.map((title) => Tab(text: title)).toList(),
          ),
        ),
        body: TabBarView(
          controller: _tabController,
          children: tabs.map((tabTitle) {
            final status = tabStatusMap[tabTitle];
            return OrderListView(status: status);
          }).toList(),
        ),
      ),
    );
  }
}

