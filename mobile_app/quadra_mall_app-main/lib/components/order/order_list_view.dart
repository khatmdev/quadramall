import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/components/order/order_cart_UI.dart';
import 'package:quarda_mall_home_app/components/order/order_data.dart';
import 'package:quarda_mall_home_app/components/order/order_model.dart';

class OrderListView extends StatefulWidget {
  final String? status;

  const OrderListView({super.key, this.status});

  @override
  State<OrderListView> createState() => _OrderListViewState();
}

class _OrderListViewState extends State<OrderListView>
    with AutomaticKeepAliveClientMixin {
  List<Order> get filteredOrders {
    if (widget.status == null) return orders;
    return orders.where((o) => o.status == widget.status).toList();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context); // Important when using AutomaticKeepAliveClientMixin
    if (filteredOrders.isEmpty) {
      return const Center(child: Text('Không có đơn hàng nào.'));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: filteredOrders.length,
      itemBuilder: (context, index) {
        return OrderCard(order: filteredOrders[index]);
      },
    );
  }

  @override
  bool get wantKeepAlive => true;
}
