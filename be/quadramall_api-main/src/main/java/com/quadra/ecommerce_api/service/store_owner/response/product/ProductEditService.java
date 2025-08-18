package com.quadra.ecommerce_api.service.store_owner.response.product;

import com.quadra.ecommerce_api.dto.store_owner.response.product.ProductEditDto;
import com.quadra.ecommerce_api.entity.product.*;
import com.quadra.ecommerce_api.repository.product.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductEditService {

    private final ProductRepo productRepo;
    private final ProductVariantRepo productVariantRepo;
    private final ProductDetailRepo productDetailRepo;
    private final AddonGroupRepo addonGroupRepo;
    private final AddonRepo addonRepo;
    private final SpecificationValueRepo specificationValueRepo;
    private final ProductImageRepo productImageRepo;

    public ProductEditService(
            ProductRepo productRepo,
            ProductVariantRepo productVariantRepo,
            ProductDetailRepo productDetailRepo,
            AddonGroupRepo addonGroupRepo,
            AddonRepo addonRepo,
            SpecificationValueRepo specificationValueRepo,
            ProductImageRepo productImageRepo) {
        this.productRepo = productRepo;
        this.productVariantRepo = productVariantRepo;
        this.productDetailRepo = productDetailRepo;
        this.addonGroupRepo = addonGroupRepo;
        this.addonRepo = addonRepo;
        this.specificationValueRepo = specificationValueRepo;
        this.productImageRepo = productImageRepo;
    }


    @Transactional
    public ProductEditDto getProductForEdit(Long productId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại"));

        ProductEditDto dto = new ProductEditDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setSlug(product.getSlug());
        dto.setStoreId(product.getStore().getId());
        dto.setThumbnailUrl(product.getThumbnailUrl());
        dto.setVideoUrl(product.getVideoUrl());
        dto.setItemTypeId(product.getItemType().getId());
        dto.setItemTypeName(product.getItemType().getName());
        dto.setIsActive(product.isActive());

        // Ánh xạ biến thể
        List<ProductVariant> variants = productVariantRepo.findByProductId(productId);
        List<ProductEditDto.VariantEditDto> variantDtos = variants.stream().map(variant -> {
            ProductEditDto.VariantEditDto variantDto = new ProductEditDto.VariantEditDto();
            variantDto.setId(variant.getId());
            variantDto.setSku(variant.getSku());
            variantDto.setPrice(variant.getPrice());
            variantDto.setStockQuantity(variant.getStockQuantity());
            variantDto.setIsActive(variant.isActive());
            variantDto.setImageUrl(variant.getImageUrl());

            // Ánh xạ chi tiết sản phẩm
            List<ProductDetail> details = productDetailRepo.findByVariantId(variant.getId());
            List<ProductEditDto.ProductDetailEditDto> detailDtos = details.stream().map(detail -> {
                ProductEditDto.ProductDetailEditDto detailDto = new ProductEditDto.ProductDetailEditDto();
                detailDto.setAttributeValueId(detail.getAttributeValue().getId());
                detailDto.setAttributeName(detail.getAttributeValue().getAttribute().getName());
                detailDto.setValue(detail.getAttributeValue().getValue());
                detailDto.setTypesValue(detail.getAttributeValue().getAttribute().getTypesValue());
                return detailDto;
            }).collect(Collectors.toList());
            variantDto.setProductDetails(detailDtos);

            return variantDto;
        }).collect(Collectors.toList());
        dto.setVariants(variantDtos);

        // Ánh xạ nhóm addon
        List<AddonGroup> addonGroups = addonGroupRepo.findByProductId(productId);
        List<ProductEditDto.AddonGroupEditDto> addonGroupDtos = addonGroups.stream().map(group -> {
            ProductEditDto.AddonGroupEditDto groupDto = new ProductEditDto.AddonGroupEditDto();
            groupDto.setId(group.getId());
            groupDto.setName(group.getName());
            groupDto.setMaxChoice(group.getMaxChoice());

            List<Addon> addons = addonRepo.findByAddonGroupId(group.getId());
            List<ProductEditDto.AddonEditDto> addonDtos = addons.stream().map(addon -> {
                ProductEditDto.AddonEditDto addonDto = new ProductEditDto.AddonEditDto();
                addonDto.setId(addon.getId());
                addonDto.setName(addon.getName());
                addonDto.setPrice(addon.getPriceAdjust());
                addonDto.setActive(addon.isActive());
                return addonDto;
            }).collect(Collectors.toList());
            groupDto.setAddons(addonDtos);

            return groupDto;
        }).collect(Collectors.toList());
        dto.setAddonGroups(addonGroupDtos);

        // Ánh xạ thông số kỹ thuật
        List<SpecificationValue> specs = specificationValueRepo.findByProductId(productId);
        List<ProductEditDto.SpecificationEditDto> specDtos = specs.stream().map(spec -> {
            ProductEditDto.SpecificationEditDto specDto = new ProductEditDto.SpecificationEditDto();
            specDto.setSpecificationId(spec.getSpecification().getId());
            specDto.setSpecificationName(spec.getSpecification().getName());
            specDto.setValue(spec.getValue());
            return specDto;
        }).collect(Collectors.toList());
        dto.setSpecifications(specDtos);

        // Ánh xạ hình ảnh
        List<ProductImage> images = productImageRepo.findByProductId(productId);
        List<ProductEditDto.ProductImageEditDto> imageDtos = images.stream().map(image -> {
            ProductEditDto.ProductImageEditDto imageDto = new ProductEditDto.ProductImageEditDto();
            imageDto.setId(image.getId());
            imageDto.setUrl(image.getImageUrl());
            imageDto.setAltText(image.getAltText());
            return imageDto;
        }).collect(Collectors.toList());
        dto.setImages(imageDtos);

        return dto;
    }


}
