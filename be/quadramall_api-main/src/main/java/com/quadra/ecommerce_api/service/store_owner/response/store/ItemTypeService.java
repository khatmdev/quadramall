package com.quadra.ecommerce_api.service.store_owner.response.store;

import com.quadra.ecommerce_api.dto.store_owner.response.store.ItemTypeDTO;
import com.quadra.ecommerce_api.entity.store.ItemType;
import com.quadra.ecommerce_api.repository.store.ItemTypeRepo;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ItemTypeService {

    protected final ItemTypeRepo itemTypeRepository;

    public ItemTypeService(ItemTypeRepo itemTypeRepository) {
        this.itemTypeRepository = itemTypeRepository;
    }

    // Tạo slug từ tên: chuẩn hóa tên, loại bỏ dấu và thay khoảng trắng bằng dấu gạch ngang
    private String generateBaseSlug(String name) {
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String withoutDiacritics = pattern.matcher(normalized).replaceAll("");
        return withoutDiacritics.replaceAll("\\s+", "-").toLowerCase();
    }

    // Chuyển đổi ItemType entity sang DTO, xử lý đệ quy cho parent và tránh vòng lặp vô hạn bằng cache
    private ItemTypeDTO convertToDTO(ItemType itemType, Map<Long, ItemTypeDTO> dtoCache) {
        if (itemType == null) {
            return null;
        }

        // Kiểm tra cache để tránh đệ quy vô hạn
        if (dtoCache.containsKey(itemType.getId())) {
            return dtoCache.get(itemType.getId());
        }

        ItemTypeDTO dto = new ItemTypeDTO();
        dto.setId(itemType.getId());
        dto.setName(itemType.getName());
        dto.setSlug(itemType.getSlug());
        dto.setDescription(itemType.getDescription());
        dto.setIconUrl(itemType.getIconUrl());
        dto.setIsActive(itemType.isActive());
        dto.setChildren(new ArrayList<>()); // Khởi tạo danh sách con rỗng

        // Lưu DTO vào cache trước khi xử lý parent để tránh đệ quy
        dtoCache.put(itemType.getId(), dto);

        // Chuyển đổi parent nếu tồn tại
        if (itemType.getParent() != null) {
            ItemTypeDTO parentDTO = convertToDTO(itemType.getParent(), dtoCache);
            dto.setParent(parentDTO);
        }

        return dto;
    }

    // Lấy danh sách tất cả ItemType đang hoạt động
    public List<ItemTypeDTO> getAllActiveItemTypes() {
        return itemTypeRepository.findAllActive()
                .stream()
                .map(itemType -> convertToDTO(itemType, new HashMap<>()))
                .collect(Collectors.toList());
    }

    // Lấy ItemType theo slug
    public ItemTypeDTO getItemTypeBySlug(String slug) {
        return itemTypeRepository.findBySlug(slug)
                .map(itemType -> convertToDTO(itemType, new HashMap<>()))
                .orElseThrow(() -> new RuntimeException("ItemType not found with slug: " + slug));
    }

    // Lấy danh sách ItemType theo parentId
    public List<ItemTypeDTO> getItemTypesByParentId(Long parentId) {
        return itemTypeRepository.findByParentId(parentId)
                .stream()
                .map(itemType -> convertToDTO(itemType, new HashMap<>()))
                .collect(Collectors.toList());
    }

    // Tạo mới ItemType với slug được tạo từ tên và ID
    public ItemTypeDTO createItemType(ItemTypeDTO itemTypeDTO) {
        // Kiểm tra dữ liệu đầu vào
        if (itemTypeDTO.getName() == null || itemTypeDTO.getName().isEmpty()) {
            throw new IllegalArgumentException("Tên loại sản phẩm không được để trống");
        }

        // Tạo ItemType với slug tạm thời
        ItemType itemType = new ItemType();
        itemType.setName(itemTypeDTO.getName());
        String tempSlug = "temp-" + java.util.UUID.randomUUID().toString();
        itemType.setSlug(tempSlug);
        itemType.setDescription(itemTypeDTO.getDescription());
        itemType.setIconUrl(itemTypeDTO.getIconUrl());
        itemType.setActive(itemTypeDTO.getIsActive() != null ? itemTypeDTO.getIsActive() : true);

        // Xử lý parent nếu có
        if (itemTypeDTO.getParent() != null && itemTypeDTO.getParent().getId() != null) {
            ItemType parent = itemTypeRepository.findById(itemTypeDTO.getParent().getId())
                    .orElseThrow(() -> new RuntimeException("Loại sản phẩm cha không tồn tại"));
            itemType.setParent(parent);
        }

        // Lưu ItemType để lấy ID
        ItemType savedItemType = itemTypeRepository.save(itemType);

        // Tạo slug cuối cùng với ID
        String baseSlug = generateBaseSlug(itemTypeDTO.getName());
        String finalSlug = baseSlug + "-" + savedItemType.getId();
        if (itemTypeRepository.existsBySlug(finalSlug)) {
            throw new RuntimeException("Slug đã tồn tại: " + finalSlug);
        }
        savedItemType.setSlug(finalSlug);
        savedItemType = itemTypeRepository.save(savedItemType);

        return convertToDTO(savedItemType, new HashMap<>());
    }

    // Cập nhật ItemType với slug được tạo lại từ tên và ID
    public ItemTypeDTO updateItemType(Long id, ItemTypeDTO itemTypeDTO) {
        // Kiểm tra dữ liệu đầu vào
        if (itemTypeDTO.getName() == null || itemTypeDTO.getName().isEmpty()) {
            throw new IllegalArgumentException("Tên loại sản phẩm không được để trống");
        }

        // Tìm ItemType hiện có
        ItemType itemType = itemTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ItemType với id: " + id));

        // Cập nhật các trường
        itemType.setName(itemTypeDTO.getName());
        itemType.setDescription(itemTypeDTO.getDescription());
        itemType.setIconUrl(itemTypeDTO.getParent() == null ? itemTypeDTO.getIconUrl() : null); // Chỉ cập nhật iconUrl cho root
        itemType.setActive(itemTypeDTO.getIsActive() != null ? itemTypeDTO.getIsActive() : itemType.isActive());

        // Giữ parent hiện tại nếu DTO không cung cấp parent
        if (itemTypeDTO.getParent() != null && itemTypeDTO.getParent().getId() != null) {
            ItemType parent = itemTypeRepository.findById(itemTypeDTO.getParent().getId())
                    .orElseThrow(() -> new RuntimeException("Loại sản phẩm cha không tồn tại"));
            itemType.setParent(parent);
        }

        // Tạo slug mới
        String baseSlug = itemTypeDTO.getName().toLowerCase().replaceAll("\\s+", "-");
        String finalSlug = baseSlug + "-" + id;
        if (!finalSlug.equals(itemType.getSlug()) && itemTypeRepository.existsBySlug(finalSlug)) {
            throw new IllegalArgumentException("Slug đã tồn tại: " + finalSlug);
        }
        itemType.setSlug(finalSlug);

        // Lưu ItemType đã cập nhật
        ItemType updatedItemType = itemTypeRepository.save(itemType);
        return convertToDTO(updatedItemType, new HashMap<>());
    }

    // Lấy tất cả ItemType với cấu trúc phân cấp
    public List<ItemTypeDTO> getAllWithHierarchy() {
        List<ItemType> itemTypes = itemTypeRepository.findAllActiveWithParent();
        Map<Long, ItemTypeDTO> dtoMap = new HashMap<>();
        List<ItemTypeDTO> result = new ArrayList<>();

        // Chuyển đổi tất cả entity sang DTO và lưu vào cache
        for (ItemType itemType : itemTypes) {
            convertToDTO(itemType, dtoMap);
        }

        // Xây dựng cấu trúc phân cấp bằng cách gán con cho cha
        for (ItemType itemType : itemTypes) {
            ItemTypeDTO dto = dtoMap.get(itemType.getId());
            if (itemType.getParent() != null) {
                ItemTypeDTO parentDTO = dtoMap.get(itemType.getParent().getId());
                if (parentDTO != null) {
                    parentDTO.getChildren().add(dto);
                }
            } else {
                // Các mục cấp cao nhất (không có parent) được thêm vào kết quả
                result.add(dto);
            }
        }

        return result;
    }

    // Lấy tất cả danh mục cha lớn nhất (không có parent)
    public List<ItemTypeDTO> getAllTopLevelItemTypes() {
        return itemTypeRepository.findByParentIsNullAndIsActiveTrue()
                .stream()
                .map(itemType -> convertToDTO(itemType, new HashMap<>()))
                .collect(Collectors.toList());
    }

    public List<Long> getAllChildItemTypeIds(Long rootId) {
        List<Long> result = new ArrayList<>();
        collectItemTypeIds(rootId, result);
        return result;
    }

    private void collectItemTypeIds(Long parentId, List<Long> result) {
        result.add(parentId);
        List<ItemType> children = itemTypeRepository.findByParentId(parentId);
        for (ItemType child : children) {
            collectItemTypeIds(child.getId(), result);
        }
    }

}