package com.quadra.ecommerce_api.service.discount;


import java.time.LocalDateTime;
import java.util.Map;

public interface DiscountCodeAnalyticsService {

    /**
     * Thống kê tổng quan mã giảm giá theo cửa hàng
     */
    Map<String, Object> getDiscountOverview(Long storeId);

    /**
     * Thống kê sử dụng mã giảm giá theo thời gian
     */
    Map<String, Object> getUsageStats(Long storeId, LocalDateTime startTime, LocalDateTime endTime);

    /**
     * Top mã giảm giá được sử dụng nhiều nhất
     */
    Map<String, Object> getTopUsedDiscountCodes(Long storeId, LocalDateTime startTime,
                                                LocalDateTime endTime, int limit);

    /**
     * Hiệu suất của mã giảm giá cụ thể
     */
    Map<String, Object> getDiscountCodePerformance(Long discountCodeId);
}
