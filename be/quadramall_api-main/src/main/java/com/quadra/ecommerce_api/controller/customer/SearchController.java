package com.quadra.ecommerce_api.controller.customer;

import com.quadra.ecommerce_api.common.base.AbstractPublicController;
import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.dto.custom.address.response.ProvinceResponseDTO;
import com.quadra.ecommerce_api.dto.custom.product.response.ProductCardDTO;
import com.quadra.ecommerce_api.dto.custom.store.response.StoreHomeResponseDTO;
import com.quadra.ecommerce_api.dto.store_owner.response.store.ItemTypeDTO;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.service.address.ProvinceService;
import com.quadra.ecommerce_api.service.base.StoreBaseService;
import com.quadra.ecommerce_api.service.customer.product.ProductService;
import com.quadra.ecommerce_api.service.store_owner.response.store.ItemTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/public/search")
@RequiredArgsConstructor
public class SearchController extends AbstractPublicController{

    private final ProductService productService;
    private final ItemTypeService categoryService;
    private final StoreBaseService storeService;
    private final ProvinceService provinceService;

    /**
     * API chính: Lấy danh sách sản phẩm dạng lưới theo các tiêu chí lọc.
     */
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<Page<ProductCardDTO>>> browseProducts(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long itemTypeId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sortBy, // priceAsc, priceDesc, sold, rating, latest
            @RequestParam(required = false) String province,
            @RequestParam(required = false) BigDecimal priceMin,
            @RequestParam(required = false) BigDecimal priceMax,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = user != null ? user.getId() : null;
        Page<ProductCardDTO> result = productService.searchProducts(userId, itemTypeId, keyword, sortBy, province, priceMin, priceMax, page, size);
        return ok(result);
    }

    /**
     * Lấy danh sách tỉnh thành có shop bán sản phẩm thuộc ngành hàng / danh mục này.
     */
    @GetMapping("/filters/provinces")
    public ResponseEntity<ProvinceResponseDTO> getAllProvinces() {
        ProvinceResponseDTO provinces = provinceService.getAllProvinces();
        return ResponseEntity.ok(provinces);
    }

    /**
     * Lấy danh mục ngành hàng cha (cấp cao nhất) để dựng sidebar.
     */
    @GetMapping("/item-types-tree")
    public ResponseEntity<ApiResponse<List<ItemTypeDTO>>> getTopItemTypes() {
        List<ItemTypeDTO> itemTypes = categoryService.getAllWithHierarchy();
        return ok(itemTypes);
    }

    /**
     * Lấy danh sách cửa hàng nổi bật trong ngành hàng.
     */
    @GetMapping("/featured-stores")
    public ResponseEntity<ApiResponse<List<StoreHomeResponseDTO>>> getFeaturedStores(
            @RequestParam(required = false) Long itemTypeId
    ) {
        List<StoreHomeResponseDTO> stores = storeService.getFeaturedStores(itemTypeId);
        return ok(stores);
    }
}

