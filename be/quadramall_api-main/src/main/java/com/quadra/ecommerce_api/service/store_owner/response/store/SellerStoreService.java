package com.quadra.ecommerce_api.service.store_owner.response.store;

import com.quadra.ecommerce_api.dto.store_owner.response.store.StoreInfoDto;
import com.quadra.ecommerce_api.entity.store.Store;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.repository.store.StoreRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SellerStoreService {

    private final StoreRepo storeRepository;

    @Autowired
    public SellerStoreService(StoreRepo storeRepository) {
        this.storeRepository = storeRepository;
    }

    /**
     * Lấy thông tin tất cả cửa hàng của user
     */
    public List<StoreInfoDto> getCurrentUserStores(User user) {
        List<Store> stores = storeRepository.findByOwnerId(user.getId());

        return stores.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Convert Store entity sang StoreInfoDto
     */
    private StoreInfoDto convertToDto(Store store) {
        return StoreInfoDto.builder()
                .id(store.getId())
                .name(store.getName())
                .slug(store.getSlug())
                .address(store.getAddress())
                .description(store.getDescription())
                .logoUrl(store.getLogoUrl())
                .status(store.getStatus())
                .lockReason(store.getLockReason())
                .createdAt(store.getCreatedAt())
                .updatedAt(store.getUpdatedAt())
                .build();
    }
}