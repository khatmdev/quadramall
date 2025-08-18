package com.quadra.ecommerce_api.mapper.buyer.response;


import com.quadra.ecommerce_api.dto.buyer.request.RegistrationUpdateRequestDto;
import com.quadra.ecommerce_api.dto.buyer.response.RegistrationDetailsDto;
import com.quadra.ecommerce_api.entity.store.SellerRegistration;
import com.quadra.ecommerce_api.enums.store.RegistrationStatus;
import org.mapstruct.Mapper;


@Mapper(componentModel = "spring")
public class RegistrationMapper {

    /**
     * Chuyển đổi từ Entity sang RegistrationDetailsDto (để load form edit)
     */
    public RegistrationDetailsDto toDetailsDto(SellerRegistration entity) {
        if (entity == null) {
            return null;
        }

        RegistrationDetailsDto.RegistrationDetailsDtoBuilder builder = RegistrationDetailsDto.builder()
                .id(entity.getId())
                .storeName(entity.getStoreName())
                .address(entity.getAddress())
                .description(entity.getDescription())
                .taxCode(entity.getTaxCode())
                .logoUrl(entity.getLogoUrl())
                .businessLicenseUrl(entity.getBusinessLicenseUrl())
                .idCardUrl(entity.getIdCardUrl())
                .status(entity.getStatus())
                .rejectionReason(entity.getRejectionReason())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt());

        // Parse address để tách ra các field riêng biệt
        if (entity.getAddress() != null) {
            parseAddressFields(entity.getAddress(), builder);
        }

        // Thêm thông tin user
        if (entity.getUser() != null) {
            builder.email(entity.getUser().getEmail())
                    .phone(entity.getUser().getPhone());
        }

        return builder.build();
    }

    /**
     * Parse address string thành các field riêng biệt
     * Format: "pickupContactName , pickupContactPhone , address , ward , district , city"
     */
    private void parseAddressFields(String fullAddress, RegistrationDetailsDto.RegistrationDetailsDtoBuilder builder) {
        if (fullAddress == null || fullAddress.trim().isEmpty()) {
            return;
        }

        try {
            String[] parts = fullAddress.split(" , ");
            if (parts.length >= 6) {
                builder.pickupContactName(parts[0].trim())
                        .pickupContactPhone(parts[1].trim())
                        .specificAddress(parts[2].trim())
                        .ward(parts[3].trim())
                        .district(parts[4].trim())
                        .city(parts[5].trim());
            } else {
                // Nếu format không đúng, để nguyên address gốc
                builder.specificAddress(fullAddress);
            }
        } catch (Exception e) {
            // Nếu có lỗi parse, để nguyên address gốc
            builder.specificAddress(fullAddress);
        }
    }

    /**
     * Cập nhật Entity từ RegistrationUpdateRequestDto
     */
    public void updateEntityFromUpdateDto(SellerRegistration entity, RegistrationUpdateRequestDto updateDto) {
        if (entity == null || updateDto == null) {
            return;
        }

        entity.setStoreName(updateDto.getStoreName());
        entity.setAddress(updateDto.getAddress());
        entity.setDescription(updateDto.getDescription());
        entity.setTaxCode(updateDto.getTaxCode());
        entity.setLogoUrl(updateDto.getLogoUrl());
        entity.setBusinessLicenseUrl(updateDto.getBusinessLicenseUrl());
        entity.setIdCardUrl(updateDto.getIdCardUrl());

        // Reset status về PENDING khi cập nhật
        entity.setStatus(RegistrationStatus.PENDING);
        entity.setRejectionReason(null);
    }
}
