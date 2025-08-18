package com.quadra.ecommerce_api.service.buyer;

import com.quadra.ecommerce_api.dto.buyer.response.UserStoreStatusDto;
import com.quadra.ecommerce_api.entity.store.SellerRegistration;
import com.quadra.ecommerce_api.entity.store.Store;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.repository.store.SellerRegistrationRepo;
import com.quadra.ecommerce_api.repository.store.StoreRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserStoreService {

    private final SellerRegistrationRepo sellerRegistrationRepository;
    private final StoreRepo storeRepository;

    @Autowired
    public UserStoreService(
            SellerRegistrationRepo sellerRegistrationRepository,
            StoreRepo storeRepository) {
        this.sellerRegistrationRepository = sellerRegistrationRepository;
        this.storeRepository = storeRepository;
    }

    /**
     * Lấy trạng thái tổng quan của user (registration + stores)
     */
    public UserStoreStatusDto getUserStoreStatus() {
        User user = getCurrentUser();

        // Tìm đăng ký mới nhất
        Optional<SellerRegistration> registrationOpt = sellerRegistrationRepository
                .findFirstByUserIdOrderByCreatedAtDesc(user.getId());

        UserStoreStatusDto.UserStoreStatusDtoBuilder builder = UserStoreStatusDto.builder()
                .hasRegistration(registrationOpt.isPresent());

        if (registrationOpt.isPresent()) {
            SellerRegistration registration = registrationOpt.get();
            builder.registrationId(registration.getId())
                    .registrationStatus(registration.getStatus().name())
                    .rejectionReason(registration.getRejectionReason())
                    .registrationCreatedAt(registration.getCreatedAt());

            // Nếu đã được approve, lấy danh sách stores
            if (registration.getStatus().name().equals("APPROVED")) {
                List<Store> userStores = storeRepository.findByOwnerId(user.getId());
                List<UserStoreStatusDto.StoreInfo> storeInfos = userStores.stream()
                        .map(this::mapToStoreInfo)
                        .collect(Collectors.toList());
                builder.stores(storeInfos);
            }
        }

        return builder.build();
    }

    /**
     * Chuyển đổi Store entity sang StoreInfo DTO
     */
    private UserStoreStatusDto.StoreInfo mapToStoreInfo(Store store) {
        return UserStoreStatusDto.StoreInfo.builder()
                .storeId(store.getId())
                .storeName(store.getName())
                .storeStatus(store.getStatus().name())
                .createdAt(store.getCreatedAt())
                .build();
    }

    /**
     * Lấy thông tin user hiện tại từ SecurityContext
     */
    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof User user)) {
            throw new IllegalStateException("Người dùng chưa được xác thực hoặc không hợp lệ");
        }
        return user;
    }
}