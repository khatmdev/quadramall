package com.quadra.ecommerce_api.dto.base.cms;

import com.quadra.ecommerce_api.common.annotation.ValidEmoji;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Schema(description = "Banner hiển thị trên trang chủ & CRUD")
@NoArgsConstructor
@Data
public class BannerDTO {

    @Schema(description = "ID của banner", example = "1")
    private Long id;

    @Schema(description = "URL hình ảnh banner", example = "https://res.cloudinary.com/demo/image/upload/v1/banner.jpg")
    @NotBlank(message = "Đường dẫn hình ảnh không được để trống")
    @Pattern(regexp = "^https?://.*\\.(?:png|jpg|jpeg|gif)$", message = "Hình ảnh phải là URL hợp lệ và có định dạng PNG, JPG, JPEG hoặc GIF")
    private String image;

    @Schema(description = "Mô tả nội dung", example = "Khuyến mãi mùa hè")
    @NotBlank(message = "Mô tả không được để trống")
    @Size(max = 255, message = "Mô tả không được dài quá 255 ký tự")
    private String description;

    @Schema(description = "Link tới khi nhấn vào banner", example = "https://quadra.vn/summer-sale")
    @Pattern(regexp = "^(https?://.*|/.*)?$", message = "Liên kết phải là URL hợp lệ hoặc đường dẫn nội bộ bắt đầu bằng /")
    private String toUrl;

    @Schema(description = "Biểu tượng cảm xúc", example = "🔥")
    @ValidEmoji
    private String emoji;

    @Schema(description = "Trạng thái active", example = "true")
    private Boolean active;

    @Schema(description = "Dùng làm intro khi vào trang", example = "false")
    private Boolean isIntro;

    @Schema(description = "Thứ tự hiển thị tại trang chủ", example = "0")
    @NotNull(message = "Số thứ tự không được để trống")
    @Min(value = 0, message = "Số thứ tự phải là số không âm")
    private Integer displayOrder;

}
