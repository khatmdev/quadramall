package com.quadra.ecommerce_api.service.base;

import com.quadra.ecommerce_api.dto.custom.store.response.StoreHomeResponseDTO;
import com.quadra.ecommerce_api.repository.store.StoreRepo;
import com.quadra.ecommerce_api.service.store_owner.response.store.ItemTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StoreBaseService {
    private final StoreRepo storeRepo;
    private final ItemTypeService itemTypeService;

    public List<StoreHomeResponseDTO> getFeaturedStores(Long itemTypeId) {
        Pageable top10 = PageRequest.of(0, 10);
        List<Long> ids = itemTypeService.getAllChildItemTypeIds(itemTypeId);
        return storeRepo.findTopStoresByItemTypeIds(ids, top10);
    }
}
