package com.quadra.ecommerce_api.service.store_owner.response.product;

import com.quadra.ecommerce_api.dto.store_owner.response.product.ProductDTO;
import com.quadra.ecommerce_api.entity.product.Product;
import com.quadra.ecommerce_api.entity.product.ProductVariant;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.mapper.store_owner.response.product.ListProductMapper;
import com.quadra.ecommerce_api.repository.product.ProductRepo;
import com.quadra.ecommerce_api.repository.product.ProductVariantRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceRes {

    protected final ProductRepo productRepo;
    protected final ProductVariantRepo productVariantRepo;
    protected final ListProductMapper productMapper;

    public ProductServiceRes(ProductRepo productRepo, ProductVariantRepo productVariantRepo, ListProductMapper productMapper) {
        this.productRepo = productRepo;
        this.productVariantRepo = productVariantRepo;
        this.productMapper = productMapper;
    }

    /**
     * Lấy danh sách sản phẩm ACTIVE của cửa hàng
     */
    public List<ProductDTO> getActiveStoreProducts(User user, Long storeId) {
        System.out.println("Getting ACTIVE products - User: " + user.getEmail() + " StoreId: " + storeId);
        List<Product> products = productRepo.findActiveByStoreIdAndOwnerId(storeId, user.getId());
        System.out.println("Active products found: " + products.size());

        if (products.isEmpty()) {
            return List.of(); // Trả về list rỗng thay vì throw exception
        }

        return mapProductsToDTO(products);
    }

    /**
     * Lấy danh sách sản phẩm INACTIVE của cửa hàng
     */
    public List<ProductDTO> getInactiveStoreProducts(User user, Long storeId) {
        System.out.println("Getting INACTIVE products - User: " + user.getEmail() + " StoreId: " + storeId);
        List<Product> products = productRepo.findInactiveByStoreIdAndOwnerId(storeId, user.getId());
        System.out.println("Inactive products found: " + products.size());

        if (products.isEmpty()) {
            return List.of(); // Trả về list rỗng thay vì throw exception
        }

        return mapProductsToDTO(products);
    }

    /**
     * Lấy TẤT CẢ sản phẩm của cửa hàng (cả active và inactive)
     */
    public List<ProductDTO> getAllStoreProducts(User user, Long storeId) {
        System.out.println("Getting ALL products - User: " + user.getEmail() + " StoreId: " + storeId);
        List<Product> products = productRepo.findAllByStoreIdAndOwnerId(storeId, user.getId());
        System.out.println("All products found: " + products.size());

        if (products.isEmpty()) {
            return List.of(); // Trả về list rỗng thay vì throw exception
        }

        return mapProductsToDTO(products);
    }

    /**
     * Helper method để map Product sang ProductDTO (tái sử dụng logic)
     */
    private List<ProductDTO> mapProductsToDTO(List<Product> products) {
        return products.stream().map(product -> {
            ProductDTO dto = productMapper.toDTO(product);

            // Lấy itemType từ Category
            dto.setItemType(product.getItemType().getName());

            // Tính tổng tồn kho và giá min/max từ product_variants
            List<ProductVariant> variants = productVariantRepo.findByProductId(product.getId());
            if (variants.isEmpty()) {
                // Không có variant, gán giá mặc định và tồn kho là 0
                dto.setMinPrice(BigDecimal.ZERO);
                dto.setMaxPrice(BigDecimal.ZERO);
                dto.setTotalStock(0);
            } else {
                int totalStock = variants.stream().mapToInt(ProductVariant::getStockQuantity).sum();
                BigDecimal minPrice = variants.stream()
                        .map(ProductVariant::getPrice)
                        .min(BigDecimal::compareTo)
                        .orElse(BigDecimal.ZERO);
                BigDecimal maxPrice = variants.stream()
                        .map(ProductVariant::getPrice)
                        .max(BigDecimal::compareTo)
                        .orElse(BigDecimal.ZERO);
                dto.setTotalStock(totalStock);
                dto.setMinPrice(minPrice);
                dto.setMaxPrice(maxPrice);
            }

            return dto;
        }).collect(Collectors.toList());
    }
}
