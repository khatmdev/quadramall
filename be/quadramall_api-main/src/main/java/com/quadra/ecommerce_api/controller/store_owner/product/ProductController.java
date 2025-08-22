package com.quadra.ecommerce_api.controller.store_owner.product;


import com.quadra.ecommerce_api.common.base.AbstractSellerController;
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
public class ProductController extends AbstractSellerController {
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

    @Operation(summary = "Lấy danh sách sản phẩm đang hoạt động của cửa hàng")
    @PreAuthorize("hasRole('SELLER')")
    @GetMapping("/{storeId}/active")
    public ResponseEntity<List<ProductDTO>> getActiveStoreProducts(
            @AuthenticationPrincipal User user,
            @Parameter(description = "ID của cửa hàng", example = "1")
            @PathVariable Long storeId) {
        // Kiểm tra quyền sở hữu cửa hàng
        if (storeRepo.existsByIdAndOwnerId(storeId, user.getId())) {
            List<ProductDTO> products = productServiceRes.getActiveStoreProducts(user, storeId);
            return ResponseEntity.ok(products);
        }
        throw new IllegalArgumentException("Bạn không có quyền truy cập cửa hàng này");
    }

    @Operation(summary = "Lấy danh sách sản phẩm đã vô hiệu hóa của cửa hàng")
    @PreAuthorize("hasRole('SELLER')")
    @GetMapping("/{storeId}/inactive")
    public ResponseEntity<List<ProductDTO>> getInactiveStoreProducts(
            @AuthenticationPrincipal User user,
            @Parameter(description = "ID của cửa hàng", example = "1")
            @PathVariable Long storeId) {
        // Kiểm tra quyền sở hữu cửa hàng
        if (storeRepo.existsByIdAndOwnerId(storeId, user.getId())) {
            List<ProductDTO> products = productServiceRes.getInactiveStoreProducts(user, storeId);
            return ResponseEntity.ok(products);
        }
        throw new IllegalArgumentException("Bạn không có quyền truy cập cửa hàng này");
    }

    // BONUS: Giữ lại method cũ để lấy tất cả sản phẩm (nếu cần)
    @Operation(summary = "Lấy tất cả sản phẩm của cửa hàng (bao gồm cả active và inactive)")
    @PreAuthorize("hasRole('SELLER')")
    @GetMapping("/{storeId}/all")
    public ResponseEntity<List<ProductDTO>> getAllStoreProducts(
            @AuthenticationPrincipal User user,
            @Parameter(description = "ID của cửa hàng", example = "1")
            @PathVariable Long storeId) {
        // Kiểm tra quyền sở hữu cửa hàng
        if (storeRepo.existsByIdAndOwnerId(storeId, user.getId())) {
            List<ProductDTO> products = productServiceRes.getAllStoreProducts(user, storeId);
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


    @Operation(summary = "Vô hiệu hóa sản phẩm")
    @PreAuthorize("hasRole('SELLER')")
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateProduct(
            @AuthenticationPrincipal User user,
            @Parameter(description = "ID của sản phẩm cần vô hiệu hóa", example = "101")
            @PathVariable Long id) {
        try {
            // Kiểm tra quyền sở hữu
            Long storeId = productServiceReq.getStoreIdByProductId(id);
            if (!storeRepo.existsByIdAndOwnerId(storeId, user.getId())) {
                return error("Bạn không có quyền thao tác với sản phẩm này", "UNAUTHORIZED", HttpStatus.FORBIDDEN);
            }

            productServiceReq.deactivateProduct(id);
            return ok(null, "Sản phẩm đã được vô hiệu hóa thành công");

        } catch (IllegalArgumentException e) {
            return error(e.getMessage(), "INVALID_REQUEST", HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            logger.error("Lỗi khi vô hiệu hóa sản phẩm với ID: {}", id, e);
            return error("Đã xảy ra lỗi không mong muốn", "INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "Kích hoạt sản phẩm")
    @PreAuthorize("hasRole('SELLER')")
    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<Void>> activateProduct(
            @AuthenticationPrincipal User user,
            @Parameter(description = "ID của sản phẩm cần kích hoạt", example = "101")
            @PathVariable Long id) {
        try {
            // Kiểm tra quyền sở hữu
            Long storeId = productServiceReq.getStoreIdByProductId(id);
            if (!storeRepo.existsByIdAndOwnerId(storeId, user.getId())) {
                return error("Bạn không có quyền thao tác với sản phẩm này", "UNAUTHORIZED", HttpStatus.FORBIDDEN);
            }

            productServiceReq.activateProduct(id);
            return ok(null, "Sản phẩm đã được kích hoạt thành công");

        } catch (IllegalArgumentException e) {
            return error(e.getMessage(), "INVALID_REQUEST", HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            logger.error("Lỗi khi kích hoạt sản phẩm với ID: {}", id, e);
            return error("Đã xảy ra lỗi không mong muốn", "INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}