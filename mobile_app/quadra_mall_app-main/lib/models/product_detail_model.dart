class ProductDetail {
  final int id;
  final String name;
  final String slug;
  final String description;
  final String thumbnailUrl;
  final String videoUrl;
  final int storeId;
  final int? categoryId;
  final Store store;
  final List<Attribute> availableAttributes;
  final List<Variant> variants;
  final List<VariantAttribute> variantDetails;
  final List<AddonGroup> addonGroups;
  final List<ProductImage> images;
  final List<Specification> specifications;
  final List<DiscountCode> discountCodes;
  final int soldCount;
  final double averageRating;
  final int reviewCount;
  final List<Review> reviews;

  ProductDetail({
    required this.id,
    required this.name,
    required this.slug,
    required this.description,
    required this.thumbnailUrl,
    required this.videoUrl,
    required this.storeId,
    this.categoryId,
    required this.store,
    required this.availableAttributes,
    required this.variants,
    required this.variantDetails,
    required this.addonGroups,
    required this.images,
    required this.specifications,
    required this.discountCodes,
    required this.soldCount,
    required this.averageRating,
    required this.reviewCount,
    required this.reviews,
  });

  factory ProductDetail.fromJson(Map<String, dynamic> json) {
    return ProductDetail(
      id: json['id'],
      name: json['name'],
      slug: json['slug'],
      description: json['description'],
      thumbnailUrl: json['thumbnailUrl'],
      videoUrl: json['videoUrl'],
      storeId: json['storeId'],
      categoryId: json['categoryId'],
      store: Store.fromJson(json['store']),
      availableAttributes: (json['availableAttributes'] as List)
          .map((e) => Attribute.fromJson(e))
          .toList(),
      variants: (json['variants'] as List)
          .map((e) => Variant.fromJson(e))
          .toList(),
      variantDetails: (json['variantDetails'] as List)
          .map((e) => VariantAttribute.fromJson(e))
          .toList(),
      addonGroups: (json['addonGroups'] as List)
          .map((e) => AddonGroup.fromJson(e))
          .toList(),
      images: (json['images'] as List)
          .map((e) => ProductImage.fromJson(e))
          .toList(),
      specifications: (json['specifications'] as List)
          .map((e) => Specification.fromJson(e))
          .toList(),
      discountCodes: (json['discountCodes'] as List)
          .map((e) => DiscountCode.fromJson(e))
          .toList(),
      soldCount: json['soldCount'],
      averageRating: (json['averageRating'] as num).toDouble(),
      reviewCount: json['reviewCount'],
      reviews: (json['reviews'] as List)
          .map((e) => Review.fromJson(e))
          .toList(),
    );
  }
}

class Store {
  final int id;
  final String name;
  final String slug;
  final String address;
  final String description;
  final String logoUrl;
  final double rating;
  final int productCount;

  Store({
    required this.id,
    required this.name,
    required this.slug,
    required this.address,
    required this.description,
    required this.logoUrl,
    required this.rating,
    required this.productCount,
  });

  factory Store.fromJson(Map<String, dynamic> json) {
    return Store(
      id: json['id'],
      name: json['name'],
      slug: json['slug'],
      address: json['address'],
      description: json['description'],
      logoUrl: json['logoUrl'],
      rating: (json['rating'] as num).toDouble(),
      productCount: json['productCount'],
    );
  }
}

class Attribute {
  final String name;
  final List<String> values;

  Attribute({
    required this.name,
    required this.values,
  });

  factory Attribute.fromJson(Map<String, dynamic> json) {
    return Attribute(
      name: json['name'],
      values: List<String>.from(json['values']),
    );
  }
}

class Variant {
  final int id;
  final String sku;
  final double price;
  final int stockQuantity;
  final String imageUrl;
  final String altText;

  Variant({
    required this.id,
    required this.sku,
    required this.price,
    required this.stockQuantity,
    required this.imageUrl,
    required this.altText,
  });

  factory Variant.fromJson(Map<String, dynamic> json) {
    return Variant(
      id: json['id'],
      sku: json['sku'],
      price: (json['price'] as num).toDouble(),
      stockQuantity: json['stockQuantity'],
      imageUrl: json['imageUrl'],
      altText: json['altText'],
    );
  }
}

class VariantAttribute {
  final int variantId;
  final String attributeName;
  final String attributeValue;

  VariantAttribute({
    required this.variantId,
    required this.attributeName,
    required this.attributeValue,
  });

  factory VariantAttribute.fromJson(Map<String, dynamic> json) {
    return VariantAttribute(
      variantId: json['variantId'],
      attributeName: json['attributeName'],
      attributeValue: json['attributeValue'],
    );
  }
}

class AddonGroup {
  final int id;
  final String name;
  final int maxChoice;
  final List<Addon> addons;

  AddonGroup({
    required this.id,
    required this.name,
    required this.maxChoice,
    required this.addons,
  });

  factory AddonGroup.fromJson(Map<String, dynamic> json) {
    return AddonGroup(
      id: json['id'],
      name: json['name'],
      maxChoice: json['maxChoice'],
      addons: (json['addons'] as List)
          .map((e) => Addon.fromJson(e))
          .toList(),
    );
  }
}

class Addon {
  final int id;
  final String name;
  final double priceAdjust;

  Addon({
    required this.id,
    required this.name,
    required this.priceAdjust,
  });

  factory Addon.fromJson(Map<String, dynamic> json) {
    return Addon(
      id: json['id'],
      name: json['name'],
      priceAdjust: (json['priceAdjust'] as num).toDouble(),
    );
  }
}

class ProductImage {
  final String imageUrl;
  final String altText;
  final bool isThumbnail;

  ProductImage({
    required this.imageUrl,
    required this.altText,
    required this.isThumbnail,
  });

  factory ProductImage.fromJson(Map<String, dynamic> json) {
    return ProductImage(
      imageUrl: json['imageUrl'],
      altText: json['altText'],
      isThumbnail: json['isThumbnail'],
    );
  }
}

class Specification {
  final String name;
  final String value;

  Specification({
    required this.name,
    required this.value,
  });

  factory Specification.fromJson(Map<String, dynamic> json) {
    return Specification(
      name: json['name'],
      value: json['value'],
    );
  }
}

class DiscountCode {
  final int id;
  final String code;
  final String description;
  final String discountType;
  final double discountValue;
  final String startDate;
  final String endDate;

  DiscountCode({
    required this.id,
    required this.code,
    required this.description,
    required this.discountType,
    required this.discountValue,
    required this.startDate,
    required this.endDate,
  });

  factory DiscountCode.fromJson(Map<String, dynamic> json) {
    return DiscountCode(
      id: json['id'],
      code: json['code'],
      description: json['description'],
      discountType: json['discountType'],
      discountValue: (json['discountValue'] as num).toDouble(),
      startDate: json['startDate'],
      endDate: json['endDate'],
    );
  }
}

class Review {
  final int id;
  final int rating;
  final String comment;
  final String createdAt;
  final String userName;
  final String avatarUrl;
  final int likes;

  Review({
    required this.id,
    required this.rating,
    required this.comment,
    required this.createdAt,
    required this.userName,
    required this.avatarUrl,
    required this.likes,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'],
      rating: json['rating'],
      comment: json['comment'],
      createdAt: json['createdAt'],
      userName: json['userName'],
      avatarUrl: json['avatarUrl'],
      likes: json['likes'],
    );
  }
}