import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/components/checkout/voucher/system_voucher_dialog.dart';

class Voucher extends StatelessWidget {
  const Voucher({Key? key}) : super(key: key);

  void _showVoucherDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return SystemVoucherDialog();
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 3,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 15),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Quadra voucher'),
                Row(
                  children: [
                    IconButton(
                      onPressed: () {},
                      icon: Icon(
                        Icons.local_offer,
                        size: 15,
                        color: Colors.green,
                      ),
                    ),
                    Text("-5k", textAlign: TextAlign.left),
                    IconButton(
                      onPressed: () {_showVoucherDialog(context);},
                      icon: Icon(Icons.arrow_forward_ios, size: 14),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
