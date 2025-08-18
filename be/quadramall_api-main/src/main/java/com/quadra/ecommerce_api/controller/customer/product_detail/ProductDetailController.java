package com.quadra.ecommerce_api.controller.customer.product_detail;

import com.quadra.ecommerce_api.common.base.AbstractPublicController;
import com.quadra.ecommerce_api.dto.custom.productDetail.ProductDetailDTO;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.service.customer.product.ProductService;
import com.quadra.ecommerce_api.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/products")
public class ProductDetailController extends AbstractPublicController {

    private final ProductService service;

    public ProductDetailController(ProductService service) {
        this.service = service;
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<ProductDetailDTO>> getProductDetail(
            @Parameter(description = "Slug của sản phẩm", required = true, example = "iphone-13")
            @PathVariable String slug,
            @AuthenticationPrincipal User user
    ) {
        Long userId = user != null ? user.getId() : null;
        ProductDetailDTO productDetail = service.getProductDetailBySlug(slug, userId);
        return ok(productDetail);
    }
}
