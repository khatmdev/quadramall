package com.quadra.ecommerce_api.mapper.buyer.request;


import com.quadra.ecommerce_api.dto.admin.response.SellerRegistrationResponseDto;
import com.quadra.ecommerce_api.dto.buyer.request.SellerRegistrationRequestDto;
import com.quadra.ecommerce_api.entity.store.SellerRegistration;
import com.quadra.ecommerce_api.entity.user.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface SellerRegistrationMapper {

    SellerRegistrationMapper INSTANCE = Mappers.getMapper(SellerRegistrationMapper.class);

    @Mapping(target = "id", ignore = true) // Ignore id, tự sinh bởi database
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "storeName", source = "storeName")
    @Mapping(target = "address", source = "address")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "logoUrl", source = "logoUrl")
    @Mapping(target = "businessLicenseUrl", source = "businessLicenseUrl")
    @Mapping(target = "idCardUrl", source = "idCardUrl")
    @Mapping(target = "taxCode", source = "taxCode")
    @Mapping(target = "status", ignore = true) // Status mặc định PENDING ở backend
    @Mapping(target = "rejectionReason", ignore = true) // Không ánh xạ từ DTO
    @Mapping(target = "createdAt", ignore = true) // Tự sinh bởi Hibernate
    @Mapping(target = "updatedAt", ignore = true) // Tự sinh bởi Hibernate
    SellerRegistration toEntity(SellerRegistrationRequestDto requestDto);

    @Mapping(target = "userId", source = "user.id") // Lấy id từ User để trả về userId
    @Mapping(target = "storeName", source = "storeName")
    @Mapping(target = "address", source = "address")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "logoUrl", source = "logoUrl")
    @Mapping(target = "businessLicenseUrl", source = "businessLicenseUrl")
    @Mapping(target = "idCardUrl", source = "idCardUrl")
    @Mapping(target = "taxCode", source = "taxCode")
    SellerRegistrationResponseDto toResponseDto(SellerRegistration entity);

    @org.mapstruct.Named("mapUserIdToUser")
    default User mapUserIdToUser(Long userId) {
        if (userId == null) {
            return null;
        }
        User user = new User();
        user.setId(userId);
        return user;
    }
}
