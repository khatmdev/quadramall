package com.quadra.ecommerce_api.controller.store_owner.item_type;


import com.quadra.ecommerce_api.dto.store_owner.response.store.ItemTypeDTO;
import com.quadra.ecommerce_api.service.store_owner.response.store.ItemTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "admin.item_type", description = "Quản lý danh mục")
@RestController
@RequestMapping("/api/item-types")
public class ItemTypeController {

    protected final ItemTypeService itemTypeService;

    public ItemTypeController(ItemTypeService itemTypeService) {
        this.itemTypeService = itemTypeService;
    }


    // Lấy danh sách tất cả loại mặt hàng đang hoạt động
    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả loại mặt hàng đang hoạt động", description = "Trả về danh sách các ItemType với isActive = true")
    public ResponseEntity<List<ItemTypeDTO>> getAllActiveItemTypes() {
        return ResponseEntity.ok(itemTypeService.getAllActiveItemTypes());
    }

    // Lấy loại mặt hàng theo slug
    @GetMapping("/{slug}")
    @Operation(summary = "Lấy loại mặt hàng theo slug", description = "Trả về một ItemType dựa trên slug")
    public ResponseEntity<ItemTypeDTO> getItemTypeBySlug(
            @PathVariable @Schema(description = "Slug của loại mặt hàng", example = "dien-thoai") String slug) {
        return ResponseEntity.ok(itemTypeService.getItemTypeBySlug(slug));
    }

    // Lấy danh sách loại mặt hàng con
    @GetMapping("/parent/{parentId}")
    @Operation(summary = "Lấy danh sách loại mặt hàng con", description = "Trả về danh sách ItemType có parentId được chỉ định")
    public ResponseEntity<List<ItemTypeDTO>> getItemTypesByParentId(
            @PathVariable @Schema(description = "ID của loại mặt hàng cha", example = "1") Long parentId) {
        return ResponseEntity.ok(itemTypeService.getItemTypesByParentId(parentId));
    }

    // Lấy tất cả danh mục cha lớn nhất
    @GetMapping("/top-level")
    @Operation(summary = "Lấy danh sách danh mục cha lớn nhất", description = "Trả về danh sách các ItemType không có parent và đang hoạt động")
    public ResponseEntity<List<ItemTypeDTO>> getAllTopLevelItemTypes() {
        return ResponseEntity.ok(itemTypeService.getAllTopLevelItemTypes());
    }

    // Lấy tất cả loại mặt hàng với cấu trúc phân cấp
    @GetMapping("/hierarchy")
    @Operation(summary = "Lấy tất cả loại mặt hàng với cấu trúc phân cấp", description = "Trả về danh sách ItemType với thông tin parent và children")
    public ResponseEntity<List<ItemTypeDTO>> getAllWithHierarchy() {
        return ResponseEntity.ok(itemTypeService.getAllWithHierarchy());
    }

    // Tạo một loại mặt hàng mới
    @PostMapping
    @Operation(summary = "Tạo một loại mặt hàng mới", description = "Tạo một ItemType mới từ dữ liệu DTO")
    public ResponseEntity<ItemTypeDTO> createItemType(
            @Valid @RequestBody @Schema(description = "Dữ liệu của loại mặt hàng") ItemTypeDTO itemTypeDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(itemTypeService.createItemType(itemTypeDTO));
    }

    // Cập nhật một loại mặt hàng
    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật loại mặt hàng", description = "Cập nhật thông tin của ItemType dựa trên ID")
    public ResponseEntity<ItemTypeDTO> updateItemType(
            @PathVariable @Schema(description = "ID của loại mặt hàng", example = "1") Long id,
            @Valid @RequestBody @Schema(description = "Dữ liệu cập nhật của loại mặt hàng") ItemTypeDTO itemTypeDTO) {
        return ResponseEntity.ok(itemTypeService.updateItemType(id, itemTypeDTO));
    }

}
