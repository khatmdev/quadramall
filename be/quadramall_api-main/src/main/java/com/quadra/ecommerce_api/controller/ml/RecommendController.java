package com.quadra.ecommerce_api.controller.ml;

import com.quadra.ecommerce_api.common.base.AbstractBuyerController;
import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.dto.custom.product.response.ProductCardDTO;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.service.home.HomeService;
import com.quadra.ecommerce_api.service.ml.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/buyer/recommend")
public class RecommendController extends AbstractBuyerController {
    private final RecommendationService recommendationService;
    private final HomeService homeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductCardDTO>>> recommend(@AuthenticationPrincipal User user) {
        Long userId = user != null ? user.getId() : null;
        List<Long> ids = recommendationService.getRecommendationsForUser(userId);
        List<ProductCardDTO> recs = homeService.getByIds(ids, userId);
        return ok(recs);
    }
}

