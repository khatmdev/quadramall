import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/models/product_detail_model.dart';
import 'package:quarda_mall_home_app/utils/currency_formatter.dart';

class ProductVariants extends StatefulWidget {
  final ProductDetail product;
  final Color? primaryColor;
  final bool isBuyNow;
  final Function(Map<String, dynamic>, int)? onVariantSelected;

  const ProductVariants({
    Key? key,
    required this.product,
    this.primaryColor,
    this.isBuyNow = false,
    this.onVariantSelected,
  }) : super(key: key);

  @override
  State<ProductVariants> createState() => _ProductVariantsState();
}

class _ProductVariantsState extends State<ProductVariants> {
  Map<String, String> _selectedVariantAttributes = {};
  Map<int, bool> _selectedAddons = {};
  int _selectedQuantity = 1;
  late double _basePrice;
  late double _currentPrice;
  Variant? _selectedVariant;

  @override
  void initState() {
    super.initState();
    _basePrice = widget.product.variants.isNotEmpty ? widget.product.variants[0].price : 0.0;
    _currentPrice = _basePrice;
    _initDefaultSelections();
  }

  void _initDefaultSelections() {
    for (var attr in widget.product.availableAttributes) {
      if (attr.values.isNotEmpty) {
        _selectedVariantAttributes[attr.name] = attr.values[0];
      }
    }

    for (var addonGroup in widget.product.addonGroups) {
      for (var addon in addonGroup.addons) {
        _selectedAddons[addon.id] = false;
      }
    }

    _updatePrice();
  }

  void _updatePrice() {
    Variant? matchedVariant;
    for (var variant in widget.product.variants) {
      final variantAttributes = widget.product.variantDetails
          .where((vd) => vd.variantId == variant.id)
          .toList();

      bool isMatch = variantAttributes.every(
            (va) => _selectedVariantAttributes[va.attributeName] == va.attributeValue,
      );

      if (isMatch) {
        matchedVariant = variant;
        break;
      }
    }

    double adjustedPrice = matchedVariant?.price ?? _basePrice;

    for (var addonGroup in widget.product.addonGroups) {
      for (var addon in addonGroup.addons) {
        if (_selectedAddons[addon.id] == true) {
          adjustedPrice += addon.priceAdjust;
        }
      }
    }

    setState(() {
      _selectedVariant = matchedVariant;
      _currentPrice = adjustedPrice * _selectedQuantity;
    });
  }

  bool _allRequiredVariantsSelected() {
    return widget.product.availableAttributes.every(
          (attr) => _selectedVariantAttributes.containsKey(attr.name),
    );
  }

  int _getMaxStock() {
    if (_selectedVariant?.stockQuantity != null) {
      return _selectedVariant!.stockQuantity!;
    }
    return widget.product.variants.fold<int>(
      0,
          (sum, variant) => sum + (variant.stockQuantity ?? 0),
    );
  }

  String _getStockText() {
    final stock = _getMaxStock();
    return 'Còn $stock sản phẩm';
  }

