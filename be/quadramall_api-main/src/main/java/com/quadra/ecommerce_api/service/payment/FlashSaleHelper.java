package com.quadra.ecommerce_api.service.payment;

import com.quadra.ecommerce_api.entity.discount.FlashSale;
import com.quadra.ecommerce_api.entity.product.Product;
import com.quadra.ecommerce_api.entity.product.ProductVariant;
import com.quadra.ecommerce_api.repository.flashsale.FlashSaleRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class FlashSaleHelper {

    private final FlashSaleRepo flashSaleRepo;

    /**
     * Kiểm tra sản phẩm có Flash Sale đang hoạt động không
     */
    public boolean hasActiveFlashSale(Long productId) {
        Optional<FlashSale> flashSale = flashSaleRepo.findActiveByProduct_Id(productId);
        return flashSale.isPresent() && isFlashSaleValid(flashSale.get());
    }

    /**
     * Lấy thông tin Flash Sale cho sản phẩm
     */
    public Optional<FlashSale> getActiveFlashSale(Long productId) {
        Optional<FlashSale> flashSaleOpt = flashSaleRepo.findActiveByProduct_Id(productId);
        if (flashSaleOpt.isPresent() && isFlashSaleValid(flashSaleOpt.get())) {
            return flashSaleOpt;
        }
        return Optional.empty();
    }

    /**
     * Tính giá Flash Sale cho ProductVariant với số lượng cụ thể
     */
    public BigDecimal calculateFlashSalePrice(ProductVariant variant, int quantity) {
        Product product = variant.getProduct();
        BigDecimal originalPrice = variant.getPrice();

        Optional<FlashSale> flashSaleOpt = getActiveFlashSale(product.getId());

        if (flashSaleOpt.isPresent()) {
            FlashSale flashSale = flashSaleOpt.get();

            // Kiểm tra còn đủ số lượng cho Flash Sale không
            if (canApplyFlashSale(flashSale, quantity)) {
                return calculateDiscountedPrice(originalPrice, Double.valueOf(flashSale.getPercentageDiscount()));
            }
        }

        return originalPrice;
    }

    /**
     * Kiểm tra có thể áp dụng Flash Sale cho số lượng này không
     */
    public boolean canApplyFlashSale(FlashSale flashSale, int requestedQuantity) {
        if (flashSale == null || !isFlashSaleValid(flashSale)) {
            return false;
        }

        int remainingQuantity = flashSale.getQuantity() - flashSale.getSoldCount();
        return remainingQuantity >= requestedQuantity;
    }

    /**
     * Kiểm tra Flash Sale có hợp lệ không
     */
    private boolean isFlashSaleValid(FlashSale flashSale) {
        LocalDateTime now = LocalDateTime.now();
        return
                !now.isBefore(flashSale.getStartTime()) &&
                        !now.isAfter(flashSale.getEndTime()) &&
                        flashSale.getSoldCount() < flashSale.getQuantity();
    }

    /**
     * Tính giá sau khi giảm theo phần trăm
     */
    public BigDecimal calculateDiscountedPrice(BigDecimal originalPrice, Double discountPercentage) {
        if (discountPercentage == null || discountPercentage <= 0) {
            return originalPrice;
        }

        BigDecimal discountMultiplier = BigDecimal.valueOf(100 - discountPercentage)
                .divide(BigDecimal.valueOf(100), 4, BigDecimal.ROUND_HALF_UP);

        return originalPrice.multiply(discountMultiplier)
                .setScale(0, BigDecimal.ROUND_HALF_UP); // Làm tròn đến đồng
    }

    /**
     * Tính số tiền tiết kiệm được từ Flash Sale
     */
    public BigDecimal calculateFlashSaleSavings(BigDecimal originalPrice, BigDecimal flashSalePrice, int quantity) {
        BigDecimal originalTotal = originalPrice.multiply(BigDecimal.valueOf(quantity));
        BigDecimal flashSaleTotal = flashSalePrice.multiply(BigDecimal.valueOf(quantity));
        return originalTotal.subtract(flashSaleTotal);
    }

    /**
     * Lấy Flash Sale cho nhiều sản phẩm cùng lúc
     */
    public Map<Long, FlashSale> getActiveFlashSalesForProducts(List<Long> productIds) {
        List<FlashSale> flashSales = flashSaleRepo.findActiveFlashSalesByProductIds(productIds);

        return flashSales.stream()
                .filter(this::isFlashSaleValid)
                .collect(Collectors.toMap(
                        fs -> fs.getProduct().getId(),
                        fs -> fs
                ));
    }

    /**
     * ✅ FIX: Cập nhật số lượng đã bán cho Flash Sale (khi đặt hàng thành công)
     * Sử dụng native query để tránh validation error
     */
    public void updateFlashSaleSoldCount(Long productId, int quantity) {
        Optional<FlashSale> flashSaleOpt = flashSaleRepo.findActiveByProduct_Id(productId);

        if (flashSaleOpt.isPresent()) {
            FlashSale flashSale = flashSaleOpt.get();

            // Kiểm tra không vượt quá số lượng cho phép
            if (flashSale.getSoldCount() + quantity <= flashSale.getQuantity()) {
                int newSoldCount = flashSale.getSoldCount() + quantity;

                // ✅ SỬ DỤNG NATIVE UPDATE QUERY ĐỂ TRÁNH VALIDATION
                flashSaleRepo.updateSoldCount(flashSale.getId(), newSoldCount);

                log.info("Updated Flash Sale sold count for product {}: {} + {} = {}",
                        productId, flashSale.getSoldCount(), quantity, newSoldCount);
            } else {
                log.warn("Cannot update Flash Sale sold count for product {}: would exceed quantity limit",
                        productId);
            }
        }
    }

    /**
     * ✅ FIX: Hoàn nguyên số lượng đã bán khi hủy đơn hàng
     * Sử dụng native query để tránh validation error
     */
    public void revertFlashSaleSoldCount(Long productId, int quantity) {
        Optional<FlashSale> flashSaleOpt = flashSaleRepo.findActiveByProduct_Id(productId);

        if (flashSaleOpt.isPresent()) {
            FlashSale flashSale = flashSaleOpt.get();

            // Đảm bảo không giảm xuống dưới 0
            int newSoldCount = Math.max(0, flashSale.getSoldCount() - quantity);

            // ✅ SỬ DỤNG NATIVE UPDATE QUERY ĐỂ TRÁNH VALIDATION
            flashSaleRepo.updateSoldCount(flashSale.getId(), newSoldCount);

            log.info("Reverted Flash Sale sold count for product {}: {} - {} = {}",
                    productId, flashSale.getSoldCount(), quantity, newSoldCount);
        }
    }

    /**
     * ✅ ALTERNATIVE: Sử dụng increment method (nếu muốn atomic operation)
     */
    public void incrementFlashSaleSoldCount(Long productId, int quantity) {
        Optional<FlashSale> flashSaleOpt = flashSaleRepo.findActiveByProduct_Id(productId);

        if (flashSaleOpt.isPresent()) {
            FlashSale flashSale = flashSaleOpt.get();

            // Kiểm tra không vượt quá số lượng cho phép
            if (flashSale.getSoldCount() + quantity <= flashSale.getQuantity()) {
                // ✅ ATOMIC INCREMENT
                flashSaleRepo.incrementSoldCount(flashSale.getId(), quantity);

                log.info("Incremented Flash Sale sold count for product {}: +{} items", productId, quantity);
            } else {
                log.warn("Cannot increment Flash Sale sold count for product {}: would exceed quantity limit", productId);
            }
        }
    }

    /**
     * ✅ ALTERNATIVE: Sử dụng decrement method (nếu muốn atomic operation)
     */
    public void decrementFlashSaleSoldCount(Long productId, int quantity) {
        Optional<FlashSale> flashSaleOpt = flashSaleRepo.findActiveByProduct_Id(productId);

        if (flashSaleOpt.isPresent()) {
            FlashSale flashSale = flashSaleOpt.get();

            // ✅ ATOMIC DECREMENT (đã đảm bảo không âm trong query)
            flashSaleRepo.decrementSoldCount(flashSale.getId(), quantity);

            log.info("Decremented Flash Sale sold count for product {}: -{} items", productId, quantity);
        }
    }

    /**
     * Kiểm tra Flash Sale sắp hết hạn (còn lại < 1 giờ)
     */
    public boolean isFlashSaleExpiringSoon(FlashSale flashSale) {
        if (flashSale == null) return false;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourLater = now.plusHours(1);

        return flashSale.getEndTime().isBefore(oneHourLater) &&
                flashSale.getEndTime().isAfter(now);
    }

    /**
     * Kiểm tra Flash Sale sắp hết số lượng (còn < 10%)
     */
    public boolean isFlashSaleRunningLow(FlashSale flashSale) {
        if (flashSale == null) return false;

        double remainingPercentage = (double) (flashSale.getQuantity() - flashSale.getSoldCount())
                / flashSale.getQuantity() * 100;

        return remainingPercentage < 10.0;
    }

    /**
     * Lấy thông báo trạng thái Flash Sale
     */
    public String getFlashSaleStatusMessage(FlashSale flashSale) {
        if (flashSale == null) {
            return "Không có Flash Sale";
        }

        if (!isFlashSaleValid(flashSale)) {
            return "Flash Sale đã kết thúc";
        }

        if (isFlashSaleRunningLow(flashSale)) {
            return "Flash Sale sắp hết! Chỉ còn " + (flashSale.getQuantity() - flashSale.getSoldCount()) + " sản phẩm";
        }

        if (isFlashSaleExpiringSoon(flashSale)) {
            return "Flash Sale sắp kết thúc trong vòng 1 giờ!";
        }

        return "Flash Sale đang diễn ra - Giảm " + flashSale.getPercentageDiscount() + "%";
    }

    // Inner class cho thống kê Flash Sale
    @lombok.Data
    @lombok.Builder
    public static class FlashSaleStatistics {
        private Long flashSaleId;
        private Long productId;
        private Integer totalQuantity;
        private Integer soldCount;
        private Integer remainingQuantity;
        private Double percentageDiscount;
        private Double soldPercentage;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Boolean isActive;
    }
}