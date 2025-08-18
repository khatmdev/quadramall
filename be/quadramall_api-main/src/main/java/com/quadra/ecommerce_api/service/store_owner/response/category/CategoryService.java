package com.quadra.ecommerce_api.service.store_owner.response.category;


import com.quadra.ecommerce_api.dto.store_owner.request.category.CreateCategoryRequestDto;
import com.quadra.ecommerce_api.dto.store_owner.request.category.UpdateCategoryRequestDto;
import com.quadra.ecommerce_api.dto.store_owner.response.category.CategoryDto;
import com.quadra.ecommerce_api.entity.store.Category;
import com.quadra.ecommerce_api.entity.store.Store;
import com.quadra.ecommerce_api.repository.product.ProductRepo;
import com.quadra.ecommerce_api.repository.store.CategoryRepo;
import com.quadra.ecommerce_api.repository.store.StoreRepo;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepo categoryRepo;
    private final StoreRepo storeRepo;
    private final ProductRepo productRepo;

    @Autowired
    public CategoryService(CategoryRepo categoryRepo, StoreRepo storeRepo, ProductRepo productRepo) {
        this.categoryRepo = categoryRepo;
        this.storeRepo = storeRepo;
        this.productRepo = productRepo;
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

    public List<CategoryDto> getCategoryTreeByStoreId(Long storeId) {
        // Kiểm tra cửa hàng tồn tại
        if (!storeRepo.existsById(storeId)) {
            throw new EntityNotFoundException("Cửa hàng với ID " + storeId + " không tồn tại");
        }

        // Lấy tất cả danh mục theo storeId
        List<Category> categories = categoryRepo.findByStoreId(storeId);

        // Tính toán số liệu tổng hợp
        Long totalCategories = categoryRepo.countByStoreId(storeId);
        Long totalProducts = productRepo.countByStoreIdAndIsActiveTrue(storeId);
        Long totalProductsWithCategory = categoryRepo.countProductsWithCategoryByStoreId(storeId);

        // Chuyển đổi sang DTO
        List<CategoryDto> categoryDtos = categories.stream()
                .map(category -> {
                    CategoryDto dto = convertToDto(category);
                    // Gán số liệu tổng hợp cho mỗi DTO
                    dto.setTotalCategories(totalCategories);
                    dto.setTotalProducts(totalProducts);
                    dto.setTotalProductsWithCategory(totalProductsWithCategory);
                    return dto;
                })
                .collect(Collectors.toList());

        // Tạo map để tra cứu nhanh theo ID
        Map<Long, CategoryDto> categoryMap = categoryDtos.stream()
                .collect(Collectors.toMap(CategoryDto::getId, dto -> dto));

        // Danh sách chứa các danh mục gốc (root)
        List<CategoryDto> rootCategories = new ArrayList<>();

        // Phân loại danh mục thành cây
        for (CategoryDto dto : categoryDtos) {
            if (dto.getParentId() == null) {
                rootCategories.add(dto);
            } else {
                CategoryDto parent = categoryMap.get(dto.getParentId());
                if (parent != null) {
                    parent.getChildren().add(dto);
                }
            }
        }

        return rootCategories;
    }


    @Transactional
    public CategoryDto createCategory(CreateCategoryRequestDto requestDto) {
        // Xác thực dữ liệu đầu vào
        if (requestDto.getName() == null || requestDto.getName().isEmpty()) {
            throw new IllegalArgumentException("Tên danh mục không được để trống");
        }
        if (requestDto.getStoreId() == null || !storeRepo.existsById(requestDto.getStoreId())) {
            throw new EntityNotFoundException("Cửa hàng với ID " + requestDto.getStoreId() + " không tồn tại");
        }

        // Chuẩn hóa tên danh mục
        String standardizedName = standardizeName(requestDto.getName());

        // Kiểm tra slug đã tồn tại trong cửa hàng
        String tempSlug = "temp-" + UUID.randomUUID().toString();
        if (requestDto.getSlug() != null && !requestDto.getSlug().isEmpty() && categoryRepo.findBySlugAndStoreId(requestDto.getSlug(), requestDto.getStoreId()).isPresent()) {
            throw new IllegalArgumentException("Slug '" + requestDto.getSlug() + "' đã tồn tại trong cửa hàng này");
        }

        // Kiểm tra danh mục cha nếu có
        Category parent = null;
        if (requestDto.getParentId() != null) {
            parent = categoryRepo.findByIdAndStoreId(requestDto.getParentId(), requestDto.getStoreId())
                    .orElseThrow(() -> new EntityNotFoundException("Danh mục cha với ID " + requestDto.getParentId() + " không tồn tại hoặc không thuộc cửa hàng"));
        }

        // Tạo danh mục mới với slug tạm thời
        Store store = storeRepo.findById(requestDto.getStoreId())
                .orElseThrow(() -> new EntityNotFoundException("Cửa hàng với ID " + requestDto.getStoreId() + " không tồn tại"));

        Category category = Category.builder()
                .store(store)
                .name(standardizedName)
                .slug(tempSlug)
                .description(requestDto.getDescription())
                .parent(parent)
                .build();

        // Lưu danh mục lần đầu để lấy ID
        category = categoryRepo.save(category);

        // Tạo slug cuối cùng với ID
        String baseSlug = generateBaseSlug(standardizedName);
        String finalSlug = baseSlug + "-" + category.getId();
        if (categoryRepo.findBySlugAndStoreId(finalSlug, requestDto.getStoreId()).isPresent()) {
            throw new IllegalArgumentException("Slug '" + finalSlug + "' đã tồn tại trong cửa hàng này");
        }
        category.setSlug(finalSlug);
        category = categoryRepo.save(category);

        // Trả về DTO
        return convertToDto(category);
    }

    @Transactional
    public CategoryDto updateCategory(Long categoryId, UpdateCategoryRequestDto requestDto) {
        // Kiểm tra danh mục tồn tại
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Danh mục với ID " + categoryId + " không tồn tại"));

        // Chuẩn hóa tên danh mục nếu được cập nhật
        if (requestDto.getName() != null && !requestDto.getName().isEmpty()) {
            String standardizedName = standardizeName(requestDto.getName());
            category.setName(standardizedName);

            // Cập nhật slug dựa trên tên mới
            String baseSlug = generateBaseSlug(standardizedName);
            String finalSlug = baseSlug + "-" + categoryId;
            if (!finalSlug.equals(category.getSlug()) && categoryRepo.findBySlugAndStoreId(finalSlug, category.getStore().getId()).isPresent()) {
                throw new IllegalArgumentException("Slug '" + finalSlug + "' đã tồn tại trong cửa hàng này");
            }
            category.setSlug(finalSlug);
        } else if (requestDto.getSlug() != null && !requestDto.getSlug().isEmpty() && !requestDto.getSlug().equals(category.getSlug())) {
            // Kiểm tra slug nếu được cập nhật trực tiếp
            if (categoryRepo.findBySlugAndStoreId(requestDto.getSlug(), category.getStore().getId()).isPresent()) {
                throw new IllegalArgumentException("Slug '" + requestDto.getSlug() + "' đã tồn tại trong cửa hàng này");
            }
            category.setSlug(requestDto.getSlug());
        }

        // Kiểm tra danh mục cha nếu được cập nhật
        if (requestDto.getParentId() != null && (category.getParent() == null || !requestDto.getParentId().equals(category.getParent().getId()))) {
            Category parent = categoryRepo.findByIdAndStoreId(requestDto.getParentId(), category.getStore().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Danh mục cha với ID " + requestDto.getParentId() + " không tồn tại hoặc không thuộc cửa hàng"));

            // Kiểm tra vòng lặp
            if (isDescendant(categoryId, requestDto.getParentId())) {
                throw new IllegalArgumentException("Không thể đặt danh mục cha là con hoặc chính nó để tránh vòng lặp");
            }
            category.setParent(parent);
        } else if (requestDto.getParentId() == null && category.getParent() != null) {
            category.setParent(null); // Xóa danh mục cha nếu parentId là null
        }

        // Cập nhật mô tả nếu có
        if (requestDto.getDescription() != null) {
            category.setDescription(requestDto.getDescription());
        }

        // Lưu danh mục
        category = categoryRepo.save(category);

        // Trả về DTO
        return convertToDto(category);
    }

    @Transactional
    public void deleteCategory(Long categoryId) {
        // Kiểm tra danh mục tồn tại
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Danh mục với ID " + categoryId + " không tồn tại"));

        // Kiểm tra xem danh mục có danh mục con không
        List<Long> descendantIds = categoryRepo.findAllDescendantIds(categoryId);
        if (descendantIds.size() > 1) { // Nếu > 1, danh mục có con
            throw new IllegalArgumentException("Không thể xóa danh mục vì nó có danh mục con");
        }

        // Xóa danh mục
        categoryRepo.delete(category);
    }

    private CategoryDto convertToDto(Category category) {
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getParent() != null ? category.getParent().getId() : null
        );
    }

    private boolean isDescendant(Long categoryId, Long parentId) {
        List<Long> descendantIds = categoryRepo.findAllDescendantIds(categoryId);
        return descendantIds.contains(parentId);
    }
}
