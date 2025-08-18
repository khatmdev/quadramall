package com.quadra.ecommerce_api.controller.customer.cart;


import com.quadra.ecommerce_api.common.base.AbstractBuyerController;
import com.quadra.ecommerce_api.dto.custom.cart.request.AddToCartRequest;
import com.quadra.ecommerce_api.dto.custom.cart.request.UpdateCartItemVariantRequest;
import com.quadra.ecommerce_api.dto.custom.cart.response.AddToCartResponse;
import com.quadra.ecommerce_api.dto.custom.cart.response.CartItemDTO;
import com.quadra.ecommerce_api.dto.custom.cart.response.CartStoreDTO;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.service.customer.cart.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart")
public class CartController extends AbstractBuyerController {
    protected final CartService cartService;
    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/add")
    public ResponseEntity<AddToCartResponse> addToCart(
            @AuthenticationPrincipal User user,
            @RequestBody AddToCartRequest request) {
        try {
            AddToCartResponse response = cartService.addToCart(user, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new AddToCartResponse(e.getMessage(), null, 0));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new AddToCartResponse("Có lỗi xảy ra. Vui lòng thử lại!", null, 0));
        }
    }

    @GetMapping
    public ResponseEntity<List<CartStoreDTO>> getCart(
            @AuthenticationPrincipal User user) {
        try {
            List<CartStoreDTO> cartItems = cartService.getCartItems(user);
            return ResponseEntity.ok(cartItems);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }

    @PutMapping("/{cartItemId}/quantity")
    public ResponseEntity<String> updateCartItemQuantity(
            @AuthenticationPrincipal User user,
            @PathVariable Long cartItemId,
            @RequestParam int quantity) {
        try {
            cartService.updateCartItemQuantity(cartItemId, user.getId(), quantity);
            return ResponseEntity.ok("Cập nhật số lượng thành công.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Có lỗi xảy ra. Vui lòng thử lại!");
        }
    }


    @PutMapping("/items/{cartItemId}/variant")
    public ResponseEntity<CartItemDTO> updateCartItemVariant(
            @PathVariable Long cartItemId,
            @AuthenticationPrincipal User user,
            @RequestBody UpdateCartItemVariantRequest request) {
        try {
            CartItemDTO response = cartService.updateCartItemVariant(cartItemId, user.getId(), request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }


    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<String> deleteCartItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long cartItemId) {
        try {
            cartService.deleteCartItem(cartItemId, user.getId());
            return ResponseEntity.ok("Xóa sản phẩm thành công.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Có lỗi xảy ra. Vui lòng thử lại!");
        }
    }

    @DeleteMapping("/{cartItemId}/addons/{addonId}")
    public ResponseEntity<String> deleteCartItemAddon(
            @AuthenticationPrincipal User user,
            @PathVariable Long cartItemId,
            @PathVariable Long addonId) {
        try {
            cartService.deleteCartItemAddon(cartItemId, user.getId(), addonId);
            return ResponseEntity.ok("Xóa phụ kiện thành công.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Có lỗi xảy ra. Vui lòng thử lại!");
        }
    }
}
