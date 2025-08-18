package com.quadra.ecommerce_api.controller.store_owner.product;


import com.quadra.ecommerce_api.common.base.BaseController;
import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.dto.store_owner.request.product.ProductCreateDto;
import com.quadra.ecommerce_api.dto.store_owner.request.product.update.ProductUpdateDto;
import com.quadra.ecommerce_api.dto.store_owner.response.product.ProductDTO;
import com.quadra.ecommerce_api.dto.store_owner.response.product.ProductEditDto;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.repository.store.StoreRepo;
import com.quadra.ecommerce_api.service.store_owner.request.product.ProductServiceReq;
import com.quadra.ecommerce_api.service.store_owner.request.product.ProductUpdateServiceReq;
import com.quadra.ecommerce_api.service.store_owner.response.product.ProductEditService;
import com.quadra.ecommerce_api.service.store_owner.response.product.ProductServiceRes;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;


@Tag(name = "seller.product", description = "QUản lý sản phẩm")
@RestController
@RequestMapping("/seller/products")
public class ProductController extends BaseController {
    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);

    private final ProductServiceReq productServiceReq;
    private final ProductServiceRes productServiceRes;
    private final ProductEditService productEditService;
    private final StoreRepo storeRepo;
    private final ProductUpdateServiceReq productUpdateServiceReq;

    @Autowired
    public ProductController(ProductServiceReq productServiceReq,
                             ProductServiceRes productServiceRes,
                             ProductEditService productEditService, StoreRepo storeRepo, ProductUpdateServiceReq productUpdateServiceReq) {
        this.productServiceReq = productServiceReq;
        this.productServiceRes = productServiceRes;
        this.productEditService = productEditService;
        this.storeRepo = storeRepo;
        this.productUpdateServiceReq = productUpdateServiceReq;
    }

    @Operation(summary = "Lấy danh sách sản phẩm của cửa hàng")
    @PreAuthorize("hasRole('SELLER')")
    @GetMapping("/{storeId}")
    public ResponseEntity<List<ProductDTO>> getStoreProducts(
            @AuthenticationPrincipal User user,
            @Parameter(description = "ID của cửa hàng", example = "1")
            @PathVariable Long storeId) {
        // Kiểm tra quyền sở hữu cửa hàng
        if (storeRepo.existsByIdAndOwnerId(storeId, user.getId())) {
            List<ProductDTO> products = productServiceRes.getStoreProducts(user, storeId);
            return ResponseEntity.ok(products);
        }
        throw new IllegalArgumentException("Bạn không có quyền truy cập cửa hàng này");
    }

    @Operation(summary = "Tạo sản phẩm mới")
    @PreAuthorize("hasRole('SELLER')")
    @PostMapping
    public ResponseEntity<ApiResponse<ProductCreateDto>> createProduct(
            @AuthenticationPrincipal User user,
            @RequestBody ProductCreateDto productDto) {
        // Kiểm tra quyền sở hữu cửa hàng
        if (storeRepo.existsByIdAndOwnerId(productDto.getStoreId(), user.getId())) {
            logger.debug("JSON nhận được: {}", productDto);
            try {
                ProductCreateDto productCreateDto = productServiceReq.createProduct(productDto);
                return ok(productCreateDto, "Sản phẩm được tạo thành công");
            } catch (IllegalArgumentException e) {
                return error(e.getMessage(), "INVALID_REQUEST", HttpStatus.BAD_REQUEST);
            } catch (Exception e) {
                logger.error("Lỗi khi tạo sản phẩm", e);
                return error("Đã xảy ra lỗi không mong muốn", "INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return error("Bạn không có quyền tạo sản phẩm cho cửa hàng này", "UNAUTHORIZED", HttpStatus.FORBIDDEN);
    }

    @Operation(summary = "Lấy thông tin sản phẩm để chỉnh sửa")
    @PreAuthorize("hasRole('SELLER')")
    @GetMapping("/edit/{id}")
    public ResponseEntity<ApiResponse<ProductEditDto>> getProductForEdit(
            @AuthenticationPrincipal User user,
            @Parameter(description = "ID của sản phẩm", example = "101")
            @PathVariable Long id) {
        try {
            ProductEditDto productEditDto = productEditService.getProductForEdit(id);
            // Kiểm tra quyền sở hữu cửa hàng
            if (storeRepo.existsByIdAndOwnerId(productEditDto.getStoreId(), user.getId())) {
                return ok(productEditDto, "Lấy thông tin sản phẩm thành công");
            }
            return error("Bạn không có quyền truy cập sản phẩm này", "UNAUTHORIZED", HttpStatus.FORBIDDEN);
        } catch (IllegalArgumentException e) {
            return error(e.getMessage(), "PRODUCT_NOT_FOUND", HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy thông tin sản phẩm", e);
            return error("Đã xảy ra lỗi không mong muốn", "INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "Cập nhật sản phẩm")
    @PreAuthorize("hasRole('SELLER')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductUpdateDto>> updateProduct(
            @AuthenticationPrincipal User user,
            @Parameter(description = "ID của sản phẩm cần cập nhật", example = "101")
            @PathVariable Long id,
            @RequestBody ProductUpdateDto productDto) {
        System.out.println("Dữ liệu frontend gửi lên: " + productDto);
        if (storeRepo.existsByIdAndOwnerId(productDto.getStoreId(), user.getId())) {
            if (!id.equals(productDto.getId())) {
                return error("ID sản phẩm trong body không khớp với ID trong URL", "INVALID_REQUEST", HttpStatus.BAD_REQUEST);
            }
            logger.debug("JSON nhận được: {}", productDto);
            try {
                ProductUpdateDto updatedProduct = productUpdateServiceReq.updateProduct(id, productDto);
                return ok(updatedProduct, "Sản phẩm được cập nhật thành công");
            } catch (IllegalArgumentException e) {
                return error(e.getMessage(), "INVALID_REQUEST", HttpStatus.BAD_REQUEST);
            } catch (Exception e) {
                logger.error("Lỗi khi cập nhật sản phẩm", e);
                return error("Đã xảy ra lỗi không mong muốn", "INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return error("Bạn không có quyền cập nhật sản phẩm này", "UNAUTHORIZED", HttpStatus.FORBIDDEN);
    }

}