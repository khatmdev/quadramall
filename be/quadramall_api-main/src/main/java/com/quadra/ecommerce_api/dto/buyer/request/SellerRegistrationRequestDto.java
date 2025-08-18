package com.quadra.ecommerce_api.dto.buyer.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Schema(description = "DTO for submitting a seller registration request")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerRegistrationRequestDto {

    @Schema(description = "Email of the user submitting the registration", example = "user@example.com", required = true)
    @NotBlank(message = "Email is required")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @Schema(description = "Name of the store", example = "My Awesome Store", required = true)
    @NotBlank(message = "Store name is required")
    @Size(max = 255, message = "Store name must not exceed 255 characters")
    private String storeName;

    @Schema(description = "Address of the store", example = "123 Main Street, District 1, HCMC", required = true)
    @NotBlank(message = "Address is required")
    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    @Schema(description = "Description of the store", example = "A store selling premium electronics")
    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    @Schema(description = "Tax code of the store", example = "1234567890")
    @Size(max = 50, message = "Tax code must not exceed 50 characters")
    private String taxCode;

    @Schema(description = "URL of the store logo", example = "https://cloud.example.com/logo.png")
    @Size(max = 255, message = "Logo URL must not exceed 255 characters")
    private String logoUrl;

    @Schema(description = "URL of the business license document", example = "https://cloud.example.com/license.pdf")
    @Size(max = 255, message = "Business license URL must not exceed 255 characters")
    private String businessLicenseUrl;

    @Schema(description = "List of URLs for ID card images (front and back)", example = "[\"https://cloud.example.com/idcard_front.png\", \"https://cloud.example.com/idcard_back.png\"]")
    @Size(min = 2, max = 2, message = "ID card URLs must contain exactly 2 URLs")
    private List<@Size(max = 255, message = "Each ID card URL must not exceed 255 characters") String> idCardUrl;
}
