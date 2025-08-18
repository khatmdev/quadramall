import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/components/checkout/action_buttons.dart';
import 'package:quarda_mall_home_app/components/checkout/address/shipping_address.dart';
import 'package:quarda_mall_home_app/components/checkout/payment/payment_method_section.dart';
import 'package:quarda_mall_home_app/components/checkout/price_row.dart';
import 'package:quarda_mall_home_app/components/checkout/product_item.dart';
import 'package:quarda_mall_home_app/components/checkout/product_sumary_section.dart';
import 'package:quarda_mall_home_app/components/checkout/shop_product.dart';
import 'package:quarda_mall_home_app/components/checkout/voucher_note.dart';
import 'package:quarda_mall_home_app/utils/formater.dart';

class CheckoutScreen extends StatelessWidget {
  const CheckoutScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Thanh toán'),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
        elevation: 2,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.0),
        child: ConstrainedBox(
          constraints: BoxConstraints(
            minHeight:
                MediaQuery.of(context).size.height -
                kToolbarHeight -
                MediaQuery.of(context).padding.top,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: 20,),
              ShippingAddressSection(userId: '234',),
              SizedBox(height: 20,),
              Text(
                'Sản phẩm',
                style: TextStyle(
                  fontSize: 16.5,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              SizedBox(height: 12),
              ShopProductSession(),
              Card(
                elevation: 3,
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Ten shop
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 10,
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.home_filled),
                            SizedBox(width: 10),
                            Text(
                              'QuadraBig',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: 10.0),
                      ProductItem(
                        name: 'Logitech G435 Gaming Headsets',
                        price: 13200000,
                        quantity: 1,
                        imageUrl: 'assets/images/ao.webp',
                      ),

                      SizedBox(height: 10),
                      Divider(),
                      Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Text(
                                'Voucher từ shop',
                                style: TextStyle(fontSize: 13),
                              ),
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
                                  Text("- 0đ", textAlign: TextAlign.left),
                                  IconButton(
                                    onPressed: () {},
                                    icon: Icon(Icons.arrow_forward_ios, size: 14),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Container(
                            height: 20,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                Text(
                                  'Ghi chú cho shop',
                                  style: TextStyle(fontSize: 13),
                                ),
                                IconButton(
                                  onPressed: () {},
                                  icon: Icon(Icons.arrow_forward_ios, size: 13),

                                  constraints:
                                      BoxConstraints(), // Loại bỏ kích thước tối thiểu
                                ),
                              ],
                            ),
                          ),
                          SizedBox(height: 10),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Tổng tiền hàng',
                                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                              ),
                              Text(
                                Formatter.formatCurrencyWithSymbol(13200000),
                                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.red),
                                textAlign: TextAlign.right,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              SizedBox(height: 20),
              Voucher(),
              SizedBox(height: 20),
              PaymentMethodSection(),
              SizedBox(height: 20),
              ProductSummarySection(),
              SizedBox(height: 20),
              ActionButtons(),

            ],
          ),
        ),
      ),
    );
  }
}
