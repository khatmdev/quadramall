package com.quadra.ecommerce_api.service.customer.store;

import com.quadra.ecommerce_api.dto.buyer.request.StoreFavoriteRequestDto;
import com.quadra.ecommerce_api.dto.buyer.response.CategoryDto;
import com.quadra.ecommerce_api.dto.buyer.response.DiscountCodeDto;
import com.quadra.ecommerce_api.dto.buyer.response.ProductDto;
import com.quadra.ecommerce_api.dto.buyer.response.ShopDetailDto;
import com.quadra.ecommerce_api.entity.product.Product;
import com.quadra.ecommerce_api.entity.store.Category;
import com.quadra.ecommerce_api.entity.store.Store;
import com.quadra.ecommerce_api.entity.store.StoreFavorite;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.enums.store.StoreStatus;
import com.quadra.ecommerce_api.exception.ResourceNotFound;
import com.quadra.ecommerce_api.repository.conversation.ConversationRepo;
import com.quadra.ecommerce_api.repository.discount.DiscountCodeRepo;
import com.quadra.ecommerce_api.repository.discount.UserSavedDiscountRepo;
import com.quadra.ecommerce_api.repository.order.OrderItemRepo;
import com.quadra.ecommerce_api.repository.order.ProductReviewRepo;
import com.quadra.ecommerce_api.repository.product.ProductRepo;
import com.quadra.ecommerce_api.repository.product.ProductVariantRepo;
import com.quadra.ecommerce_api.repository.store.CategoryRepo;
import com.quadra.ecommerce_api.repository.store.StoreFavoriteRepo;
import com.quadra.ecommerce_api.repository.store.StoreRepo;
import com.quadra.ecommerce_api.repository.user.FavoriteRepo;
import com.quadra.ecommerce_api.repository.user.UserRepo;
import com.quadra.ecommerce_api.utils.RedisCacheUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StoreService {

    private final StoreRepo storeRepo;
    private final CategoryRepo categoryRepo;
    private final ProductRepo productRepo;
    private final DiscountCodeRepo discountCodeRepo;
    private final ProductVariantRepo productVariantRepo;
    private final FavoriteRepo favoriteRepo;
    private final OrderItemRepo orderItemRepo;
    private final ProductReviewRepo productReviewRepo;
    private final RedisCacheUtil redisCacheUtil;
    private final ConversationRepo conversationRepo;
    private final StoreFavoriteRepo storeFavoriteRepo;
    private final UserSavedDiscountRepo userSavedDiscountRepo;
    private final UserRepo userRepo;

    @Autowired
    public StoreService(
            StoreRepo storeRepo,
            CategoryRepo categoryRepo,
            ProductRepo productRepo,
            DiscountCodeRepo discountCodeRepo,
            ProductVariantRepo productVariantRepo,
            FavoriteRepo favoriteRepo,
            OrderItemRepo orderItemRepo,
            ProductReviewRepo productReviewRepo,
            RedisCacheUtil redisCacheUtil,
            ConversationRepo conversationRepo,
            StoreFavoriteRepo storeFavoriteRepo,
            UserSavedDiscountRepo userSavedDiscountRepo,
            UserRepo userRepo) {
        this.storeRepo = storeRepo;
        this.categoryRepo = categoryRepo;
        this.productRepo = productRepo;
        this.discountCodeRepo = discountCodeRepo;
        this.productVariantRepo = productVariantRepo;
        this.favoriteRepo = favoriteRepo;
        this.orderItemRepo = orderItemRepo;
        this.productReviewRepo = productReviewRepo;
        this.redisCacheUtil = redisCacheUtil;
        this.conversationRepo = conversationRepo;
        this.storeFavoriteRepo = storeFavoriteRepo;
        this.userSavedDiscountRepo = userSavedDiscountRepo;
        this.userRepo = userRepo;
    }

    public Store getStoreById(Long id) {
        return storeRepo.findById(id).orElse(null);
    }

    public ShopDetailDto findStoreBySlug(String storeSlug, Long userId) {
        String cacheKey = "STORE_DETAIL_" + storeSlug + "_USER_" + (userId != null ? userId : "ANONYMOUS");
        Duration ttl = Duration.ofHours(1);

        ShopDetailDto cached = redisCacheUtil.get(cacheKey, ShopDetailDto.class);
        if (cached != null) {
            return cached;
        }

        Store store = storeRepo.findBySlugAndStatus(storeSlug, StoreStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFound("Store not found with slug: " + storeSlug));

        ShopDetailDto dto = new ShopDetailDto();
        dto.setStoreId(store.getId());
        dto.setStoreName(store.getName());
        dto.setStoreSlug(store.getSlug());
        dto.setAddress(store.getAddress());
        dto.setDescription(store.getDescription());
        dto.setLogoUrl(store.getLogoUrl());
        dto.setStatus(store.getStatus().name());
        dto.setFavorite(userId != null && storeFavoriteRepo.existsByUserIdAndStoreId(userId, store.getId()));
        dto.setJoinDate(store.getCreatedAt().toLocalDate());


        // Calculate product count
        long productCount = productRepo.countByStoreIdAndIsActiveTrue(store.getId());
        if (productCount > Integer.MAX_VALUE) {
            throw new IllegalStateException("Product count exceeds maximum integer value");
        }
        dto.setProductCount((int) productCount);

        // Calculate follower count
        dto.setFollowerCount((int) storeFavoriteRepo.countDistinctUsersByStoreId(store.getId()));

        // Calculate review count and average rating
        dto.setReviewCount((int) productReviewRepo.countByStoreId(store.getId()));
        dto.setAverageRating(productReviewRepo.findAverageRatingByStoreId(store.getId()).orElse(0.0));

        // Calculate chat response rate
        long totalConversations = conversationRepo.countByStoreId(store.getId());
        long respondedConversations = conversationRepo.countRespondedConversationsByStoreId(store.getId(), store.getOwner().getId());
        double chatResponseRate = totalConversations > 0 ? (double) respondedConversations / totalConversations * 100 : 0.0;
        dto.setChatResponseRate(chatResponseRate);

        // Fetch categories
        List<Category> categoryList = categoryRepo.findByStoreId(store.getId());
        List<CategoryDto> categories = buildCategoryTree(categoryList);
        dto.setCategories(categories);

        // Fetch products
        List<ProductDto> products = productRepo.findByStoreIdAndIsActiveTrue(store.getId())
                .stream()
                .map(product -> {
                    ProductDto productDto = new ProductDto();
                    productDto.setId(product.getId());
                    productDto.setName(product.getName());
                    productDto.setSlug(product.getSlug());
                    productDto.setThumbnailUrl(product.getThumbnailUrl());
                    productDto.setPrice(findMinPrice(product.getId()));
                    productDto.setRating(findAverageRatingForProduct(product.getId()));
                    productDto.setSoldCount(findSoldCount(product.getId()));
                    productDto.setFav(userId != null && favoriteRepo.existsByUserIdAndProductId(userId, product.getId()));
                    return productDto;
                })
                .collect(Collectors.toList());
        dto.setProducts(products);

        // Fetch discount codes
        List<DiscountCodeDto> discountCodes = discountCodeRepo.findByStoreIdAndIsActiveTrue(store.getId())
                .stream()
                .map(discount -> new DiscountCodeDto(
                        discount.getId(),
                        discount.getCode(),
                        discount.getDescription(),
                        discount.getDiscountType().name(),
                        discount.getDiscountValue(),
                        discount.getMinOrderAmount(),
                        discount.getMaxDiscountValue(),
                        discount.getStartDate().toLocalDate(),
                        discount.getEndDate().toLocalDate(),
                        discount.getIsActive(),
                        discount.getQuantity(),
                        discount.getMaxUses(),
                        discount.getUsedCount(),
                        userId != null && userSavedDiscountRepo.existsByUserIdAndDiscountCodeId(userId, discount.getId())
                ))
                .collect(Collectors.toList());
        dto.setDiscountCodes(discountCodes);

        redisCacheUtil.set(cacheKey, dto, ttl);
        return dto;
    }

    // Method to build category tree structure
    private List<CategoryDto> buildCategoryTree(List<Category> categoryList) {
        // Map from entity to DTO
        List<CategoryDto> categoryDtos = categoryList.stream()
                .map(category -> new CategoryDto(
                        category.getId(),
                        category.getName(),
                        category.getSlug(),
                        category.getDescription(),
                        category.getParent() != null ? category.getParent().getId() : null
                ))
                .collect(Collectors.toList());

        Map<Long, CategoryDto> categoryMap = categoryDtos.stream()
                .collect(Collectors.toMap(CategoryDto::getId, dto -> dto));

        // Root categories (parentId = null)
        List<CategoryDto> rootCategories = new ArrayList<>();

        for (CategoryDto dto : categoryDtos) {
            if (dto.getParentId() == null) {
                dto.setChildren(new ArrayList<>());
                rootCategories.add(dto);
            } else {
                CategoryDto parent = categoryMap.get(dto.getParentId());
                if (parent != null) {
                    if (parent.getChildren() == null) {
                        parent.setChildren(new ArrayList<>());
                    }
                    parent.getChildren().add(dto);
                }
            }
        }

        return rootCategories;
    }

    // Reused methods from HomeService
    public double findMinPrice(Long productId) {
        String key = "PRODUCT_MIN_PRICE_" + productId;
        Duration ttl = Duration.ofHours(1);

        Double cached = redisCacheUtil.getDouble(key);
        if (cached != null) return cached;

        double minPrice = productVariantRepo.findMinPriceByProductId(productId)
                .map(BigDecimal::doubleValue)
                .orElse(0.0);

        redisCacheUtil.setDouble(key, minPrice, ttl);
        return minPrice;
    }

    public Long findSoldCount(Long productId) {
        String key = "PRODUCT_SOLD_COUNT_" + productId;
        Duration ttl = Duration.ofHours(1);

        Long cached = redisCacheUtil.getLong(key);
        if (cached != null) return cached;

        Long actual = Optional.ofNullable(orderItemRepo.calculateSoldCount(productId)).orElse(0L);
        redisCacheUtil.setLong(key, actual, ttl);
        return actual;
    }

    public double findAverageRatingForProduct(Long productId) {
        String key = "PRODUCT_RATING_" + productId;
        Duration ttl = Duration.ofHours(1);

        Double cached = redisCacheUtil.getDouble(key);
        if (cached != null) return cached;

        double rating = productReviewRepo.findAverageRatingByProductId(productId).orElse(0.0);
        redisCacheUtil.setDouble(key, rating, ttl);
        return rating;
    }

    public Page<ProductDto> findStoreProducts(String storeSlug, Long categoryId, String sort, Long userId, Pageable pageable) {
        // Kiểm tra cửa hàng tồn tại
        Store store = storeRepo.findBySlugAndStatus(storeSlug, StoreStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFound("Store not found with slug: " + storeSlug));

        System.out.println("categoryId trong sv = " + categoryId);

        // Lấy danh sách ID danh mục con nếu categoryId được cung cấp
        List<Long> categoryIds = categoryId != null ? categoryRepo.findAllDescendantIds(categoryId) : null;
        System.out.println("categoryIds = " + categoryIds);

        // Truy vấn sản phẩm với bộ lọc và phân trang
        Page<Product> productPage = productRepo.findByStoreIdAndFilters(store.getId(), categoryIds, sort, pageable);

        // Chuyển đổi sang ProductDto
        return productPage.map(product -> {
            ProductDto productDto = new ProductDto();
            productDto.setId(product.getId());
            productDto.setName(product.getName());
            productDto.setSlug(product.getSlug());
            productDto.setThumbnailUrl(product.getThumbnailUrl());
            productDto.setPrice(findMinPrice(product.getId()));
            productDto.setRating(findAverageRatingForProduct(product.getId()));
            productDto.setSoldCount(findSoldCount(product.getId()));
            productDto.setFav(userId != null && favoriteRepo.existsByUserIdAndProductId(userId, product.getId()));
            return productDto;
        });
    }



    public void addStoreFavorite(StoreFavoriteRequestDto favoriteDto) {
        // Kiểm tra cửa hàng tồn tại
        Store store = storeRepo.findById(favoriteDto.getStoreId())
                .orElseThrow(() -> new ResourceNotFound("Cửa hàng không tồn tại với ID: " + favoriteDto.getStoreId()));

        // Kiểm tra người dùng tồn tại
        User user = userRepo.findById(favoriteDto.getUserId())
                .orElseThrow(() -> new ResourceNotFound("Người dùng không tồn tại với ID: " + favoriteDto.getUserId()));

        // Kiểm tra xem đã yêu thích chưa
        if (storeFavoriteRepo.existsByUserIdAndStoreId(favoriteDto.getUserId(), favoriteDto.getStoreId())) {
            throw new IllegalStateException("Cửa hàng đã có trong danh sách yêu thích");
        }

        // Thêm vào danh sách yêu thích
        StoreFavorite storeFavorite = new StoreFavorite();
        storeFavorite.setUser(user);
        storeFavorite.setStore(store);
        storeFavorite.setCreatedAt(LocalDateTime.now());
        storeFavoriteRepo.save(storeFavorite);

        // Xóa cache để cập nhật số lượng người theo dõi và trạng thái yêu thích
        String cacheKey = "STORE_DETAIL_" + store.getSlug() + "_USER_" + favoriteDto.getUserId();
        redisCacheUtil.delete(cacheKey);
    }

    public void removeStoreFavorite(Long userId, Long storeId) {
        // Kiểm tra cửa hàng tồn tại
        Store store = storeRepo.findById(storeId)
                .orElseThrow(() -> new ResourceNotFound("Cửa hàng không tồn tại với ID: " + storeId));

        // Kiểm tra người dùng tồn tại
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFound("Người dùng không tồn tại với ID: " + userId));

        // Kiểm tra xem có trong danh sách yêu thích không
        StoreFavorite storeFavorite = storeFavoriteRepo.findByUserIdAndStoreId(userId, storeId)
                .orElseThrow(() -> new ResourceNotFound("Cửa hàng không có trong danh sách yêu thích"));

        // Xóa khỏi danh sách yêu thích
        storeFavoriteRepo.delete(storeFavorite);

        // Xóa cache để cập nhật số lượng người theo dõi và trạng thái yêu thích
        String cacheKey = "STORE_DETAIL_" + store.getSlug() + "_USER_" + userId;
        redisCacheUtil.delete(cacheKey);
    }
}