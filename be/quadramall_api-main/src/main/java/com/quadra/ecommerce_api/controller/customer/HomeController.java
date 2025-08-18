package com.quadra.ecommerce_api.controller.customer;

import com.quadra.ecommerce_api.common.base.AbstractPublicController;
import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.dto.base.cms.BannerDTO;
import com.quadra.ecommerce_api.dto.base.flashsale.BuyerFlashSaleProductDTO;
import com.quadra.ecommerce_api.dto.base.store.ItemTypeDTO;
import com.quadra.ecommerce_api.dto.custom.product.response.ProductCardDTO;
import com.quadra.ecommerce_api.dto.custom.store.response.StoreHomeResponseDTO;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.service.flashsale.FlashSaleService;
import com.quadra.ecommerce_api.service.home.HomeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Home", description = "API liên quan đến trang chủ công khai, bao gồm banner, loại sản phẩm, cửa hàng và sản phẩm nổi bật")
@RestController
@RequestMapping("/public")
public class HomeController extends AbstractPublicController {

    private final HomeService homeService;
    private final FlashSaleService flashSaleService;

    @Autowired
    public HomeController(HomeService homeService, FlashSaleService flashSaleService) {
        this.homeService = homeService;
        this.flashSaleService = flashSaleService;
    }

    @Operation(
            summary = "Lấy Banner Intro khi mới vào trang chủ",
            description = "Trả về một BannerDTO có trường isIntro = true"
    )
    @GetMapping("/intro")
    public ResponseEntity<ApiResponse<BannerDTO>> getIntro() {
        return ok(homeService.findIntro());
    }

    @Operation(
            summary = "Lấy danh sách banner đang hoạt động",
            description = "Trả về danh sách các banner đang active, được sắp xếp theo thứ tự hiển thị trên trang chủ."
    )
    @GetMapping("/banners")
    public ResponseEntity<ApiResponse<List<BannerDTO>>> getBanners() {
        List<BannerDTO> bannerDTOs = homeService.findBannersActive();
        return ok(bannerDTOs);
    }

    @Operation(
            summary = "Lấy danh sách loại sản phẩm",
            description = "Trả về danh sách các loại sản phẩm (item types) hiển thị trên trang chủ."
    )
    @GetMapping("/item-types")
    public ResponseEntity<ApiResponse<List<ItemTypeDTO>>> getItemTypes() {
        List<ItemTypeDTO> itemTypes = homeService.findItemTypes();
        return ok(itemTypes);
    }

    @GetMapping("/flash-sales")
    @Operation(
            summary = "Lấy danh sách sản phẩm flash sale cho trang chủ",
            description = "Trả về danh sách các sản phẩm đang trong chương trình flash sale, với phân trang."
    )
    public ResponseEntity<ApiResponse<Page<BuyerFlashSaleProductDTO>>> getFlashSaleProducts(
            @Parameter(description = "Số trang (bắt đầu từ 0)", required = false, example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Kích thước trang (số sản phẩm mỗi trang)", required = false, example = "5")
            @RequestParam(defaultValue = "5") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BuyerFlashSaleProductDTO> flashSalePage = flashSaleService.getFlashSaleProductsForHome(pageable);
        return ok(flashSalePage);
    }

    @Operation(
            summary = "Lấy danh sách cửa hàng hiển thị ở trang chủ",
            description = "Trả về danh sách các cửa hàng nổi bật hoặc được chọn để hiển thị trên trang chủ."
    )
    @GetMapping("/stores")
    public ResponseEntity<ApiResponse<List<StoreHomeResponseDTO>>> getStores() {
        List<StoreHomeResponseDTO> stores = homeService.findStores();
        return ok(stores);
    }

    @Operation(
            summary = "Lấy danh sách sản phẩm hiển thị ở trang chủ",
            description = "Trả về danh sách sản phẩm nổi bật trên trang chủ với phân trang. Có thể tùy chỉnh dựa trên user ID nếu có."
    )
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<ProductCardDTO>>> getProducts(
            @AuthenticationPrincipal User user,
            @Parameter(description = "Số trang (bắt đầu từ 0)", required = false, example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Kích thước trang (số sản phẩm mỗi trang)", required = false, example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        Long userId = user != null ? user.getId() : null;
        List<ProductCardDTO> products = homeService.findAllProducts(userId, page, size);
        return ok(products);
    }


}
