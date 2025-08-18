package com.quadra.ecommerce_api.controller.store_owner.store;

import com.quadra.ecommerce_api.common.base.AbstractBuyerController;
import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.dto.buyer.response.UserStoreStatusDto;
import com.quadra.ecommerce_api.service.buyer.UserStoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "User Store Status", description = "API for user store and registration status")
@RestController
@RequestMapping("/user-store")
public class UserStoreController extends AbstractBuyerController {

    private final UserStoreService userStoreService;

    @Autowired
    public UserStoreController(UserStoreService userStoreService) {
        this.userStoreService = userStoreService;
    }

    @Operation(summary = "Get user store status", description = "Get current user's registration and store status overview")
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<UserStoreStatusDto>> getUserStoreStatus() {
        UserStoreStatusDto statusDto = userStoreService.getUserStoreStatus();
        return ok(statusDto);
    }
}