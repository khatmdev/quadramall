package com.quadra.ecommerce_api.service.flashsale;

import com.quadra.ecommerce_api.common.AddressCommon;
import com.quadra.ecommerce_api.common.PriceCommon;
import com.quadra.ecommerce_api.dto.base.flashsale.*;
import com.quadra.ecommerce_api.dto.custom.store.response.SellerInfoDTO;
import com.quadra.ecommerce_api.entity.discount.FlashSale;
import com.quadra.ecommerce_api.entity.product.Product;
import com.quadra.ecommerce_api.entity.store.Store;
import com.quadra.ecommerce_api.repository.flashsale.FlashSaleRepo;
import com.quadra.ecommerce_api.repository.product.ProductRepo;
import com.quadra.ecommerce_api.repository.product.ProductVariantRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlashSaleService {
    private final FlashSaleRepo flashSaleRepository;
    private final ProductVariantRepo productVariantRepository;
    private final ProductRepo productRepository;

    public Page<BuyerFlashSaleProductDTO> getFlashSaleProductsForHome(Pageable pageable) {
        Page<FlashSale> flashSales = flashSaleRepository.findActiveFlashSales(pageable);
        return flashSales.map(this::mapToBuyerDTO); // Sử dụng map để giữ totalElements
    }

    private BuyerFlashSaleProductDTO mapToBuyerDTO(FlashSale flashSale) {
        Product product = flashSale.getProduct();
        Store store = product.getStore();
        SellerInfoDTO sellerInfoDTO = new SellerInfoDTO();
        sellerInfoDTO.setId(store.getId());
        sellerInfoDTO.setName(store.getName());
        sellerInfoDTO.setSlug(store.getSlug());
        sellerInfoDTO.setProvince(AddressCommon.extractProvince(store.getAddress()));

        BigDecimal originPrice = productVariantRepository.findMinPriceByProductId(product.getId()).orElse(BigDecimal.ZERO);  // Future
        BigDecimal price = PriceCommon.calculateDiscountedPrice(originPrice, flashSale.getPercentageDiscount());

        BuyerFlashSaleProductDTO dto = new BuyerFlashSaleProductDTO();
        dto.setId(flashSale.getId());
        dto.setName(product.getName());
        dto.setSlug(product.getSlug());
        dto.setThumbnailUrl(product.getThumbnailUrl());
        dto.setOriginPrice(originPrice);
        dto.setPrice(price);
        dto.setPercentageDiscount(flashSale.getPercentageDiscount());
        dto.setQuantity(flashSale.getQuantity());
        dto.setSoldCount(flashSale.getSoldCount());
        dto.setSeller(sellerInfoDTO);
        dto.setEndTimeStr(flashSale.getEndTime().toString()); // Hoặc format nếu cần: flashSale.getEndTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        return dto;
    }

    public List<SellerFlashSaleProductDTO> getFlashSaleProductsForSeller(Long storeId, Pageable pageable) {
        Page<FlashSale> flashSales = flashSaleRepository.findByProductStoreId(storeId, pageable);

        return flashSales.getContent().stream().map(this::mapToSellerDTO).collect(Collectors.toList());
    }

    @Transactional
    public SellerFlashSaleProductDTO createFlashSale(CreateFlashSaleDTO dto) {
        Product product = productRepository.findByIdAndIsActiveTrue(dto.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product in FS not found"));

        this.validateFlashSaleInput(dto, product, true);

        // Check if there's an active flash sale for this product
        Optional<FlashSale> existing = flashSaleRepository.findActiveByProduct_Id(product.getId());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("An active flash sale already exists for this product");
        }

        FlashSale flashSale = FlashSale.builder()
                .product(product)
                .percentageDiscount(dto.getPercentageDiscount())
                .quantity(dto.getQuantity())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .build();

        return this.mapToSellerDTO(flashSaleRepository.save(flashSale));
    }

    @Transactional
    public SellerFlashSaleProductDTO updateFlashSale(Long fsId, Long storeId, UpdateFlashSaleDTO dto) {
        FlashSale flashSale = flashSaleRepository.findByIdAndProductStoreId(fsId, storeId)
                .orElseThrow(() -> new IllegalArgumentException("Flash sale not found or you do not own it"));

        Product product = flashSale.getProduct();

        this.validateFlashSaleInput(dto, product, false);

        flashSale.setPercentageDiscount(dto.getPercentageDiscount());
        flashSale.setQuantity(dto.getQuantity());
        flashSale.setStartTime(dto.getStartTime());
        flashSale.setEndTime(dto.getEndTime());

        return mapToSellerDTO(flashSaleRepository.save(flashSale));
    }

    private void validateFlashSaleInput(FlashSaleInput dto, Product product, boolean isCreate) {
        LocalDateTime now = LocalDateTime.now();

        if (dto.getStartTime() != null && dto.getEndTime() != null &&
                !dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new IllegalArgumentException("Thời gian kết thúc phải sau thời gian bắt đầu");
        }

        if (dto.getPercentageDiscount() != null &&
                (dto.getPercentageDiscount() <= 0 || dto.getPercentageDiscount() > 100)) {
            throw new IllegalArgumentException("Phần trăm giản giá phải lớn hơn 0 và nhỏ hơn 100");
        }

        if (dto.getQuantity() != null && dto.getQuantity() <= 0) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
        }

        Integer totalStock = productVariantRepository.getTotalStockByProductId(product.getId());

        if (dto.getQuantity() != null && dto.getQuantity() > totalStock) {
            throw new IllegalArgumentException("Số lượng Flash Sale vượt quá tồn kho");
        }

        if (dto.getStartTime() != null && dto.getStartTime().isBefore(now)) {
            throw new IllegalArgumentException("Thời gian bắt đầu phải là hiện tại hoặc tương lai");
        }

        if (dto.getEndTime() != null && dto.getEndTime().isBefore(now)) {
            throw new IllegalArgumentException("Thời gian kết thúc phải trong tương lai");
        }

        if (isCreate && (dto.getStartTime() == null || dto.getEndTime() == null ||
                dto.getPercentageDiscount() == null || dto.getQuantity() == null)) {
            throw new IllegalArgumentException("Thiếu thông tin bắt buộc cho Flash Sale");
        }
    }


    private SellerFlashSaleProductDTO mapToSellerDTO(FlashSale fs) {
        Product product = fs.getProduct();
        BigDecimal minPrice = productVariantRepository.findMinPriceByProductId(product.getId()).orElse(BigDecimal.ZERO);  // Future
        BigDecimal maxPrice = productVariantRepository.findMaxPriceByProductId(product.getId()).orElse(BigDecimal.ZERO);  // Future
        Integer totalStock = productVariantRepository.getTotalStockByProductId(product.getId());
        SellerFlashSaleProductDTO dto = new SellerFlashSaleProductDTO();
        dto.setId(fs.getId());
        dto.setProductId(product.getId());
        dto.setProductName(product.getName());
        dto.setMinPrice(minPrice);
        dto.setMaxPrice(maxPrice);
        dto.setPercentageDiscount(fs.getPercentageDiscount());
        dto.setSoldCount(fs.getSoldCount());
        dto.setStock(totalStock);
        dto.setQuantity(fs.getQuantity());
        dto.setStartTime(fs.getStartTime());
        dto.setEndTime(fs.getEndTime());
        return dto;
    }

    @Transactional
    public void deleteFlashSale(Long fsId, Long storeId) {
        FlashSale flashSale = flashSaleRepository.findByIdAndProductStoreId(fsId, storeId)
                .orElseThrow(() -> new IllegalArgumentException("Flash sale not found or you do not own it"));
        flashSaleRepository.delete(flashSale);
    }

    public Optional<FlashSale> getActiveFlashSaleForProduct(Long productId) {
        return flashSaleRepository.findActiveByProduct_Id(productId);
    }

    public Page<ProductSellerDTO> getProductsForStore(Long storeId, String searchQuery, Pageable pageable) {
        Page<Product> products = productRepository.findByStoreIdAndSearchQuery(storeId, searchQuery, pageable);
        return products.map(p -> {
            Integer totalStock = productVariantRepository.getTotalStockByProductId(p.getId());
            BigDecimal minPrice = productVariantRepository.findMinPriceByProductId(p.getId()).orElse(BigDecimal.ZERO);
            BigDecimal maxPrice = productVariantRepository.findMaxPriceByProductId(p.getId()).orElse(BigDecimal.ZERO);

            ProductSellerDTO dto = new ProductSellerDTO();
            dto.setId(p.getId());
            dto.setName(p.getName());
            dto.setStock(totalStock);
            dto.setMinPrice(minPrice);
            dto.setMaxPrice(maxPrice);

            return dto;
        });
    }
}
