package com.quadra.ecommerce_api.dto.admin.response;


import com.quadra.ecommerce_api.enums.store.RegistrationStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "DTO for returning seller registration details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerRegistrationResponseDto {

    @Schema(description = "ID of the seller registration", example = "1")
    private Long id;

    @Schema(description = "ID of the user who submitted the registration", example = "1")
    private Long userId;

    @Schema(description = "Name of the store", example = "My Awesome Store")
    private String storeName;

    @Schema(description = "Address of the store", example = "123 Main Street, District 1, HCMC")
    private String address;

    @Schema(description = "Description of the store", example = "A store selling premium electronics")
    private String description;

    @Schema(description = "Tax code of the store", example = "1234567890")
    private String taxCode;

    @Schema(description = "URL of the store logo", example = "https://cloud.example.com/logo.png")
    private String logoUrl;

    @Schema(description = "URL of the business license document", example = "https://cloud.example.com/license.pdf")
    private String businessLicenseUrl;

    @Schema(description = "List of URLs for ID card images (front and back)", example = "[\"https://cloud.example.com/idcard_front.png\", \"https://cloud.example.com/idcard_back.png\"]")
    private List<String> idCardUrl;

    @Schema(description = "Status of the registration", example = "PENDING")
    private RegistrationStatus status;

    @Schema(description = "Reason for rejection, if applicable", example = "Invalid business license")
    private String rejectionReason;

    @Schema(description = "Creation timestamp of the registration", example = "2025-07-14T18:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp of the registration", example = "2025-07-14T18:30:00")
    private LocalDateTime updatedAt;
}
