package com.quadra.ecommerce_api.controller.store_owner.flash_sale;

import com.quadra.ecommerce_api.common.annotation.ApiVoid;
import com.quadra.ecommerce_api.common.base.AbstractSellerController;
import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.dto.base.flashsale.*;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.repository.store.StoreRepo;
import com.quadra.ecommerce_api.service.flashsale.FlashSaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seller/{storeId}/flashsales")
@RequiredArgsConstructor
public class SellerFlashSaleController extends AbstractSellerController {

    private final FlashSaleService flashSaleService;
    private final StoreRepo storeRepo; // Inject repo để check ownership

    @GetMapping
    public ResponseEntity<ApiResponse<List<SellerFlashSaleProductDTO>>> getFlashSales(
            @AuthenticationPrincipal User user,
            @PathVariable Long storeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (!storeRepo.existsByIdAndOwnerId(storeId, user.getId())) {
            return error("You do not own this store", "FORBIDDEN", HttpStatus.FORBIDDEN);
        }
        Pageable pageable = PageRequest.of(page, size);
        List<SellerFlashSaleProductDTO> flashSales = flashSaleService.getFlashSaleProductsForSeller(storeId, pageable);
        return ok(flashSales);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SellerFlashSaleProductDTO>> createFlashSale(
            @AuthenticationPrincipal User user,
            @PathVariable Long storeId,
            @Valid @RequestBody CreateFlashSaleDTO dto) {
        if (!storeRepo.existsByIdAndOwnerId(storeId, user.getId())) {
            return error("You do not own this store", "FORBIDDEN", HttpStatus.FORBIDDEN);
        }
        SellerFlashSaleProductDTO created = flashSaleService.createFlashSale(dto);
        return created(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SellerFlashSaleProductDTO>> updateFlashSale(
            @AuthenticationPrincipal User user,
            @PathVariable Long storeId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateFlashSaleDTO dto) {
        if (!storeRepo.existsByIdAndOwnerId(storeId, user.getId())) {
            return error("You do not own this store", "FORBIDDEN", HttpStatus.FORBIDDEN);
        }
        SellerFlashSaleProductDTO updated = flashSaleService.updateFlashSale(id, storeId, dto);
        return updated(updated);
    }

    @ApiVoid
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFlashSale(
            @AuthenticationPrincipal User user,
            @PathVariable Long storeId,
            @PathVariable Long id) {
        if (!storeRepo.existsByIdAndOwnerId(storeId, user.getId())) {
            return error("You do not own this store", "FORBIDDEN", HttpStatus.FORBIDDEN);
        }
        flashSaleService.deleteFlashSale(id, storeId);
        return deleted();
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<Page<ProductSellerDTO>>> getProducts(
            @AuthenticationPrincipal User user,
            @PathVariable Long storeId,
            @RequestParam(required = false) String searchQuery,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (!storeRepo.existsByIdAndOwnerId(storeId, user.getId())) {
            return error("You do not own this store", "FORBIDDEN", HttpStatus.FORBIDDEN);
        }
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductSellerDTO> products = flashSaleService.getProductsForStore(storeId, searchQuery, pageable);
        return ok(products);
    }
}