package com.quadra.ecommerce_api.service.store_owner.request.product;

import com.quadra.ecommerce_api.dto.store_owner.request.product.update.*;
import com.quadra.ecommerce_api.entity.product.*;
import com.quadra.ecommerce_api.entity.store.ItemType;
import com.quadra.ecommerce_api.entity.store.Store;
import com.quadra.ecommerce_api.enums.product.AttributeType;
import com.quadra.ecommerce_api.mapper.store_owner.request.product.StoreOwnerProductUpdateMapper;
import com.quadra.ecommerce_api.repository.product.*;
import com.quadra.ecommerce_api.repository.store.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service("storeOwnerProductUpdateService")
public class ProductUpdateServiceReq {

    private static final Logger logger = LoggerFactory.getLogger(ProductUpdateServiceReq.class);

    private final ProductRepo productRepo;
    private final ProductVariantRepo productVariantRepo;
    private final ProductDetailRepo productDetailRepo;
    private final AddonGroupRepo addonGroupRepo;
    private final AddonRepo addonRepo;
    private final SpecificationValueRepo specificationValueRepo;
    private final ProductImageRepo productImageRepo;
    private final StoreRepo storeRepo;
    private final AttributeValueRepo attributeValueRepo;
    private final SpecificationRepo specificationRepo;
    private final StoreOwnerProductUpdateMapper productUpdateMapper;
    private final ItemTypeRepo itemTypeRepo;
    private final AttributeRepo attributeRepo;

