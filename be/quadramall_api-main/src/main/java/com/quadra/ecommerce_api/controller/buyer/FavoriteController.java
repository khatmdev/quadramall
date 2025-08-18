package com.quadra.ecommerce_api.controller.buyer;

import com.quadra.ecommerce_api.common.base.AbstractBuyerController;
import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.dto.custom.product.response.ProductCardDTO;
import com.quadra.ecommerce_api.dto.custom.user.request.FavoriteRequest;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.service.base.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/favorites")
public class FavoriteController extends AbstractBuyerController {

    private final FavoriteService favoriteService;

    @Autowired
    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    /**
     * Thêm sản phẩm vào danh sách yêu thích của người dùng.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> addFavorite(
            @AuthenticationPrincipal User user,
            @RequestBody FavoriteRequest request
    ) {
        favoriteService.addFavorite(user.getId(), request.getProductId());
        return created(null, "Đã thêm vào yêu thích");
    }

    /**
     * Xóa sản phẩm khỏi danh sách yêu thích.
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId
    ) {
        favoriteService.removeFavorite(user.getId(), productId);
        return deleted("Đã xóa khỏi yêu thích");
    }

    /**
     * Lấy danh sách sản phẩm yêu thích của người dùng.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductCardDTO>>> getFavorites(
            @AuthenticationPrincipal User user
    ) {
        List<ProductCardDTO> favorites = favoriteService.findFavoriteProductCards(user.getId());
        return ok(favorites);
    }
}

