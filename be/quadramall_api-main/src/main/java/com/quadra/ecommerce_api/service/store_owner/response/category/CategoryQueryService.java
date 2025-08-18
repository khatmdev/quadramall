package com.quadra.ecommerce_api.service.store_owner.response.category;

import com.quadra.ecommerce_api.dto.store_owner.response.category.CategoryDetailDto;
import com.quadra.ecommerce_api.dto.store_owner.response.category.CategoryDto;
import com.quadra.ecommerce_api.dto.store_owner.response.category.ProductDto;
import com.quadra.ecommerce_api.entity.product.Product;
import com.quadra.ecommerce_api.entity.store.Category;
import com.quadra.ecommerce_api.repository.product.ProductRepo;
import com.quadra.ecommerce_api.repository.product.ProductVariantRepo;
import com.quadra.ecommerce_api.repository.store.CategoryRepo;
import com.quadra.ecommerce_api.repository.store.StoreRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CategoryQueryService {

    private final CategoryRepo categoryRepo;
    private final StoreRepo storeRepo;
    private final ProductRepo productRepo;
    private final ProductVariantRepo productVariantRepo;

    @Autowired
    public CategoryQueryService(
            CategoryRepo categoryRepo,
            StoreRepo storeRepo,
            ProductRepo productRepo,
            ProductVariantRepo productVariantRepo
    ) {
        this.categoryRepo = categoryRepo;
        this.storeRepo = storeRepo;
        this.productRepo = productRepo;
        this.productVariantRepo = productVariantRepo;
    }

    public List<CategoryDto> getCategoryTreeByStoreId(Long storeId) {
        if (!storeRepo.existsById(storeId)) {
            throw new EntityNotFoundException("Cửa hàng với ID " + storeId + " không tồn tại");
        }

        List<Category> categories = categoryRepo.findByStoreId(storeId);
        Long totalCategories = categoryRepo.countByStoreId(storeId);
        Long totalProducts = productRepo.countByStoreIdAndIsActiveTrue(storeId);
        Long totalProductsWithCategory = categoryRepo.countProductsWithCategoryByStoreId(storeId);

        List<CategoryDto> categoryDtos = categories.stream()
                .map(this::convertToCategoryDto)
                .collect(Collectors.toList());

        Map<Long, CategoryDto> categoryMap = categoryDtos.stream()
                .collect(Collectors.toMap(CategoryDto::getId, dto -> dto));

        List<CategoryDto> rootCategories = new ArrayList<>();
        for (CategoryDto dto : categoryDtos) {
            if (dto.getParentId() == null) {
                rootCategories.add(dto);
            } else {
                CategoryDto parent = categoryMap.get(dto.getParentId());
                if (parent != null) {
                    parent.getChildren().add(dto);
                }
            }
        }

        rootCategories.forEach(dto -> {
            dto.setTotalCategories(totalCategories);
            dto.setTotalProducts(totalProducts);
            dto.setTotalProductsWithCategory(totalProductsWithCategory);
        });

        return rootCategories;
    }

    public CategoryDetailDto getCategoryDetail(Long storeId, Long categoryId) {
        if (!storeRepo.existsById(storeId)) {
            throw new EntityNotFoundException("Cửa hàng với ID " + storeId + " không tồn tại");
        }

        Category category = categoryRepo.findByIdAndStoreId(categoryId, storeId)
                .orElseThrow(() -> new EntityNotFoundException("Danh mục với ID " + categoryId + " không thuộc cửa hàng"));

        List<Product> products = productRepo.findByStoreIdAndCategoryIdAndIsActiveTrue(storeId, categoryId);
        List<Product> uncategorizedProducts = productRepo.findUncategorizedByStoreId(storeId);
        Long totalProductsWithCategory = categoryRepo.countProductsWithCategoryByStoreId(storeId);

        CategoryDetailDto dto = new CategoryDetailDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setTotalProductsWithCategory(totalProductsWithCategory);
        dto.setProducts(products.stream()
                .map(this::convertToProductDto)
                .collect(Collectors.toList()));
        dto.setUncategorizedProducts(uncategorizedProducts.stream()
                .map(this::convertToProductDto)
                .collect(Collectors.toList()));

        return dto;
    }

    private CategoryDto convertToCategoryDto(Category category) {
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getParent() != null ? category.getParent().getId() : null
        );
    }

    private ProductDto convertToProductDto(Product product) {
        return new ProductDto(
                product.getId(),
                product.getName(),
                findMinPrice(product.getId()),
                product.getThumbnailUrl(),
                product.getCategory() != null ? product.getCategory().getId() : null
        );
    }

    public Long findMinPrice(Long productId) {
        return productVariantRepo.findMinPriceByProductId(productId)
                .map(BigDecimal::longValue)
                .orElse(0L);
    }
}