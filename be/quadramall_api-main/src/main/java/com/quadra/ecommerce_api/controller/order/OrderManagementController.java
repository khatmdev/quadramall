package com.quadra.ecommerce_api.controller.order;

import com.quadra.ecommerce_api.common.base.AbstractSellerController;
import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.common.response.ApiResponseUtils;
import com.quadra.ecommerce_api.dto.custom.orderManagerment.request.OrderFilterRequest;
import com.quadra.ecommerce_api.dto.custom.orderManagerment.request.UpdateOrderStatusRequest;
import com.quadra.ecommerce_api.dto.custom.orderManagerment.response.*;
import com.quadra.ecommerce_api.entity.store.Store;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.enums.order.OrderStatus;
import com.quadra.ecommerce_api.service.customer.store.StoreService;
import com.quadra.ecommerce_api.service.orderManagement.OrderManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@Tag(name = "Seller.OrderManagement", description = "Quản lý đơn hàng cho seller")
@RestController
@RequestMapping("/seller/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderManagementController extends AbstractSellerController {

    private final OrderManagementService orderManagementService;
    private final StoreService storeService;

    @Operation(
            summary = "Lấy thống kê đơn hàng",
            description = "Lấy tổng quan thống kê đơn hàng theo store hoặc tất cả stores của seller"
    )
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<OrderStatsResponse>> getOrderStats(
            @AuthenticationPrincipal User user,
            @Parameter(description = "ID cửa hàng (tùy chọn - nếu không có sẽ lấy tất cả)")
            @RequestParam(required = false) Long storeId) {

        log.info("Getting order stats for user: {} and store: {}", user.getId(), storeId);

        OrderStatsResponse stats = orderManagementService.getOrderStats(user.getId(), storeId);
        return ok(stats, "Lấy thống kê đơn hàng thành công");
    }

    @GetMapping("/stores")
    public ResponseEntity<ApiResponse<StoreInfoResponse>> getSellerStores(@RequestParam(required = false) Long storeId) {
        log.info("Getting order list for user: {}", storeId);
        Store store = storeService.getStoreById(storeId);
        return ok(new StoreInfoResponse(store.getId(),store.getName(),store.getLogoUrl()));
    }

    @Operation(
            summary = "Lấy danh sách đơn hàng",
            description = "Lấy danh sách đơn hàng với phân trang và bộ lọc"
    )
    @GetMapping
    public ResponseEntity<ApiResponse<OrderListResponse>> getOrders(
            @AuthenticationPrincipal User user,
            @Parameter(description = "ID cửa hàng (tùy chọn)")
            @RequestParam(required = false) Long storeId,
            @Parameter(description = "Số trang (bắt đầu từ 0)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số lượng item mỗi trang")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Trường để sắp xếp")
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Hướng sắp xếp (ASC/DESC)")
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @Parameter(description = "Lọc theo trạng thái đơn hàng")
            @RequestParam(required = false) OrderStatus status,
            @Parameter(description = "Ngày bắt đầu (yyyy-MM-dd)")
            @RequestParam(required = false) String startDate,
            @Parameter(description = "Ngày kết thúc (yyyy-MM-dd)")
            @RequestParam(required = false) String endDate,
            @Parameter(description = "Tìm kiếm theo tên khách hàng")
            @RequestParam(required = false) String customerName,
            @Parameter(description = "Tìm kiếm theo mã đơn hàng")
            @RequestParam(required = false) String orderId) {

        log.info("Getting orders for user: {}, store: {}, page: {}, size: {}",
                user.getId(), storeId, page, size);

        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        OrderFilterRequest filterRequest = OrderFilterRequest.builder()
                .status(status)
                .startDate(startDate)
                .endDate(endDate)
                .customerName(customerName)
                .orderId(orderId)
                .build();

        OrderListResponse response = orderManagementService.getOrders(user.getId(), storeId, pageable, filterRequest);
        return ok(response, "Lấy danh sách đơn hàng thành công");
    }

    @Operation(
            summary = "Lấy chi tiết đơn hàng",
            description = "Lấy thông tin chi tiết của một đơn hàng cụ thể"
    )
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> getOrderDetail(
            @AuthenticationPrincipal User user,
            @Parameter(description = "ID đơn hàng", required = true)
            @PathVariable Long orderId) {

        log.info("Getting order detail for user: {} and order: {}", user.getId(), orderId);

        OrderDetailResponse response = orderManagementService.getOrderDetail(user.getId(), orderId);
        return ok(response, "Lấy chi tiết đơn hàng thành công");
    }

    @Operation(
            summary = "Cập nhật trạng thái đơn hàng",
            description = "Cập nhật trạng thái của một đơn hàng cụ thể"
    )
    @PutMapping("/{orderId}/status")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> updateOrderStatus(
            @AuthenticationPrincipal User user,
            @Parameter(description = "ID đơn hàng", required = true)
            @PathVariable Long orderId,
            @Parameter(description = "Trạng thái mới", required = true)
            @RequestBody @Valid UpdateOrderStatusRequest request) {

        log.info("Updating order {} status to {} by user {}", orderId, request.getStatus(), user.getId());

        orderManagementService.updateOrderStatus(user.getId(), orderId, request.getStatus(), request.getNote());
        return ok(null, "Cập nhật trạng thái đơn hàng thành công");
    }

    @Operation(
            summary = "Cập nhật trạng thái nhiều đơn hàng",
            description = "Cập nhật trạng thái của nhiều đơn hàng cùng lúc (batch operation)"
    )
    @PutMapping("/batch/status")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> updateMultipleOrderStatus(
            @AuthenticationPrincipal User user,
            @Parameter(description = "Danh sách ID đơn hàng và trạng thái mới", required = true)
            @RequestBody @Valid UpdateOrderStatusRequest request) {

        log.info("Updating {} orders status to {} by user {}",
                request.getOrderIds().size(), request.getStatus(), user.getId());

        orderManagementService.updateMultipleOrderStatus(user.getId(), request.getOrderIds(), request.getStatus(), request.getNote());
        return updated("Cập nhật trạng thái nhiều đơn hàng thành công");
    }

    @Operation(
            summary = "Xác nhận đơn hàng",
            description = "Xác nhận đơn hàng và chuyển sang trạng thái chuẩn bị hàng"
    )
    @PostMapping("/{orderId}/confirm")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> confirmOrder(
            @AuthenticationPrincipal User user,
            @Parameter(description = "ID đơn hàng", required = true)
            @PathVariable Long orderId,
            @Parameter(description = "Ghi chú xác nhận")
            @RequestParam(required = false) String note) {

        log.info("Confirming order {} by user {}", orderId, user.getId());

        orderManagementService.confirmOrder(user.getId(), orderId, note);
        return  created (null, "Xác nhận đơn hàng thành công");
    }

    @Operation(
            summary = "Hoàn thành chuẩn bị hàng",
            description = "Đánh dấu đã hoàn thành chuẩn bị hàng và chuyển cho shipper"
    )
    @PostMapping("/{orderId}/prepare")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> prepareOrder(
            @AuthenticationPrincipal User user,
            @Parameter(description = "ID đơn hàng", required = true)
            @PathVariable Long orderId,
            @Parameter(description = "Ghi chú chuẩn bị hàng")
            @RequestParam(required = false) String note) {

        log.info("Preparing order {} by user {}", orderId, user.getId());

        orderManagementService.prepareOrder(user.getId(), orderId, note);
        return updated( "Hoàn thành chuẩn bị hàng thành công");
    }

    @Operation(
            summary = "Hủy đơn hàng",
            description = "Hủy đơn hàng với lý do cụ thể"
    )
    @PostMapping("/{orderId}/cancel")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> cancelOrder(
            @AuthenticationPrincipal User user,
            @Parameter(description = "ID đơn hàng", required = true)
            @PathVariable Long orderId,
            @Parameter(description = "Lý do hủy đơn hàng", required = true)
            @RequestParam String reason) {

        log.info("Cancelling order {} by user {} with reason: {}", orderId, user.getId(), reason);

        orderManagementService.cancelOrder(user.getId(), orderId, reason);
        return ok(null, "Hủy đơn hàng thành công");
    }

    @Operation(
            summary = "Lấy lịch sử đơn hàng",
            description = "Lấy timeline/lịch sử thay đổi trạng thái của đơn hàng"
    )
    @GetMapping("/{orderId}/timeline")
    public ResponseEntity<ApiResponse<List<OrderTimelineResponse>>> getOrderTimeline(
            @AuthenticationPrincipal User user,
            @Parameter(description = "ID đơn hàng", required = true)
            @PathVariable Long orderId) {

        log.info("Getting timeline for order {} by user {}", orderId, user.getId());

        List<OrderTimelineResponse> timeline = orderManagementService.getOrderTimeline(user.getId(), orderId);
        return ok(timeline, "Lấy lịch sử đơn hàng thành công");
    }

    // ========== ADDITIONAL UTILITY ENDPOINTS ==========

    @Operation(
            summary = "Lấy các trạng thái có thể chuyển đổi",
            description = "Lấy danh sách các trạng thái mà đơn hàng có thể chuyển đổi từ trạng thái hiện tại"
    )
    @GetMapping("/status-transitions")
    public ResponseEntity<ApiResponse<List<OrderStatus>>> getAvailableStatusTransitions(
            @Parameter(description = "Trạng thái hiện tại", required = true)
            @RequestParam OrderStatus currentStatus) {

        log.info("Getting available status transitions for status: {}", currentStatus);

        List<OrderStatus> availableStatuses = getAvailableStatuses(currentStatus);
        return ok(availableStatuses, "Lấy danh sách trạng thái khả dụng thành công");
    }

    @Operation(
            summary = "Kiểm tra quyền cập nhật đơn hàng",
            description = "Kiểm tra xem đơn hàng có thể được cập nhật trạng thái hay không"
    )
    @GetMapping("/{orderId}/can-update")
    public ResponseEntity<ApiResponse<Boolean>> canUpdateOrderStatus(
            @AuthenticationPrincipal User user,
            @Parameter(description = "ID đơn hàng", required = true)
            @PathVariable Long orderId) {

        log.info("Checking if order {} can be updated by user {}", orderId, user.getId());

        try {
            OrderDetailResponse order = orderManagementService.getOrderDetail(user.getId(), orderId);
            boolean canUpdate = order.isCanUpdateStatus();
            return ok(canUpdate, "Kiểm tra quyền cập nhật thành công");
        } catch (Exception e) {
            return ok(false, "Không thể kiểm tra quyền cập nhật");
        }
    }

    @Operation(
            summary = "Lấy số lượng đơn hàng theo trạng thái",
            description = "Lấy thống kê số lượng đơn hàng theo từng trạng thái"
    )
    @GetMapping("/count-by-status")
    public ResponseEntity<ApiResponse<OrderStatsResponse>> getOrderCountByStatus(
            @AuthenticationPrincipal User user,
            @Parameter(description = "ID cửa hàng (tùy chọn)")
            @RequestParam(required = false) Long storeId) {

        log.info("Getting order count by status for user: {} and store: {}", user.getId(), storeId);

        OrderStatsResponse stats = orderManagementService.getOrderStats(user.getId(), storeId);
        return ok(stats, "Lấy thống kê theo trạng thái thành công");
    }

    // ========== PRIVATE HELPER METHODS ==========

    /**
     * Get available status transitions for current status
     */
    private List<OrderStatus> getAvailableStatuses(OrderStatus currentStatus) {
        switch (currentStatus) {
            case PENDING:
                return List.of(OrderStatus.PROCESSING, OrderStatus.CANCELLED);
            case PROCESSING:
                return List.of(OrderStatus.CONFIRMED_PREPARING, OrderStatus.CANCELLED);
            case CONFIRMED_PREPARING:
                return List.of(OrderStatus.ASSIGNED_TO_SHIPPER, OrderStatus.CANCELLED);
            default:
                return List.of();
        }
    }
}