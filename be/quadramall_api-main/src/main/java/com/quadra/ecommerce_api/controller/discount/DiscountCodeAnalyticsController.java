package com.quadra.ecommerce_api.controller.discount;


import com.quadra.ecommerce_api.common.base.AbstractBuyerController;
import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.service.discount.DiscountCodeAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/discount-codes/analytics")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Discount Code Analytics", description = "APIs thống kê mã giảm giá")
public class DiscountCodeAnalyticsController extends AbstractBuyerController {

    private final DiscountCodeAnalyticsService analyticsService;

    @GetMapping("/store/{storeId}/overview")
    @Operation(summary = "Thống kê tổng quan mã giảm giá theo cửa hàng")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDiscountOverview(
            @PathVariable Long storeId) {

        Map<String, Object> overview = analyticsService.getDiscountOverview(storeId);

        return ok(Map.of("Lấy thống kê tổng quan thành công", overview));
    }

    @GetMapping("/store/{storeId}/usage-stats")
    @Operation(summary = "Thống kê sử dụng mã giảm giá theo thời gian")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUsageStats(
            @PathVariable Long storeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {

        Map<String, Object> usageStats = analyticsService.getUsageStats(storeId, startTime, endTime);

        return ok(Map.of("Lấy thống kê sử dụng thành công", usageStats));
    }

    @GetMapping("/store/{storeId}/top-codes")
    @Operation(summary = "Top mã giảm giá được sử dụng nhiều nhất")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTopUsedDiscountCodes(
            @PathVariable Long storeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @RequestParam(defaultValue = "10") int limit) {

        Map<String, Object> topCodes = analyticsService.getTopUsedDiscountCodes(
                storeId, startTime, endTime, limit);

        return ok(Map.of("Lấy top mã giảm giá thành công", topCodes));
    }

    @GetMapping("/{discountCodeId}/performance")
    @Operation(summary = "Hiệu suất của mã giảm giá cụ thể")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDiscountCodePerformance(
            @PathVariable Long discountCodeId) {

        Map<String, Object> performance = analyticsService.getDiscountCodePerformance(discountCodeId);

        return ok(Map.of("Lấy hiệu suất mã giảm giá thành công", performance));
    }
}