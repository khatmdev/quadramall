package com.quadra.ecommerce_api.service.discount;


import com.quadra.ecommerce_api.repository.discount.DiscountCodeRepository;
import com.quadra.ecommerce_api.repository.discount.UserDiscountRepository;
import com.quadra.ecommerce_api.repository.discount.DiscountUsageHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DiscountCodeAnalyticsServiceImpl implements DiscountCodeAnalyticsService {

    private final DiscountCodeRepository discountCodeRepository;
    private final UserDiscountRepository userDiscountRepository;
    private final DiscountUsageHistoryRepository discountUsageHistoryRepository;

    @Override
    public Map<String, Object> getDiscountOverview(Long storeId) {
        log.info("Getting discount overview for store: {}", storeId);

        Map<String, Object> overview = new HashMap<>();

        // Tổng số mã giảm giá active
        Long activeCount = discountCodeRepository.countActiveDiscountCodesByStore(storeId);
        overview.put("totalActiveCodes", activeCount);

        // Tổng số mã giảm giá hết hạn
        Long expiredCount = discountCodeRepository.countExpiredDiscountCodesByStore(storeId, LocalDateTime.now());
        overview.put("totalExpiredCodes", expiredCount);

        // Thống kê theo loại giảm giá
        List<Object[]> stats = discountCodeRepository.getDiscountStatsByStore(storeId);
        Map<String, Object> typeStats = new HashMap<>();

        for (Object[] stat : stats) {
            String type = (String) stat[0];
            Long totalCount = (Long) stat[1];
            Long totalUsed = (Long) stat[2];
            Long activeTypeCount = (Long) stat[3];

            Map<String, Object> typeStat = new HashMap<>();
            typeStat.put("totalCount", totalCount);
            typeStat.put("totalUsed", totalUsed);
            typeStat.put("activeCount", activeTypeCount);
            typeStat.put("usageRate", totalCount > 0 ? (double) totalUsed / totalCount : 0.0);

            typeStats.put(type, typeStat);
        }
        overview.put("typeStatistics", typeStats);

        return overview;
    }

    @Override
    public Map<String, Object> getUsageStats(Long storeId, LocalDateTime startTime, LocalDateTime endTime) {
        log.info("Getting usage stats for store: {} from {} to {}", storeId, startTime, endTime);

        Map<String, Object> usageStats = new HashMap<>();

        // Tổng tiền đã giảm
        BigDecimal totalDiscountAmount = discountUsageHistoryRepository
                .getTotalDiscountAmountByStore(storeId, startTime, endTime);
        usageStats.put("totalDiscountAmount", totalDiscountAmount != null ? totalDiscountAmount : BigDecimal.ZERO);

        // Thống kê sử dụng theo ngày
        List<Object[]> dailyUsage = userDiscountRepository.getUsageStatsByStore(storeId, startTime, endTime);
        usageStats.put("dailyUsageStats", dailyUsage);

        return usageStats;
    }

    @Override
    public Map<String, Object> getTopUsedDiscountCodes(Long storeId, LocalDateTime startTime,
                                                       LocalDateTime endTime, int limit) {
        log.info("Getting top {} used discount codes for store: {}", limit, storeId);

        List<Object[]> topCodes = discountUsageHistoryRepository
                .getTopUsedDiscountCodes(storeId, startTime, endTime, PageRequest.of(0, limit));

        Map<String, Object> result = new HashMap<>();
        result.put("topUsedCodes", topCodes);
        result.put("limit", limit);
        result.put("period", Map.of("startTime", startTime, "endTime", endTime));

        return result;
    }

    @Override
    public Map<String, Object> getDiscountCodePerformance(Long discountCodeId) {
        log.info("Getting performance for discount code: {}", discountCodeId);

        Map<String, Object> performance = new HashMap<>();

        // Tổng tiền đã giảm
        BigDecimal totalDiscountAmount = discountUsageHistoryRepository
                .getTotalDiscountAmountByCode(discountCodeId);
        performance.put("totalDiscountAmount", totalDiscountAmount != null ? totalDiscountAmount : BigDecimal.ZERO);

        // Lấy thông tin cơ bản của discount code
        // Có thể thêm các thống kê khác như usage rate, conversion rate, v.v.

        return performance;
    }
}