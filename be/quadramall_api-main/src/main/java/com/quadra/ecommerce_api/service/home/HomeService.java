package com.quadra.ecommerce_api.service.home;

import com.fasterxml.jackson.core.type.TypeReference;
import com.quadra.ecommerce_api.dto.base.cms.BannerDTO;
import com.quadra.ecommerce_api.dto.base.store.ItemTypeDTO;
import com.quadra.ecommerce_api.dto.custom.product.response.ProductCardDTO;
import com.quadra.ecommerce_api.dto.custom.store.response.StoreHomeResponseDTO;
import com.quadra.ecommerce_api.entity.cms.Banner;
import com.quadra.ecommerce_api.entity.product.Product;
import com.quadra.ecommerce_api.entity.store.ItemType;
import com.quadra.ecommerce_api.entity.user.Favorite;
import com.quadra.ecommerce_api.enums.redis.RedisCacheKey;
import com.quadra.ecommerce_api.exception.ResourceNotFound;
import com.quadra.ecommerce_api.mapper.base.cms.BannerMapper;
import com.quadra.ecommerce_api.mapper.custom.product.response.ProductCardMapper;
import com.quadra.ecommerce_api.repository.cms.BannerRepo;
import com.quadra.ecommerce_api.repository.order.OrderItemRepo;
import com.quadra.ecommerce_api.repository.order.ProductReviewRepo;
import com.quadra.ecommerce_api.repository.product.ProductRepo;
import com.quadra.ecommerce_api.repository.product.ProductVariantRepo;
import com.quadra.ecommerce_api.repository.store.ItemTypeRepo;
import com.quadra.ecommerce_api.repository.store.StoreRepo;
import com.quadra.ecommerce_api.repository.user.FavoriteRepo;
import com.quadra.ecommerce_api.utils.RedisCacheUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class HomeService {

    private final BannerRepo bannerRepo;
    private final ItemTypeRepo itemTypeRepo;
    private final StoreRepo storeRepo;
    private final ProductRepo productRepo;
    private final ProductVariantRepo productVariantRepo;
    private final FavoriteRepo favoriteRepo;
    private final OrderItemRepo orderItemRepo;
    private final ProductReviewRepo productReviewRepo;
    private final ProductCardMapper productCardMapper;
    private final BannerMapper bannerMapper;
    private final RedisCacheUtil redisCacheUtil;

    @Autowired
    public HomeService(
            BannerRepo bannerRepo,
            ItemTypeRepo itemTypeRepo,
            StoreRepo storeRepo,
            ProductRepo productRepo,
            ProductVariantRepo productVariantRepo,
            FavoriteRepo favoriteRepo,
            OrderItemRepo orderItemRepo,
            ProductReviewRepo productReviewRepo,
            ProductCardMapper productCardMapper,
            BannerMapper bannerMapper,
            RedisCacheUtil redisCacheUtil
    ) {
        this.bannerRepo = bannerRepo;
        this.itemTypeRepo = itemTypeRepo;
        this.storeRepo = storeRepo;
        this.productRepo = productRepo;
        this.productVariantRepo = productVariantRepo;
        this.favoriteRepo = favoriteRepo;
        this.orderItemRepo = orderItemRepo;
        this.productReviewRepo = productReviewRepo;
        this.productCardMapper = productCardMapper;
        this.bannerMapper = bannerMapper;
        this.redisCacheUtil = redisCacheUtil;
    }

    public BannerDTO findIntro() {
        String key = RedisCacheKey.HOME_INTRO.key();
        Duration ttl = RedisCacheKey.HOME_INTRO.ttl();

        BannerDTO cached = redisCacheUtil.get(key, BannerDTO.class);

        if (cached != null) {
            return cached;
        }

        Banner banner = bannerRepo.findByIsIntroTrue()
                .orElseThrow(() -> new ResourceNotFound("Intro not found"));
        BannerDTO bannerDTO = bannerMapper.toDto(banner);

        redisCacheUtil.set(key, bannerDTO, ttl);

        return bannerDTO;
    }

    public List<BannerDTO> findBannersActive() {
        String key = RedisCacheKey.BANNERS_ACTIVE.key();
        Duration ttl = RedisCacheKey.BANNERS_ACTIVE.ttl();

        List<BannerDTO> cached = redisCacheUtil.get(
                key,
                new TypeReference<>() {}
        );

        if (cached != null && !cached.isEmpty()) {
            return cached;
        }

        List<Banner> banners = bannerRepo.findByActiveTrueOrderByDisplayOrderAsc();
        List<BannerDTO> bannerDTOS = banners.stream()
                .map(bannerMapper::toDto)
                .toList();

        redisCacheUtil.set(key, bannerDTOS, ttl);

        return bannerDTOS;
    }

    public List<ItemTypeDTO> findItemTypes() {
        String key = RedisCacheKey.ITEM_TYPES.key();
        Duration ttl = RedisCacheKey.ITEM_TYPES.ttl();

        List<ItemTypeDTO> cached = redisCacheUtil.get(
                key,
                new TypeReference<>() {}
        );

        if (cached != null && !cached.isEmpty()) {
            return cached;
        }

        List<ItemType> rootTypes = itemTypeRepo.findByParentIsNullAndIsActiveTrue();

        List<ItemTypeDTO> dtos = rootTypes.stream()
                .map(this::mapToItemTypeDTO)
                .toList();

        redisCacheUtil.set(key, dtos, ttl);
        return dtos;
    }

    public List<StoreHomeResponseDTO> findStores() {
        String key = RedisCacheKey.TOP_STORES.key();
        Duration ttl = RedisCacheKey.TOP_STORES.ttl();

        List<StoreHomeResponseDTO> cached = redisCacheUtil.get(
                key,
                new TypeReference<>() {}
        );

        if (cached != null && !cached.isEmpty()) {
            return cached;
        }

        List<StoreHomeResponseDTO> stores =
                storeRepo.findTop10StoresByAverageRating(PageRequest.of(0, 10));

        if (stores != null && !stores.isEmpty()) {
            redisCacheUtil.set(key, stores, ttl);
        }

        return stores;
    }

    public List<ProductCardDTO> findAllProducts(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productRepo.findAll(pageable);

        List<Favorite> favorites = favoriteRepo.findByUserId(userId);
        Set<Long> favoriteProductIds = favorites.stream()
                .map(favorite -> favorite.getProduct().getId())
                .collect(Collectors.toSet());

        return productPage.getContent().stream().map(product -> {

            boolean isFav = favoriteProductIds.contains(product.getId());
            Long soldCount = findSoldCount(product.getId());
            double price = findMinPrice(product.getId());
            double rating = findAverageRatingForProduct(product.getId());

            return productCardMapper.toDto(product, price, soldCount, rating, isFav);
        }).collect(Collectors.toList());
    }

    public ProductCardDTO findProductById(Long productId, Long userId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFound("Product not found"));

        Boolean isFav = favoriteRepo.existsByUserIdAndProductId(userId, productId);
        isFav = isFav != null && isFav;

        Long soldCount = findSoldCount(product.getId());
        double price = findMinPrice(productId);
        double rating = findAverageRatingForProduct(product.getId());

        return productCardMapper.toDto(product, price, soldCount, rating, isFav);
    }

    public List<ProductCardDTO> getByIds(List<Long> productIds, Long userId) {

        List<Favorite> favorites = favoriteRepo.findByUserId(userId);
        Set<Long> favoriteProductIds = favorites.stream()
                .map(favorite -> favorite.getProduct().getId())
                .collect(Collectors.toSet());

        List<Product> products = productRepo.findAllById(productIds);
        return products.stream()
                .map(product -> {

                    boolean isFav = favoriteProductIds.contains(product.getId());
                    Long soldCount = findSoldCount(product.getId());
                    double price = findMinPrice(product.getId());
                    double rating = findAverageRatingForProduct(product.getId());

                    return productCardMapper.toDto(product, price, soldCount, rating, isFav);
                }).collect(Collectors.toList());
    }

    public double findMinPrice(Long productId) {
        String key = RedisCacheKey.PRODUCT_MIN_PRICE.key(productId);
        Duration ttl = RedisCacheKey.PRODUCT_MIN_PRICE.ttl();

        Double cached = redisCacheUtil.getDouble(key);
        if (cached != null) return cached;

        double minPrice = productVariantRepo.findMinPriceByProductId(productId)
                .map(BigDecimal::doubleValue)
                .orElse(0.0);

        redisCacheUtil.setDouble(key, minPrice, ttl);
        return minPrice;
    }

    public Long findSoldCount(Long productId) {
        String key = RedisCacheKey.PRODUCT_SOLD_COUNT.key(productId);
        Duration ttl = RedisCacheKey.PRODUCT_SOLD_COUNT.ttl();

        Long cached = redisCacheUtil.getLong(key);
        if (cached != null) return cached;

        Long actual = Optional.ofNullable(orderItemRepo.calculateSoldCount(productId)).orElse(0L);
        redisCacheUtil.setLong(key, actual, ttl);
        return actual;
    }

    public double findAverageRatingForProduct(Long productId) {
        String key = RedisCacheKey.PRODUCT_RATING.key(productId);
        Duration ttl = RedisCacheKey.PRODUCT_RATING.ttl();

        Double cached = redisCacheUtil.getDouble(key);
        if (cached != null) return cached;

        double rating = productReviewRepo.findAverageRatingByProductId(productId).orElse(0.0);
        redisCacheUtil.setDouble(key, rating, ttl);
        return rating;
    }

    private ItemTypeDTO mapToItemTypeDTO(ItemType entity) {
        return ItemTypeDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .slug(entity.getSlug())
                .iconUrl(entity.getIconUrl())
                .build();
    }
}