package com.quadra.ecommerce_api.service.store_owner.request.product;


import com.cloudinary.Cloudinary;
import com.quadra.ecommerce_api.dto.store_owner.request.product.*;
import com.quadra.ecommerce_api.entity.product.*;
import com.quadra.ecommerce_api.entity.store.ItemType;
import com.quadra.ecommerce_api.entity.store.Store;
import com.quadra.ecommerce_api.enums.product.AttributeType;
import com.quadra.ecommerce_api.mapper.store_owner.request.product.StoreOwnerProductMapper;
import com.quadra.ecommerce_api.repository.product.*;
import com.quadra.ecommerce_api.repository.store.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.UUID;
import java.util.regex.Pattern;

@Service("storeOwnerProductService")
public class ProductServiceReq {

    protected final ProductRepo productRepo;
    protected final ProductVariantRepo productVariantRepo;
    protected final ProductDetailRepo productDetailRepo;
    protected final AddonGroupRepo addonGroupRepo;
    protected final AddonRepo addonRepo;
    protected final SpecificationValueRepo specificationValueRepo;
    protected final ProductImageRepo productImageRepo;
    protected final StoreRepo storeRepo;
    protected final AttributeValueRepo attributeValueRepo;
    protected final SpecificationRepo specificationRepo;
    protected final StoreOwnerProductMapper productMapper;
    protected final Cloudinary cloudinary;
    protected final ItemTypeRepo itemTypeRepo;
    private final AttributeRepo attributeRepo;

    public ProductServiceReq(
            ProductRepo productRepo,
            ProductVariantRepo productVariantRepo,
            ProductDetailRepo productDetailRepo,
            AddonGroupRepo addonGroupRepo,
            AddonRepo addonRepo,
            SpecificationValueRepo specificationValueRepo,
            ProductImageRepo productImageRepo,
            StoreRepo storeRepo,
            AttributeValueRepo attributeValueRepo,
            SpecificationRepo specificationRepo,
            StoreOwnerProductMapper productMapper,
            Cloudinary cloudinary,
            ItemTypeRepo itemTypeRepo,
            AttributeRepo attributeRepo) {
        this.productRepo = productRepo;
        this.productVariantRepo = productVariantRepo;
        this.productDetailRepo = productDetailRepo;
        this.addonGroupRepo = addonGroupRepo;
        this.addonRepo = addonRepo;
        this.specificationValueRepo = specificationValueRepo;
        this.productImageRepo = productImageRepo;
        this.storeRepo = storeRepo;
        this.attributeValueRepo = attributeValueRepo;
        this.specificationRepo = specificationRepo;
        this.productMapper = productMapper;
        this.cloudinary = cloudinary;
        this.itemTypeRepo = itemTypeRepo;
        this.attributeRepo = attributeRepo;
    }

    private String generateBaseSlug(String name) {
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String withoutDiacritics = pattern.matcher(normalized).replaceAll("");
        return withoutDiacritics.replaceAll("\\s+", "-").toLowerCase();
    }
    private String standardizeName(String name) {
        if (name == null || name.isEmpty()) {
            return name;
        }
        String[] words = name.toLowerCase().split("\\s+");
        StringBuilder standardized = new StringBuilder();
        for (String word : words) {
            if (!word.isEmpty()) {
                standardized.append(Character.toUpperCase(word.charAt(0)))
                        .append(word.substring(1))
                        .append(" ");
            }
        }
        return standardized.toString().trim();
    }


