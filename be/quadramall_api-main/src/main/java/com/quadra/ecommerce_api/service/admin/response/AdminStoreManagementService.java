package com.quadra.ecommerce_api.service.admin.response;


import com.quadra.ecommerce_api.dto.admin.request.LockStoreRequestDto;
import com.quadra.ecommerce_api.dto.admin.response.store.*;
import com.quadra.ecommerce_api.entity.store.Store;
import com.quadra.ecommerce_api.enums.store.StoreStatus;
import com.quadra.ecommerce_api.repository.product.ProductRepo;
import com.quadra.ecommerce_api.repository.product.ProductStatsRepo;
import com.quadra.ecommerce_api.repository.store.StoreRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminStoreManagementService {


    private final StoreRepo storeRepo;
    private final ProductRepo productRepo;
    private final ProductStatsRepo productStatsRepo;

    public List<StoreManagementResponseDto> getStoreManagementData(String status) {
        // Chuyển String status thành StoreStatus enum
        StoreStatus storeStatus = status != null ? StoreStatus.valueOf(status) : null;

        // Lấy danh sách cửa hàng
        List<Store> stores = storeRepo.findStoresByStatus(storeStatus);
        if (stores == null || stores.isEmpty()) {
            return Collections.emptyList();
        }

        // Ánh xạ danh sách cửa hàng
        return stores.stream()
                .map(store -> {
                    // Thông tin cửa hàng
                    OwnerDto ownerDto = store.getOwner() != null
                            ? OwnerDto.builder()
                            .ownerId(store.getOwner().getId())
                            .fullName(store.getOwner().getFullName())
                            .email(store.getOwner().getEmail())
                            .phone(store.getOwner().getPhone())
                            .build()
                            : null;
                    StoreDto storeDto = StoreDto.builder()
                            .storeId(store.getId())
                            .storeName(store.getName())
                            .storeAddress(store.getAddress())
                            .storeDescription(store.getDescription())
                            .storeLogoUrl(store.getLogoUrl())
                            .storeStatus(store.getStatus().name())
                            .lockReason(store.getLockReason())
                            .storeCreatedAt(store.getCreatedAt())
                            .owner(ownerDto)
                            .build();

                    // Danh sách sản phẩm
                    List<Object[]> productData = productRepo.findProductDataByStoreId(store.getId());
                    List<ProductDto> productDtos = productData != null
                            ? productData.stream()
                            .map(data -> ProductDto.builder()
                                    .productId((Long) data[0])
                                    .name((String) data[1])
                                    .isActive((Boolean) data[2])
                                    .minPrice((BigDecimal) data[3])
                                    .maxPrice((BigDecimal) data[4])
                                    .totalStock(data[5] != null ? ((Number) data[5]).intValue() : 0)
                                    .totalSold(data[6] != null ? ((Number) data[6]).intValue() : 0)
                                    .build())
                            .collect(Collectors.toList())
                            : Collections.emptyList();

                    // Thống kê nghiệp vụ
                    Object[] statsData = productStatsRepo.findProductStatsByStoreId(store.getId());
                    ProductStatsDto statsDto;
                    if (statsData == null || statsData.length < 5) {
                        statsDto = ProductStatsDto.builder()
                                .totalOrders(0)
                                .completionRate(BigDecimal.ZERO)
                                .averageRating(BigDecimal.ZERO)
                                .totalRevenue(BigDecimal.ZERO)
                                .build();
                    } else {
                        Long totalOrders = statsData[0] != null ? (Long) statsData[0] : 0L;
                        Long deliveredOrders = statsData[1] != null ? (Long) statsData[1] : 0L;
                        Long totalOrdersForRate = statsData[2] != null ? (Long) statsData[2] : 0L;
                        Double averageRating = statsData[3] != null ? (Double) statsData[3] : null;
                        BigDecimal totalRevenue = statsData[4] != null ? (BigDecimal) statsData[4] : null;

                        BigDecimal completionRate = totalOrdersForRate > 0
                                ? BigDecimal.valueOf(deliveredOrders)
                                .multiply(BigDecimal.valueOf(100.0))
                                .divide(BigDecimal.valueOf(totalOrdersForRate), 2, BigDecimal.ROUND_HALF_UP)
                                : BigDecimal.ZERO;

                        statsDto = ProductStatsDto.builder()
                                .totalOrders(totalOrders.intValue())
                                .completionRate(completionRate)
                                .averageRating(averageRating != null ? new BigDecimal(averageRating.toString()) : BigDecimal.ZERO)
                                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                                .build();
                    }

                    return StoreManagementResponseDto.builder()
                            .store(storeDto)
                            .products(productDtos)
                            .stats(statsDto)
                            .build();
                })
                .collect(Collectors.toList());
    }



    @Transactional
    public void lockUnlockStore(Long storeId, LockStoreRequestDto request) {
        Store store = storeRepo.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found with ID: " + storeId));

        if (request.getStoreStatus() == StoreStatus.LOCKED && (request.getLockReason() == null || request.getLockReason().isEmpty())) {
            throw new IllegalArgumentException("Lock reason is required when locking a store");
        }

        store.setStatus(request.getStoreStatus());
        store.setLockReason(request.getStoreStatus() == StoreStatus.LOCKED ? request.getLockReason() : null);
        storeRepo.save(store);
    }

}
