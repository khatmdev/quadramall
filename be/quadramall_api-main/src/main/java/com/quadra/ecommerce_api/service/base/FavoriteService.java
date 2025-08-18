package com.quadra.ecommerce_api.service.base;

import com.quadra.ecommerce_api.dto.base.product.ProductDTO;
import com.quadra.ecommerce_api.dto.custom.product.response.ProductCardDTO;
import com.quadra.ecommerce_api.entity.product.Product;
import com.quadra.ecommerce_api.entity.user.Favorite;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.enums.redis.RedisCacheKey;
import com.quadra.ecommerce_api.mapper.base.product.ProductMapper;
import com.quadra.ecommerce_api.repository.order.OrderItemRepo;
import com.quadra.ecommerce_api.repository.order.ProductReviewRepo;
import com.quadra.ecommerce_api.repository.product.ProductRepo;
import com.quadra.ecommerce_api.repository.product.ProductVariantRepo;
import com.quadra.ecommerce_api.repository.user.FavoriteRepo;
import com.quadra.ecommerce_api.repository.user.UserRepo;
import com.quadra.ecommerce_api.utils.RedisCacheUtil;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FavoriteService {
    private final FavoriteRepo favoriteRepo;
    private final UserRepo userRepo;
    private final ProductRepo productRepo;
    private final ProductVariantRepo productVariantRepo;
    private final ProductMapper productMapper;
    private final OrderItemRepo orderItemRepo;
    private final ProductReviewRepo productReviewRepo;
    private final RedisCacheUtil redisCacheUtil;

    @Autowired
    public FavoriteService(FavoriteRepo favoriteRepo,
                           UserRepo userRepo,
                           ProductRepo productRepo,
                           ProductVariantRepo productVariantRepo,
                           ProductMapper productMapper,
                           OrderItemRepo orderItemRepo,
                           ProductReviewRepo productReviewRepo,
                           RedisCacheUtil redisCacheUtil) {
        this.favoriteRepo = favoriteRepo;
        this.userRepo = userRepo;
        this.productRepo = productRepo;
        this.productVariantRepo = productVariantRepo;
        this.productMapper = productMapper;
        this.orderItemRepo = orderItemRepo;
        this.productReviewRepo = productReviewRepo;
        this.redisCacheUtil = redisCacheUtil;
    }

    public void addFavorite(Long userId, Long productId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng #" + userId));
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm #" +  productId));

        Boolean exists = favoriteRepo.existsByUserIdAndProductId(userId, productId);
        if (exists) {
            throw new IllegalStateException("Sản phẩm đã được yêu thích");
        }

        Favorite favorite = Favorite.builder()
                .user(user)
                .product(product)
                .build();
        favoriteRepo.save(favorite);
    }

    public void removeFavorite(Long userId, Long productId) {
        Favorite favorite = favoriteRepo.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm yêu thích"));
        favoriteRepo.delete(favorite);
    }

    public List<ProductDTO> findFavoriteProducts(Long userId) {
        List<Favorite> favorites = favoriteRepo.findByUserId(userId);
        return favorites.stream()
                .map(Favorite::getProduct)
                .map(productMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<ProductCardDTO> findFavoriteProductCards(Long userId) {
        List<Favorite> favorites = favoriteRepo.findByUserId(userId);
        return favorites.stream()
                .map(Favorite::getProduct)
                .map(product -> {
                    ProductCardDTO cardDTO = new ProductCardDTO();
                    cardDTO.setId(product.getId());
                    cardDTO.setName(product.getName());
                    cardDTO.setSlug(product.getSlug());
                    cardDTO.setThumbnailUrl(product.getThumbnailUrl());
                    
                    // Lấy giá minimum từ product variants
                    BigDecimal minPrice = productVariantRepo.findMinPriceByProductId(product.getId())
                            .orElse(BigDecimal.ZERO);
                    cardDTO.setPrice(minPrice.doubleValue());
                    
                    // Tạm thời set rating và soldCount = 0, có thể cần thêm query để tính toán
                    cardDTO.setRating(findAverageRatingForProduct(product.getId()));
                    cardDTO.setSoldCount(findSoldCount(product.getId()));
                    cardDTO.setFav(true); // Đây là sản phẩm yêu thích nên luôn true
                    
                    // TODO: Set seller info if needed - cần thêm SellerInfoDTO mapping
                    cardDTO.setSeller(null);
                    
                    return cardDTO;
                })
                .collect(Collectors.toList());
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
}