    @Transactional
    public ProductCreateDto createProduct(ProductCreateDto dto) {
        // Xác thực dữ liệu đầu vào
        if (dto.getName() == null || dto.getName().isEmpty()) {
            throw new IllegalArgumentException("Tên sản phẩm không được để trống");
        }
        if (dto.getStoreId() == null || !storeRepo.existsById(dto.getStoreId())) {
            throw new IllegalArgumentException("Cửa hàng không tồn tại");
        }
        if (dto.getItemTypeId() == null || !itemTypeRepo.existsById(dto.getItemTypeId())) {
            throw new IllegalArgumentException("Loại sản phẩm không tồn tại");
        }

        // Tạo Product với slug tạm thời
        Product product = productMapper.toProduct(dto);
        String tempSlug = "temp-" + UUID.randomUUID().toString();
        product.setSlug(tempSlug);

        Store store = storeRepo.findById(dto.getStoreId())
                .orElseThrow(() -> new IllegalArgumentException("Cửa hàng không tồn tại"));
        product.setStore(store);

        ItemType itemType = itemTypeRepo.findById(dto.getItemTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Loại sản phẩm không tồn tại"));
        product.setItemType(itemType);

        product.setThumbnailUrl(dto.getThumbnailUrl());
        product.setVideoUrl(dto.getVideoUrl());

        // Lưu Product lần đầu để lấy ID
        product = productRepo.save(product);

        // Tạo slug cuối cùng với ID
        String baseSlug = generateBaseSlug(dto.getName());
        String finalSlug = baseSlug + "-" + product.getId();
        product.setSlug(finalSlug);
        product = productRepo.save(product);

        // Xử lý biến thể
        if (dto.getVariants() != null && !dto.getVariants().isEmpty()) {
            for (int i = 0; i < dto.getVariants().size(); i++) {
                ProductVariantCreateDto variantDto = dto.getVariants().get(i);
                ProductVariant variant = productMapper.toProductVariant(variantDto);
                variant.setProduct(product);
                String sku = "P" + product.getId() + "-V" + (i + 1);
                if (productVariantRepo.existsBySku(sku)) {
                    throw new IllegalArgumentException("SKU " + sku + " đã tồn tại");
                }
                variant.setSku(sku);
                variant = productVariantRepo.save(variant);

                // Xử lý ProductDetail
                if (variantDto.getProductDetails() != null) {
                    for (ProductDetailCreateDto detailDto : variantDto.getProductDetails()) {
                        AttributeValueCreateDto attrValueDto = detailDto.getAttributeValue();
                        if (attrValueDto == null || attrValueDto.getAttributeName() == null || attrValueDto.getAttributeName().isEmpty()) {
                            throw new IllegalArgumentException("Tên thuộc tính không được để trống");
                        }
                        if (attrValueDto.getValue() == null || attrValueDto.getValue().isEmpty()) {
                            throw new IllegalArgumentException("Giá trị thuộc tính không được để trống");
                        }

                        String standardizedAttrName = standardizeName(attrValueDto.getAttributeName());
                        String standardizedValue = standardizeName(attrValueDto.getValue());

                        // Tìm hoặc tạo Attribute
                        Attribute attribute = attributeRepo.findByNameIgnoreCase(standardizedAttrName)
                                .orElseGet(() -> {
                                    Attribute newAttr = new Attribute();
                                    newAttr.setName(standardizedAttrName);
                                    newAttr.setTypesValue(attrValueDto.getTypesValue() != null ? attrValueDto.getTypesValue() : AttributeType.ALL);
                                    return attributeRepo.save(newAttr);
                                });

                        // Tìm hoặc tạo AttributeValue
                        AttributeValue attributeValue = attributeValueRepo.findByAttributeAndValueIgnoreCase(attribute, standardizedValue)
                                .orElseGet(() -> {
                                    AttributeValue newAttrValue = new AttributeValue();
                                    newAttrValue.setAttribute(attribute);
                                    newAttrValue.setValue(standardizedValue);
                                    return attributeValueRepo.save(newAttrValue);
                                });

                        // Tạo ProductDetail
                        ProductDetail detail = productMapper.toProductDetail(detailDto);
                        detail.setVariant(variant);
                        detail.setAttributeValue(attributeValue);
                        productDetailRepo.save(detail);
                    }
                }
            }
        } else {
            // Tạo biến thể mặc định
            String defaultSku = "P" + product.getId() + "-DEFAULT";
            if (productVariantRepo.existsBySku(defaultSku)) {
                throw new IllegalArgumentException("SKU mặc định " + defaultSku + " đã tồn tại");
            }
            ProductVariant defaultVariant = ProductVariant.builder()
                    .sku(defaultSku)
                    .price(BigDecimal.ZERO)
                    .stockQuantity(0)
                    .isActive(true)
                    .product(product)
                    .build();
            productVariantRepo.save(defaultVariant);
        }

        // Xử lý AddonGroup và Addon
        if (dto.getAddonGroups() != null) {
            for (AddonGroupCreateDto groupDto : dto.getAddonGroups()) {
                // Kiểm tra dữ liệu nhóm tùy chọn
                if (groupDto.getName() == null || groupDto.getName().isEmpty()) {
                    throw new IllegalArgumentException("Tên nhóm tùy chọn không được để trống");
                }
                if (groupDto.getMaxChoice() <= 0) {
                    throw new IllegalArgumentException("Số lượng lựa chọn tối đa phải lớn hơn 0");
                }

                AddonGroup addonGroup = productMapper.toAddonGroup(groupDto);
                addonGroup.setProduct(product);
                addonGroup = addonGroupRepo.save(addonGroup);

                if (groupDto.getAddons() != null) {
                    for (AddonCreateDto addonDto : groupDto.getAddons()) {
                        // Kiểm tra dữ liệu tùy chọn bổ sung
                        if (addonDto.getName() == null || addonDto.getName().isEmpty()) {
                            throw new IllegalArgumentException("Tên tùy chọn bổ sung không được để trống");
                        }
                        if (addonDto.getPriceAdjust() == null || addonDto.getPriceAdjust().compareTo(BigDecimal.ZERO) < 0) {
                            throw new IllegalArgumentException("Giá điều chỉnh của tùy chọn bổ sung không được âm");
                        }
                        Addon addon = productMapper.toAddon(addonDto);
                        addon.setAddonGroup(addonGroup);
                        addonRepo.save(addon);
                    }
                }
            }
        }

        // Xử lý SpecificationValue
        if (dto.getSpecifications() != null) {
            for (SpecificationValueCreateDto specDto : dto.getSpecifications()) {
                // Tạo mới Specification
                Specification specification = new Specification();
                specification.setName(specDto.getSpecificationName());
                specification = specificationRepo.save(specification);

                // Tạo SpecificationValue
                SpecificationValue specValue = productMapper.toSpecificationValue(specDto);
                specValue.setProduct(product);
                specValue.setSpecification(specification);
                specificationValueRepo.save(specValue);
            }
        }

        // Xử lý ProductImage (loại trừ thumbnailUrl)
        if (dto.getImages() != null) {
            for (ProductImageCreateDto imageDto : dto.getImages()) {
                // Bỏ qua nếu imageUrl trùng với thumbnailUrl
                if (imageDto.getImageUrl() != null && !imageDto.getImageUrl().equals(dto.getThumbnailUrl())) {
                    ProductImage image = productMapper.toProductImage(imageDto);
                    image.setProduct(product);
                    productImageRepo.save(image);
                }
            }
        }
        return productMapper.toProductCreateDto(product);
    }

    /**
     * Lấy Store ID của sản phẩm
     */
    public Long getStoreIdByProductId(Long productId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại"));
        return product.getStore().getId();
    }

    /**
     * Vô hiệu hóa sản phẩm (chuyển isActive = false)
     */
    @Transactional
    public void deactivateProduct(Long productId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại"));

        if (!product.isActive()) {
            throw new IllegalArgumentException("Sản phẩm đã được vô hiệu hóa trước đó");
        }

        product.setActive(false);
        productRepo.save(product);
    }

    /**
     * Kích hoạt sản phẩm (chuyển isActive = true)
     */
    @Transactional
    public void activateProduct(Long productId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại"));

        if (product.isActive()) {
            throw new IllegalArgumentException("Sản phẩm đã được kích hoạt trước đó");
        }

        product.setActive(true);
        productRepo.save(product);
    }
}
