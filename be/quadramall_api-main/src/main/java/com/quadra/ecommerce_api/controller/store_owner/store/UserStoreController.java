package com.quadra.ecommerce_api.controller.store_owner.store;

import com.quadra.ecommerce_api.common.base.AbstractBuyerController;
import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.dto.buyer.response.UserStoreStatusDto;
import com.quadra.ecommerce_api.dto.store_owner.response.store.StoreInfoDto;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.service.buyer.UserStoreService;
import com.quadra.ecommerce_api.service.store_owner.response.store.SellerStoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "User Store Status", description = "API for user store and registration status")
@RestController
@RequestMapping("/seller/user-store")
public class UserStoreController extends AbstractBuyerController {

    private final UserStoreService userStoreService;
    private final SellerStoreService storeService;

    @Autowired
    public UserStoreController(UserStoreService userStoreService,
                               SellerStoreService storeService) {
        this.userStoreService = userStoreService;
        this.storeService = storeService;
    }

    @Operation(summary = "Get user store status", description = "Get current user's registration and store status overview")
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<UserStoreStatusDto>> getUserStoreStatus() {
        UserStoreStatusDto statusDto = userStoreService.getUserStoreStatus();
        return ok(statusDto);
    }

    @Operation(summary = "Get current user's stores", description = "Get all stores owned by the current user")
    @GetMapping("/stores")
    public ResponseEntity<ApiResponse<List<StoreInfoDto>>> getCurrentUserStores(
            @AuthenticationPrincipal User user) {
        List<StoreInfoDto> stores = storeService.getCurrentUserStores(user);
        return ok(stores);
    }
}