    public ProductUpdateServiceReq(
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
            StoreOwnerProductUpdateMapper productUpdateMapper,
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
        this.productUpdateMapper = productUpdateMapper;
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
    public ProductUpdateDto updateProduct(Long productId, ProductUpdateDto dto) {
        int maxRetries = 3;
        int attempt = 0;

        while (attempt < maxRetries) {
            try {
                // Xác thực dữ liệu đầu vào
                if (productId == null || !productRepo.existsById(productId)) {
                    logger.error("Sản phẩm không tồn tại với ID: {}", productId);
                    throw new IllegalArgumentException("Sản phẩm không tồn tại");
                }
                if (!productId.equals(dto.getId())) {
                    logger.error("ID sản phẩm trong body ({}) không khớp với ID trong URL ({})", dto.getId(), productId);
                    throw new IllegalArgumentException("ID sản phẩm trong body không khớp với ID trong URL");
                }
                if (dto.getName() == null || dto.getName().isEmpty()) {
                    logger.error("Tên sản phẩm không được để trống");
                    throw new IllegalArgumentException("Tên sản phẩm không được để trống");
                }
                if (dto.getStoreId() == null || !storeRepo.existsById(dto.getStoreId())) {
                    logger.error("Cửa hàng không tồn tại với ID: {}", dto.getStoreId());
                    throw new IllegalArgumentException("Cửa hàng không tồn tại");
                }
                if (dto.getItemTypeId() == null || !itemTypeRepo.existsById(dto.getItemTypeId())) {
                    logger.error("Loại sản phẩm không tồn tại với ID: {}", dto.getItemTypeId());
                    throw new IllegalArgumentException("Loại sản phẩm không tồn tại");
                }
                if (dto.getDescription() != null && dto.getDescription().trim().isEmpty()) {
                    logger.error("Mô tả sản phẩm không được để trống");
                    throw new IllegalArgumentException("Mô tả sản phẩm không được để trống");
                }

                // Kiểm tra trùng lặp SKU trong DTO
                Set<String> skus = dto.getVariants().stream()
                        .map(ProductVariantUpdateDto::getSku)
                        .collect(Collectors.toSet());
                if (skus.size() < dto.getVariants().size()) {
                    logger.error("Tìm thấy SKU trùng lặp trong DTO: {}", dto.getVariants());
                    throw new IllegalArgumentException("Tìm thấy SKU trùng lặp trong DTO");
                }

                // Lấy sản phẩm hiện tại
                Product product = productRepo.findById(productId)
                        .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại"));
                logger.info("Found product: id={}, name={}", product.getId(), product.getName());

                // Cập nhật thông tin cơ bản của sản phẩm
                Product updatedProduct = productUpdateMapper.toProduct(dto);
                product.setName(updatedProduct.getName());
                product.setDescription(updatedProduct.getDescription());
                product.setThumbnailUrl(updatedProduct.getThumbnailUrl());
                product.setVideoUrl(updatedProduct.getVideoUrl());

                // Cập nhật slug nếu tên sản phẩm thay đổi
                String baseSlug = generateBaseSlug(dto.getName());
                String finalSlug = baseSlug + "-" + product.getId();
                product.setSlug(finalSlug);
                logger.info("Updated product slug: {}", finalSlug);

                // Cập nhật Store và ItemType
                Store store = storeRepo.findById(dto.getStoreId())
                        .orElseThrow(() -> new IllegalArgumentException("Cửa hàng không tồn tại"));
                product.setStore(store);

                ItemType itemType = itemTypeRepo.findById(dto.getItemTypeId())
                        .orElseThrow(() -> new IllegalArgumentException("Loại sản phẩm không tồn tại"));
                product.setItemType(itemType);

                // Lưu sản phẩm trước để đảm bảo trạng thái mới nhất
                product = productRepo.save(product);
                logger.info("Saved product: id={}, name={}", product.getId(), product.getName());

                // Xử lý ProductImage
                if (dto.getImages() != null) {
                    // Lấy danh sách hình ảnh hiện có
                    List<ProductImage> existingImages = productImageRepo.findByProductId(product.getId());
                    Set<Long> incomingImageIds = dto.getImages().stream()
                            .filter(i -> i.getId() != null)
                            .map(ProductImageUpdateDto::getId)
                            .collect(Collectors.toSet());

                    // Xóa các hình ảnh không còn trong DTO
                    List<ProductImage> imagesToRemove = existingImages.stream()
                            .filter(i -> !incomingImageIds.contains(i.getId()))
                            .collect(Collectors.toList());
                    if (!imagesToRemove.isEmpty()) {
                        logger.info("Deleting {} product images for product_id={}", imagesToRemove.size(), product.getId());
                        productImageRepo.deleteAll(imagesToRemove);
                        productImageRepo.flush();
                    }

                    // Cập nhật hoặc tạo mới hình ảnh
                    for (ProductImageUpdateDto imageDto : dto.getImages()) {
                        if (imageDto.getImageUrl() == null || imageDto.getImageUrl().isEmpty()) {
                            logger.error("URL hình ảnh không được để trống");
                            throw new IllegalArgumentException("URL hình ảnh không được để trống");
                        }

                        ProductImage image;
                        if (imageDto.getId() != null && productImageRepo.existsById(imageDto.getId())) {
                            // Cập nhật hình ảnh hiện có
                            image = productImageRepo.findById(imageDto.getId())
                                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ProductImage với ID: " + imageDto.getId()));
                            image.setImageUrl(imageDto.getImageUrl());
                            logger.info("Updating product image: id={}, url={}", image.getId(), imageDto.getImageUrl());
                        } else {
                            // Tạo hình ảnh mới
                            image = productUpdateMapper.toProductImage(imageDto);
                            image.setProduct(product);
                            logger.info("Creating new product image: url={}", imageDto.getImageUrl());
                        }
                        productImageRepo.save(image);
                        logger.info("Saved product image: id={}, url={}", image.getId(), image.getImageUrl());
                    }
                } else {
                    // Xóa tất cả hình ảnh nếu DTO không có images
                    productImageRepo.deleteByProductId(product.getId());
                    productImageRepo.flush();
                    logger.info("Deleted all product images for product_id: {}", product.getId());
                }

                // Xử lý biến thể
                if (dto.getVariants() != null && !dto.getVariants().isEmpty()) {
                    // Lấy danh sách biến thể hiện có
                    List<ProductVariant> existingVariants = productVariantRepo.findByProductId(product.getId());
                    Set<Long> incomingVariantIds = dto.getVariants().stream()
                            .filter(v -> v.getId() != null)
                            .map(ProductVariantUpdateDto::getId)
                            .collect(Collectors.toSet());

                    // Xóa các biến thể không còn trong DTO
                    existingVariants.stream()
                            .filter(v -> !incomingVariantIds.contains(v.getId()))
                            .forEach(v -> {
                                logger.info("Deleting variant: id={}, sku={}", v.getId(), v.getSku());
                                productVariantRepo.delete(v);
                            });

                    // Cập nhật hoặc tạo mới biến thể
                    for (int i = 0; i < dto.getVariants().size(); i++) {
                        ProductVariantUpdateDto variantDto = dto.getVariants().get(i);
                        ProductVariant variant;
                        if (variantDto.getId() != null && productVariantRepo.existsById(variantDto.getId())) {
                            // Cập nhật biến thể hiện có
                            variant = productVariantRepo.findById(variantDto.getId()).get();
                            variant.setPrice(variantDto.getPrice());
                            variant.setStockQuantity(variantDto.getStockQuantity());
                            variant.setActive(variantDto.getIsActive());
                            variant.setImageUrl(variantDto.getImageUrl());
                            logger.info("Updating variant: id={}, sku={}", variant.getId(), variantDto.getSku());
                        } else {
                            // Tạo biến thể mới
                            variant = productUpdateMapper.toProductVariant(variantDto);
                            logger.info("Creating new variant: sku={}", variantDto.getSku());
                        }
                        variant.setProduct(product);
                        String sku = "P" + product.getId() + "-V" + (i + 1);

                        // Kiểm tra SKU trùng lặp
                        if (productVariantRepo.existsBySkuAndIdNot(sku, variant.getId() != null ? variant.getId() : 0L)) {
                            logger.error("SKU {} đã tồn tại cho biến thể khác", sku);
                            throw new IllegalArgumentException("SKU " + sku + " đã tồn tại");
                        }
                        variant.setSku(sku);
                        variant = productVariantRepo.save(variant);
                        logger.info("Saved ProductVariant: id={}, sku={}", variant.getId(), variant.getSku());

                        // Xử lý ProductDetail (attribute và attribute_value)
                        if (variantDto.getProductDetails() != null) {
                            // Xóa các ProductDetail cũ của biến thể
                            productDetailRepo.deleteByVariantId(variant.getId());
                            productDetailRepo.flush();
                            logger.info("Deleted ProductDetails for variant_id: {}", variant.getId());

                            // Kiểm tra trùng lặp attributeName:value trong cùng variant
                            Set<String> attributeValuePairs = new HashSet<>();
                            for (ProductDetailUpdateDto detailDto : variantDto.getProductDetails()) {
                                AttributeValueUpdateDto attrValueDto = detailDto.getAttributeValue();
                                if (attrValueDto == null || attrValueDto.getAttributeName() == null || attrValueDto.getAttributeName().isEmpty()) {
                                    logger.error("Tên thuộc tính không được để trống cho variant_id: {}", variant.getId());
                                    throw new IllegalArgumentException("Tên thuộc tính không được để trống");
                                }
                                if (attrValueDto.getValue() == null || attrValueDto.getValue().isEmpty()) {
                                    logger.error("Giá trị thuộc tính không được để trống cho variant_id: {}", variant.getId());
                                    throw new IllegalArgumentException("Giá trị thuộc tính không được để trống");
                                }

                                String key = standardizeName(attrValueDto.getAttributeName()) + ":" + standardizeName(attrValueDto.getValue());
                                if (!attributeValuePairs.add(key)) {
                                    logger.error("Thuộc tính trùng lặp trong biến thể {}: {}", variant.getSku(), key);
                                    throw new IllegalArgumentException("Thuộc tính trùng lặp trong biến thể " + variant.getSku() + ": " + key);
                                }

                                String standardizedAttrName = standardizeName(attrValueDto.getAttributeName());
                                String standardizedValue = standardizeName(attrValueDto.getValue());

                                // Tìm hoặc tạo Attribute
                                Attribute attribute = attributeRepo.findByNameIgnoreCase(standardizedAttrName)
                                        .orElseGet(() -> {
                                            Attribute newAttr = new Attribute();
                                            newAttr.setName(standardizedAttrName);
                                            newAttr.setTypesValue(AttributeType.ALL); // Giả định giá trị mặc định
                                            Attribute savedAttr = attributeRepo.save(newAttr);
                                            logger.info("Saved Attribute: id={}, name={}", savedAttr.getId(), savedAttr.getName());
                                            return savedAttr;
                                        });

                                // Tìm hoặc tạo AttributeValue
                                AttributeValue attributeValue = attributeValueRepo.findByAttributeAndValueIgnoreCase(attribute, standardizedValue)
                                        .orElseGet(() -> {
                                            AttributeValue newAttrValue = new AttributeValue();
                                            newAttrValue.setAttribute(attribute);
                                            newAttrValue.setValue(standardizedValue);
                                            AttributeValue savedAttrValue = attributeValueRepo.save(newAttrValue);
                                            logger.info("Saved AttributeValue: id={}, value={}", savedAttrValue.getId(), savedAttrValue.getValue());
                                            return savedAttrValue;
                                        });

                                // Tạo ProductDetail
                                ProductDetail detail = productUpdateMapper.toProductDetail(detailDto);
                                detail.setVariant(variant);
                                detail.setAttributeValue(attributeValue);
                                logger.info("Saving ProductDetail: variant_id={}, value_id={}", variant.getId(), attributeValue.getId());
                                productDetailRepo.save(detail);
                            }
                        }
                    }
                } else {
                    // Xóa tất cả biến thể hiện có
                    productVariantRepo.deleteByProductId(product.getId());
                    productVariantRepo.flush();
                    logger.info("Deleted all variants for product_id: {}", product.getId());

                    // Tạo biến thể mặc định
                    String defaultSku = "P" + product.getId() + "-DEFAULT";
                    if (productVariantRepo.existsBySkuAndIdNot(defaultSku, 0L)) {
                        logger.error("SKU mặc định {} đã tồn tại", defaultSku);
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
                    logger.info("Created default variant: sku={}", defaultSku);
                }

                // Xử lý AddonGroup và Addon
                if (dto.getAddonGroups() != null) {
                    List<AddonGroup> existingGroups = addonGroupRepo.findByProductId(product.getId());
                    Set<Long> incomingGroupIds = dto.getAddonGroups().stream()
                            .filter(g -> g.getId() != null)
                            .map(AddonGroupUpdateDto::getId)
                            .collect(Collectors.toSet());

                    existingGroups.stream()
                            .filter(g -> !incomingGroupIds.contains(g.getId()))
                            .forEach(group -> {
                                logger.info("Deleting addon group: id={}", group.getId());
                                addonRepo.deleteByAddonGroupId(group.getId());
                                addonGroupRepo.delete(group);
                            });

                    for (AddonGroupUpdateDto groupDto : dto.getAddonGroups()) {
                        if (groupDto.getName() == null || groupDto.getName().isEmpty()) {
                            logger.error("Tên nhóm tùy chọn không được để trống");
                            throw new IllegalArgumentException("Tên nhóm tùy chọn không được để trống");
                        }
                        if (groupDto.getMaxChoice() <= 0) {
                            logger.error("Số lượng lựa chọn tối đa phải lớn hơn 0");
                            throw new IllegalArgumentException("Số lượng lựa chọn tối đa phải lớn hơn 0");
                        }

                        AddonGroup addonGroup;
                        if (groupDto.getId() != null && addonGroupRepo.existsById(groupDto.getId())) {
                            addonGroup = addonGroupRepo.findById(groupDto.getId()).get();
                            addonGroup.setName(groupDto.getName());
                            addonGroup.setMaxChoice(groupDto.getMaxChoice());
                            logger.info("Updating addon group: id={}, name={}", addonGroup.getId(), addonGroup.getName());
                        } else {
                            addonGroup = productUpdateMapper.toAddonGroup(groupDto);
                            logger.info("Creating new addon group: name={}", groupDto.getName());
                        }
                        addonGroup.setProduct(product);
                        addonGroup = addonGroupRepo.save(addonGroup);

                        if (groupDto.getAddons() != null) {
                            List<Addon> existingAddons = addonRepo.findByAddonGroupId(addonGroup.getId());
                            Set<Long> incomingAddonIds = groupDto.getAddons().stream()
                                    .filter(a -> a.getId() != null)
                                    .map(AddonUpdateDto::getId)
                                    .collect(Collectors.toSet());

                            existingAddons.stream()
                                    .filter(a -> !incomingAddonIds.contains(a.getId()))
                                    .forEach(a -> {
                                        logger.info("Deleting addon: id={}", a.getId());
                                        addonRepo.delete(a);
                                    });

                            for (AddonUpdateDto addonDto : groupDto.getAddons()) {
                                if (addonDto.getName() == null || addonDto.getName().isEmpty()) {
                                    logger.error("Tên tùy chọn bổ sung không được để trống");
                                    throw new IllegalArgumentException("Tên tùy chọn bổ sung không được để trống");
                                }
                                if (addonDto.getPriceAdjust() == null || addonDto.getPriceAdjust().compareTo(BigDecimal.ZERO) < 0) {
                                    logger.error("Giá điều chỉnh của tùy chọn bổ sung không được âm");
                                    throw new IllegalArgumentException("Giá điều chỉnh của tùy chọn bổ sung không được âm");
                                }

                                Addon addon;
                                if (addonDto.getId() != null && addonRepo.existsById(addonDto.getId())) {
                                    addon = addonRepo.findById(addonDto.getId()).get();
                                    addon.setName(addonDto.getName());
                                    addon.setPriceAdjust(addonDto.getPriceAdjust());
                                    addon.setActive(addonDto.getActive());
                                    logger.info("Updating addon: id={}, name={}", addon.getId(), addon.getName());
                                } else {
                                    addon = productUpdateMapper.toAddon(addonDto);
                                    logger.info("Creating new addon: name={}", addonDto.getName());
                                }
                                addon.setAddonGroup(addonGroup);
                                addonRepo.save(addon);
                            }
                        }
                    }
                } else {
                    List<AddonGroup> existingGroups = addonGroupRepo.findByProductId(product.getId());
                    existingGroups.forEach(group -> {
                        logger.info("Deleting addon group: id={}", group.getId());
                        addonRepo.deleteByAddonGroupId(group.getId());
                        addonGroupRepo.delete(group);
                    });
                }

                // Xử lý SpecificationValue
                if (dto.getSpecifications() != null) {
                    List<SpecificationValue> existingSpecs = specificationValueRepo.findByProductId(product.getId());
                    Set<Long> incomingSpecIds = dto.getSpecifications().stream()
                            .filter(s -> s.getId() != null)
                            .map(SpecificationValueUpdateDto::getId)
                            .collect(Collectors.toSet());

                    existingSpecs.stream()
                            .filter(s -> !incomingSpecIds.contains(s.getId()))
                            .forEach(s -> {
                                logger.info("Deleting specification value: id={}", s.getId());
                                specificationValueRepo.delete(s);
                            });

                    for (SpecificationValueUpdateDto specDto : dto.getSpecifications()) {
                        if (specDto.getSpecificationName() == null || specDto.getSpecificationName().isEmpty()) {
                            logger.error("Tên thông số không được để trống");
                            throw new IllegalArgumentException("Tên thông số không được để trống");
                        }

                        SpecificationValue specValue;
                        Specification specification;
                        if (specDto.getId() != null && specificationValueRepo.existsById(specDto.getId())) {
                            specValue = specificationValueRepo.findById(specDto.getId()).get();
                            specValue.setValue(specDto.getValue());
                            specification = specValue.getSpecification();
                            if (!specDto.getSpecificationName().equalsIgnoreCase(specification.getName())) {
                                specification = new Specification();
                                specification.setName(specDto.getSpecificationName());
                                specification = specificationRepo.save(specification);
                                logger.info("Created new specification: name={}", specification.getName());
                            }
                        } else {
                            specValue = productUpdateMapper.toSpecificationValue(specDto);
                            specification = new Specification();
                            specification.setName(specDto.getSpecificationName());
                            specification = specificationRepo.save(specification);
                            logger.info("Created new specification: name={}", specification.getName());
                        }
                        specValue.setProduct(product);
                        specValue.setSpecification(specification);
                        specificationValueRepo.save(specValue);
                        logger.info("Saved specification value: id={}, name={}", specValue.getId(), specDto.getSpecificationName());
                    }
                } else {
                    specificationValueRepo.deleteByProductId(product.getId());
                    specificationValueRepo.flush();
                    logger.info("Deleted all specification values for product_id: {}", product.getId());
                }

                // Trả về DTO
                ProductUpdateDto result = productUpdateMapper.toProductDTO(product);
                logger.info("Product updated successfully: id={}", product.getId());
                return result;
            } catch (ObjectOptimisticLockingFailureException e) {
                attempt++;
                logger.warn("Optimistic locking failure on attempt {} for product_id={}", attempt, productId);
                if (attempt >= maxRetries) {
                    logger.error("Không thể cập nhật sản phẩm sau {} lần thử do xung đột dữ liệu", maxRetries);
                    throw new RuntimeException("Không thể cập nhật sản phẩm do xung đột dữ liệu. Vui lòng thử lại.", e);
                }
                try {
                    Thread.sleep(100); // Đợi trước khi thử lại
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }
        throw new RuntimeException("Không thể cập nhật sản phẩm do lỗi không xác định.");
    }
}