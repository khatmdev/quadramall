package com.quadra.ecommerce_api.dto.store_owner.response.store;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Schema(description = "DTO đại diện cho một loại mặt hàng trong hệ thống thương mại điện tử")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemTypeDTO {
    @Schema(description = "ID duy nhất của loại mặt hàng", example = "1")
    private Long id;

    @Schema(description = "Tên của loại mặt hàng", example = "Điện thoại")
    private String name;

    @Schema(description = "Slug duy nhất, dùng cho URL", example = "dien-thoai")
    private String slug;

    @Schema(description = "Mô tả chi tiết về loại mặt hàng", example = "Danh mục chứa các sản phẩm điện thoại thông minh")
    private String description;

    @Schema(description = "URL của biểu tượng", example = "https://example.com/icon.png")
    private String iconUrl;

    @Schema(description = "Trạng thái hoạt động", example = "true")
    @Builder.Default
    private Boolean isActive = true;

    @Schema(description = "Loại mặt hàng cha (nếu có)")
    @JsonBackReference
    private ItemTypeDTO parent;

    @Schema(description = "Danh sách các loại mặt hàng con")
    @JsonManagedReference
    private List<ItemTypeDTO> children;


    @Override
    public String toString() {
        return "ItemTypeDTO{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", slug='" + slug + '\'' +
                ", description='" + description + '\'' +
                ", iconUrl='" + iconUrl + '\'' +
                ", isActive=" + isActive +
                ", parentId=" + (parent != null ? parent.getId() : null) +
                ", children.size=" + (children != null ? children.size() : 0) +
                '}';
    }
}