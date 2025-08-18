package com.quadra.ecommerce_api.service.customer.product;

import com.quadra.ecommerce_api.dto.custom.product.response.ProductCardDTO;
import com.quadra.ecommerce_api.dto.custom.productDetail.*;
import com.quadra.ecommerce_api.entity.discount.DiscountCode;
import com.quadra.ecommerce_api.entity.discount.FlashSale;
import com.quadra.ecommerce_api.entity.order.ProductReview;
import com.quadra.ecommerce_api.entity.product.*;
import com.quadra.ecommerce_api.entity.store.Store;
import com.quadra.ecommerce_api.repository.discount.DiscountCodeRepository;
import com.quadra.ecommerce_api.mapper.custom.product.response.ProductCardMapper;
import com.quadra.ecommerce_api.repository.flashsale.FlashSaleRepo;
import com.quadra.ecommerce_api.repository.order.OrderItemRepo;
import com.quadra.ecommerce_api.repository.order.ProductReviewRepo;
import com.quadra.ecommerce_api.repository.product.*;
import com.quadra.ecommerce_api.repository.store.StoreFavoriteRepo;
import com.quadra.ecommerce_api.repository.user.FavoriteRepo;
import com.quadra.ecommerce_api.service.store_owner.response.store.ItemTypeService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductService {

    protected final ProductRepo productRepo;
    protected final AttributeRepo attributeRepo;
    protected final ProductVariantRepo productVariantRepo;
    protected final ProductDetailRepo productDetailRepo;
    protected final AddonGroupRepo addonGroupRepo;
    protected final AddonRepo addonRepo;
    protected final ProductImageRepo productImageRepo;
    protected final SpecificationValueRepo specificationValueRepo;
    protected final DiscountCodeRepository discountCodeRepo;
    protected final ProductReviewRepo productReviewRepo;
    protected final ProductCardMapper productCardMapper;
    private final FavoriteRepo favoriteRepo;
    private final ItemTypeService itemTypeService;
    protected final FlashSaleRepo flashSaleRepo;
    private final StoreFavoriteRepo storeFavoriteRepo;
    private final OrderItemRepo orderItemRepo;

    public ProductService(ProductRepo productRepo,
                          AttributeRepo attributeRepo,
                          ProductVariantRepo productVariantRepo,
                          ProductDetailRepo productDetailRepo,
                          AddonGroupRepo addonGroupRepo,
                          AddonRepo addonRepo,
                          ProductImageRepo productImageRepo,
                          SpecificationValueRepo specificationValueRepo,
                          DiscountCodeRepository discountCodeRepo,
                          ProductReviewRepo productReviewRepo,
                          ProductCardMapper productCardMapper,
                          FavoriteRepo favoriteRepo,
                          ItemTypeService itemTypeService,
                          FlashSaleRepo flashSaleRepo,
                          StoreFavoriteRepo storeFavoriteRepo,
                          OrderItemRepo orderItemRepo) {
        this.productRepo = productRepo;
        this.attributeRepo = attributeRepo;
        this.productVariantRepo = productVariantRepo;
        this.productDetailRepo = productDetailRepo;
        this.addonGroupRepo = addonGroupRepo;
        this.addonRepo = addonRepo;
        this.productImageRepo = productImageRepo;
        this.specificationValueRepo = specificationValueRepo;
        this.discountCodeRepo = discountCodeRepo;
        this.productReviewRepo = productReviewRepo;
        this.productCardMapper = productCardMapper;
        this.favoriteRepo = favoriteRepo;
        this.itemTypeService = itemTypeService;
        this.flashSaleRepo = flashSaleRepo;
        this.storeFavoriteRepo = storeFavoriteRepo;
        this.orderItemRepo = orderItemRepo;
    }

    @Transactional(readOnly = true)
    public ProductDetailDTO getProductDetailBySlug(String slug, Long userId) {
        Product product = productRepo.findBySlugAndIsActiveTrue(slug)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with slug: " + slug));

        ProductDetailDTO dto = new ProductDetailDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setSlug(product.getSlug());
        dto.setDescription(product.getDescription());
        dto.setThumbnailUrl(product.getThumbnailUrl());
        dto.setVideoUrl(product.getVideoUrl());
        dto.setStoreId(product.getStore().getId());

        // Store with rating, productCount, and reviewCount
        Store store = product.getStore();
        StoreDTO storeDTO = new StoreDTO();
        storeDTO.setId(store.getId());
        storeDTO.setName(store.getName());
        storeDTO.setSlug(store.getSlug());
        storeDTO.setAddress(store.getAddress());
        storeDTO.setDescription(store.getDescription());
        storeDTO.setLogoUrl(store.getLogoUrl());
        storeDTO.setRating(calculateStoreRating(store.getId()));
        storeDTO.setProductCount(calculateProductCount(store.getId()));
        storeDTO.setReviewCount(calculateStoreReviewCount(store.getId()));
        storeDTO.setFavorite(userId != null && storeFavoriteRepo.existsByUserIdAndStoreId(userId, store.getId()));
        dto.setStore(storeDTO);

        // Attributes
        List<Attribute> attributes = attributeRepo.findByProductIdThroughDetails(product.getId());
        List<AttributeDTO> attributeDTOs = attributes.stream().map(attr -> {
            AttributeDTO attrDTO = new AttributeDTO();
            attrDTO.setName(attr.getName());
            List<AttributeValue> values = productDetailRepo.findByProductId(product.getId()).stream()
                    .map(ProductDetail::getAttributeValue)
                    .filter(av -> av.getAttribute().getId().equals(attr.getId()))
                    .distinct()
                    .collect(Collectors.toList());
            attrDTO.setValues(values.stream().map(AttributeValue::getValue).collect(Collectors.toList()));
            return attrDTO;
        }).collect(Collectors.toList());
        dto.setAvailableAttributes(attributeDTOs);

        // Tìm flash sale active cho product
        Optional<FlashSale> optionalFlashSale = flashSaleRepo.findActiveByProduct_Id(product.getId());
        FlashSale flashSale = optionalFlashSale.orElse(null);
        boolean hasFlashSale = optionalFlashSale.isPresent();

        // Set flashSaleEndTime
        dto.setFlashSaleEndTime(hasFlashSale ? flashSale.getEndTime() : null);

        // Variants (áp dụng discount nếu có flash sale, giữ giá gốc)
        List<ProductVariant> variants = productVariantRepo.findByProductIdAndIsActiveTrue(product.getId());
        List<VariantDTO> variantDTOs = variants.stream().map(v -> {
            VariantDTO vDTO = new VariantDTO();
            vDTO.setId(v.getId());
            vDTO.setSku(v.getSku());
            BigDecimal originalPrice = v.getPrice();
            vDTO.setPrice(originalPrice); // Giữ giá gốc

            // Áp dụng discount nếu có flash sale
            if (hasFlashSale) {
                BigDecimal discountPercentage = BigDecimal.valueOf(flashSale.getPercentageDiscount())
                        .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
                BigDecimal discountedPrice = originalPrice.multiply(BigDecimal.ONE.subtract(discountPercentage))
                        .setScale(2, RoundingMode.HALF_UP);
                vDTO.setDiscountedPrice(discountedPrice);
            } else {
                vDTO.setDiscountedPrice(null);
            }

            vDTO.setStockQuantity(v.getStockQuantity());
            vDTO.setImageUrl(v.getImageUrl());
            vDTO.setAltText(v.getAltText());
            return vDTO;
        }).collect(Collectors.toList());
        dto.setVariants(variantDTOs);

        Integer totalStockQuantity = variantDTOs.stream()
                .mapToInt(v -> v.getStockQuantity() != null ? v.getStockQuantity() : 0)
                .sum();
        dto.setTotalStockQuantity(totalStockQuantity);

        // Tính minPrice và maxPrice (dựa trên giá sau discount nếu có)
        if (!variantDTOs.isEmpty()) {
            List<BigDecimal> prices = variantDTOs.stream()
                    .map(v -> v.getDiscountedPrice() != null ? v.getDiscountedPrice() : v.getPrice())
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            BigDecimal minPrice = prices.isEmpty() ? null : prices.stream()
                    .min(BigDecimal::compareTo)
                    .orElse(null);
            BigDecimal maxPrice = prices.isEmpty() ? null : prices.stream()
                    .max(BigDecimal::compareTo)
                    .orElse(null);
            dto.setMinPrice(minPrice);
            dto.setMaxPrice(maxPrice);
            // Kiểm tra nếu tất cả giá giống nhau
            boolean isSamePrice = prices.isEmpty() || prices.stream().allMatch(price -> price.compareTo(prices.get(0)) == 0);
            dto.setSamePrice(isSamePrice);
        } else {
            dto.setMinPrice(null);
            dto.setMaxPrice(null);
            dto.setSamePrice(true);
        }

        // Variant Attributes
        List<ProductDetail> productDetails = productDetailRepo.findByProductId(product.getId());
        List<VariantAttributeDTO> variantAttributeDTOs = productDetails.stream().map(pd -> {
            VariantAttributeDTO vaDTO = new VariantAttributeDTO();
            vaDTO.setVariantId(pd.getVariant().getId());
            vaDTO.setAttributeName(pd.getAttributeValue().getAttribute().getName());
            vaDTO.setAttributeValue(pd.getAttributeValue().getValue());
            return vaDTO;
        }).collect(Collectors.toList());
        dto.setVariantDetails(variantAttributeDTOs);

        // Addon Groups
        List<AddonGroup> addonGroups = addonGroupRepo.findByProductId(product.getId());
        List<AddonGroupDTO> addonGroupDTOs = addonGroups.stream().map(ag -> {
            AddonGroupDTO agDTO = new AddonGroupDTO();
            agDTO.setId(ag.getId());
            agDTO.setName(ag.getName());
            agDTO.setMaxChoice(ag.getMaxChoice());
            List<AddonDTO> addonDTOs = addonRepo.findByAddonGroupIdAndIsActiveTrue(ag.getId()).stream()
                    .map(a -> {
                        AddonDTO aDTO = new AddonDTO();
                        aDTO.setId(a.getId());
                        aDTO.setName(a.getName());
                        aDTO.setPriceAdjust(a.getPriceAdjust());
                        return aDTO;
                    }).collect(Collectors.toList());
            agDTO.setAddons(addonDTOs);
            return agDTO;
        }).collect(Collectors.toList());
        dto.setAddonGroups(addonGroupDTOs);

        // Images
        List<ProductImage> images = productImageRepo.findByProductId(product.getId());
        List<ProductImageDTO> imageDTOs = images.stream().map(img -> {
            ProductImageDTO imgDTO = new ProductImageDTO();
            imgDTO.setImageUrl(img.getImageUrl());
            imgDTO.setAltText(img.getAltText());
            imgDTO.setIsThumbnail(img.isThumbnail());
            return imgDTO;
        }).collect(Collectors.toList());
        dto.setImages(imageDTOs);

        // Specifications
        List<SpecificationValue> specifications = specificationValueRepo.findByProductId(product.getId());
        List<SpecificationDTO> specificationDTOs = specifications.stream().map(sv -> {
            SpecificationDTO sDTO = new SpecificationDTO();
            sDTO.setName(sv.getSpecification().getName());
            sDTO.setValue(sv.getValue());
            return sDTO;
        }).collect(Collectors.toList());
        dto.setSpecifications(specificationDTOs);

        // Discount Codes
        List<DiscountCode> discountCodes = discountCodeRepo.findActiveDiscountCodesByStore(product.getStore().getId());
        List<DiscountCodeDTO> discountCodeDTOs = discountCodes.stream().map(dc -> {
            DiscountCodeDTO dcDTO = new DiscountCodeDTO();
            dcDTO.setId(dc.getId());
            dcDTO.setCode(dc.getCode());
            dcDTO.setDescription(dc.getDescription());
            dcDTO.setDiscountType(dc.getDiscountType().name());
            dcDTO.setDiscountValue(dc.getDiscountValue());
            dcDTO.setStartDate(dc.getStartDate().toString());
            dcDTO.setEndDate(dc.getEndDate().toString());
            return dcDTO;
        }).collect(Collectors.toList());
        dto.setDiscountCodes(discountCodeDTOs);

        dto.setSoldCount(calculateSoldCount(product.getId()));
        dto.setAverageRating(calculateAverageRating(product.getId()));

        // Load reviews with user info
        List<ProductReview> productReviews = productReviewRepo.findByProductIdWithUser(product.getId());
        List<ReviewDTO> reviewDTOs = productReviews.stream().map(pr -> {
            ReviewDTO reviewDTO = new ReviewDTO();
            reviewDTO.setId(pr.getId());
            reviewDTO.setRating(pr.getRating());
            reviewDTO.setComment(pr.getComment());
            reviewDTO.setCreatedAt(pr.getCreatedAt());
            reviewDTO.setUserName(pr.getOrderItem().getOrder().getCustomer().getFullName());
            reviewDTO.setAvatarUrl(pr.getOrderItem().getOrder().getCustomer().getAvatarUrl());
            reviewDTO.setLikes(0L);
            return reviewDTO;
        }).collect(Collectors.toList());
        dto.setReviews(reviewDTOs);

        // Flash Sale DTO (nếu có)
        if (hasFlashSale && flashSale != null) {
            FlashSaleDTO fsDTO = new FlashSaleDTO();
            fsDTO.setPercentageDiscount(flashSale.getPercentageDiscount());
            fsDTO.setRemainingQuantity(flashSale.getQuantity() - flashSale.getSoldCount());
            fsDTO.setStartTime(flashSale.getStartTime());
            fsDTO.setEndTime(flashSale.getEndTime());
            dto.setFlashSale(fsDTO);
        } else {
            dto.setFlashSale(null);
        }

        return dto;
    }

    private Long calculateSoldCount(Long productId) {
        return Optional.ofNullable(orderItemRepo.calculateSoldCount(productId)).orElse(0L);
    }

    private Double calculateAverageRating(Long productId) {
        return productReviewRepo.findAverageRatingByProductId(productId).orElse(0.0);
    }

    private Integer calculateStoreReviewCount(Long storeId) {
        long reviewCount = productReviewRepo.countByStoreId(storeId);
        if (reviewCount > Integer.MAX_VALUE) {
            throw new IllegalStateException("Review count exceeds maximum integer value");
        }
        return (int) reviewCount;
    }

    private Double calculateStoreRating(Long storeId) {
        return productReviewRepo.findAverageRatingByStoreId(storeId).orElse(0.0);
    }

    private Integer calculateProductCount(Long storeId) {
        long productCount = productRepo.countByStoreIdAndIsActiveTrue(storeId);
        if (productCount > Integer.MAX_VALUE) {
            throw new IllegalStateException("Product count exceeds maximum integer value");
        }
        return (int) productCount;
    }

    @Transactional
    public void updateProductVariant(ProductVariant productVariant) {
        productVariantRepo.save(productVariant);
    }

    public Page<ProductCardDTO> searchProducts(
            Long userId,
            Long itemTypeId,
            String keyword,
            String sortBy,
            String province,
            BigDecimal priceMin,
            BigDecimal priceMax,
            int page,
            int size) {

        // 1. Tạo Sort dựa trên sortBy
        Sort sort = Sort.unsorted();
        if (sortBy != null) {
            switch (sortBy) {
                case "priceAsc" -> sort = Sort.by("minPrice").ascending();
                case "priceDesc" -> sort = Sort.by("minPrice").descending();
                case "sold" -> sort = Sort.by("soldCount").descending();
                case "rating" -> sort = Sort.by("rating").descending();
                default -> sort = Sort.by("p.createdAt").descending();
            }
        }

        // 2. Tạo Pageable
        Pageable pageable = PageRequest.of(page - 1, size, sort);

        // 3. Lấy danh sách itemTypeIds
        List<Long> itemTypeIds = (itemTypeId != null)
                ? itemTypeService.getAllChildItemTypeIds(itemTypeId)
                : null;

        // 4. Truy vấn Product
        Page<Object[]> productPage = productRepo.searchProducts(
                itemTypeIds, keyword, province, priceMin, priceMax, pageable
        );

        // 5. Lấy danh sách favorite
        Set<Long> favoriteProductIds = favoriteRepo.findByUserId(userId).stream()
                .map(fav -> fav.getProduct().getId())
                .collect(Collectors.toSet());

        // 6. Map Object[] → ProductCardDTO
        List<ProductCardDTO> dtos = productPage.getContent().stream()
                .map(obj -> {
                    Product product = (Product) obj[0];
                    BigDecimal minPrice = (BigDecimal) obj[1];
                    Long soldCount = (Long) obj[2];
                    Double rating = (Double) obj[3];
                    boolean isFav = favoriteProductIds.contains(product.getId());
                    return productCardMapper.toDto(
                            product,
                            minPrice != null ? minPrice.doubleValue() : 0.0,
                            soldCount != null ? soldCount : 0L,
                            rating != null ? rating : 0.0,
                            isFav
                    );
                })
                .toList();

        // 7. Trả về PageImpl
        return new PageImpl<>(dtos, pageable, productPage.getTotalElements());
    }

    public ProductVariant getProductVariantById(Long id) {
        return productVariantRepo.findById(id).orElse(null);
    }
}