  String _buildSelectedVariantsText() {
    final selectedParts = <String>[];

    _selectedVariantAttributes.forEach((key, value) {
      selectedParts.add('$key: $value');
    });

    for (var addonGroup in widget.product.addonGroups) {
      for (var addon in addonGroup.addons) {
        if (_selectedAddons[addon.id] == true) {
          selectedParts.add(addon.name);
        }
      }
    }

    return selectedParts.isEmpty ? 'Chọn biến thể' : selectedParts.join(', ');
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = widget.primaryColor ?? Theme.of(context).primaryColor;

    return Container(
      padding: EdgeInsets.only(
        top: 16,
        left: 16,
        right: 16,
        bottom: MediaQuery.of(context).padding.bottom + 5,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildProductImage(),
              const SizedBox(width: 12),
              _buildProductInfo(primaryColor),
            ],
          ),
          const Divider(height: 24),
          Flexible(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildVariantSelectors(primaryColor),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
          _buildFooter(primaryColor),
        ],
      ),
    );
  }

  Widget _buildProductImage() {
    return Container(
      width: 100,
      height: 100,
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(4),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(4),
        child: Image.network(
          _selectedVariant?.imageUrl ?? widget.product.thumbnailUrl,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => Container(
            color: Colors.grey.shade200,
            child: const Icon(Icons.image_not_supported_outlined, color: Colors.grey, size: 40),
          ),
        ),
      ),
    );
  }

  Widget _buildProductInfo(Color primaryColor) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CurrencyFormatter.buildRichText(
            _currentPrice,
            valueStyle: TextStyle(fontSize: 20, color: primaryColor, fontWeight: FontWeight.bold),
            symbolStyle: TextStyle(fontSize: 16, color: primaryColor, fontWeight: FontWeight.bold, decoration: TextDecoration.underline),
          ),
          const SizedBox(height: 8),
          Text(_buildSelectedVariantsText(), style: TextStyle(fontSize: 14, color: Colors.grey.shade700)),
          const SizedBox(height: 4),
          Text(_getStockText(), style: TextStyle(fontSize: 14, color: Colors.grey.shade700)),
        ],
      ),
    );
  }

  Widget _buildFooter(Color primaryColor) {
    return Container(
      padding: const EdgeInsets.only(top: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Colors.grey.shade500)),
      ),
      child: Column(
        children: [
          _buildQuantitySelector(primaryColor),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 40,
            child: ElevatedButton(
              onPressed: _allRequiredVariantsSelected()
                  ? () {
                final selections = {
                  'product_id': widget.product.id,
                  'quantity': _selectedQuantity,
                  'price': _currentPrice,
                  'variant_id': _selectedVariant?.id,
                  'variants': _selectedVariantAttributes,
                  'addons': _selectedAddons.entries
                      .where((e) => e.value)
                      .map((e) => widget.product.addonGroups
                      .expand((ag) => ag.addons)
                      .firstWhere((addon) => addon.id == e.key)
                      .name)
                      .toList(),
                };
                widget.onVariantSelected?.call(selections, _selectedQuantity);
                Navigator.of(context).pop();
              }
                  : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: primaryColor,
                disabledBackgroundColor: Colors.grey.shade300,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
              ),
              child: Text(
                widget.isBuyNow ? 'Mua ngay' : 'Thêm vào giỏ hàng',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVariantSelectors(Color primaryColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ...widget.product.availableAttributes.map((attr) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('${attr.name}:', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              _buildVariantButtons(attr.values, attr.name, primaryColor),
              const SizedBox(height: 16),
            ],
          );
        }),
        ...widget.product.addonGroups.map((addonGroup) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('${addonGroup.name}:', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              _buildAddonSelectors(addonGroup.addons, addonGroup.maxChoice, primaryColor),
              const SizedBox(height: 16),
            ],
          );
        }),
      ],
    );
  }

  Widget _buildVariantButtons(List<String> values, String attrName, Color primaryColor) {
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: values.map((value) {
        final isSelected = _selectedVariantAttributes[attrName] == value;
        return GestureDetector(
          onTap: () {
            setState(() {
              _selectedVariantAttributes[attrName] = value;
              _updatePrice();
            });
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: isSelected ? primaryColor.withOpacity(0.1) : Colors.grey.shade100,
              border: Border.all(color: isSelected ? primaryColor : Colors.grey.shade300),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              value,
              style: TextStyle(
                color: isSelected ? primaryColor : Colors.black87,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildAddonSelectors(List<Addon> addons, int maxChoice, Color primaryColor) {
    int selectedCount = _selectedAddons.entries.where((e) => e.value).length;
    return Column(
      children: addons.map((addon) {
        final isSelected = _selectedAddons[addon.id] ?? false;
        final isDisabled = !isSelected && selectedCount >= maxChoice;
        return CheckboxListTile(
          title: Text(addon.name),
          subtitle: addon.priceAdjust > 0 ? Text('+${CurrencyFormatter.format(addon.priceAdjust)}') : null,
          value: isSelected,
          onChanged: isDisabled
              ? null
              : (newValue) {
            setState(() {
              _selectedAddons[addon.id] = newValue ?? false;
              _updatePrice();
            });
          },
          activeColor: primaryColor,
        );
      }).toList(),
    );
  }

  Widget _buildQuantitySelector(Color primaryColor) {
    final maxStock = _getMaxStock();

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Text('Số lượng:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        Row(
          children: [
            GestureDetector(
              onTap: () {
                if (_selectedQuantity > 1) {
                  setState(() {
                    _selectedQuantity--;
                    _updatePrice();
                  });
                }
              },
              child: _buildQuantityButton(Icons.remove, left: true),
            ),
            Container(
              width: 48,
              height: 36,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.symmetric(
                  vertical: BorderSide(color: Colors.grey.shade300),
                ),
              ),
              child: Text(
                _selectedQuantity.toString(),
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
            GestureDetector(
              onTap: () {
                if (_selectedQuantity < maxStock) {
                  setState(() {
                    _selectedQuantity++;
                    _updatePrice();
                  });
                }
              },
              child: _buildQuantityButton(Icons.add, right: true),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildQuantityButton(IconData icon, {bool left = false, bool right = false}) {
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        color: Colors.grey.shade200,
        borderRadius: BorderRadius.horizontal(
          left: left ? const Radius.circular(4) : Radius.zero,
          right: right ? const Radius.circular(4) : Radius.zero,
        ),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Icon(icon, size: 16),
    );
  }
}
