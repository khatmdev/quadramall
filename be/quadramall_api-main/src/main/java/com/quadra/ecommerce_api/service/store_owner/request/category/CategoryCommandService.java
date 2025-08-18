package com.quadra.ecommerce_api.service.store_owner.request.category;

import com.quadra.ecommerce_api.dto.store_owner.request.category.CreateCategoryRequestDto;
import com.quadra.ecommerce_api.dto.store_owner.request.category.UpdateCategoryRequestDto;
import com.quadra.ecommerce_api.dto.store_owner.response.category.CategoryDto;
import com.quadra.ecommerce_api.entity.product.Product;
import com.quadra.ecommerce_api.entity.store.Category;
import com.quadra.ecommerce_api.entity.store.Store;
import com.quadra.ecommerce_api.repository.product.ProductRepo;
import com.quadra.ecommerce_api.repository.store.CategoryRepo;
import com.quadra.ecommerce_api.repository.store.StoreRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class CategoryCommandService {

    private final CategoryRepo categoryRepo;
    private final StoreRepo storeRepo;
    private final ProductRepo productRepo;

    @Autowired
    public CategoryCommandService(CategoryRepo categoryRepo, StoreRepo storeRepo, ProductRepo productRepo) {
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

    @Transactional
    public CategoryDto createCategory(CreateCategoryRequestDto requestDto) {
        if (requestDto.getName() == null || requestDto.getName().isEmpty()) {
            throw new IllegalArgumentException("Tên danh mục không được để trống");
        }
        if (requestDto.getStoreId() == null || !storeRepo.existsById(requestDto.getStoreId())) {
            throw new EntityNotFoundException("Cửa hàng với ID " + requestDto.getStoreId() + " không tồn tại");
        }

        String standardizedName = standardizeName(requestDto.getName());
        String tempSlug = "temp-" + UUID.randomUUID().toString();
        if (requestDto.getSlug() != null && !requestDto.getSlug().isEmpty() && categoryRepo.findBySlugAndStoreId(requestDto.getSlug(), requestDto.getStoreId()).isPresent()) {
            throw new IllegalArgumentException("Slug '" + requestDto.getSlug() + "' đã tồn tại trong cửa hàng này");
        }

        Category parent = null;
        if (requestDto.getParentId() != null) {
            parent = categoryRepo.findByIdAndStoreId(requestDto.getParentId(), requestDto.getStoreId())
                    .orElseThrow(() -> new EntityNotFoundException("Danh mục cha với ID " + requestDto.getParentId() + " không tồn tại hoặc không thuộc cửa hàng"));
        }

        Store store = storeRepo.findById(requestDto.getStoreId())
                .orElseThrow(() -> new EntityNotFoundException("Cửa hàng với ID " + requestDto.getStoreId() + " không tồn tại"));

        Category category = Category.builder()
                .store(store)
                .name(standardizedName)
                .slug(tempSlug)
                .description(requestDto.getDescription())
                .parent(parent)
                .build();

        category = categoryRepo.save(category);

        String baseSlug = generateBaseSlug(standardizedName);
        String finalSlug = baseSlug + "-" + category.getId();
        if (categoryRepo.findBySlugAndStoreId(finalSlug, requestDto.getStoreId()).isPresent()) {
            throw new IllegalArgumentException("Slug '" + finalSlug + "' đã tồn tại trong cửa hàng này");
        }
        category.setSlug(finalSlug);
        category = categoryRepo.save(category);

        return convertToDto(category);
    }

    @Transactional
    public CategoryDto updateCategory(Long categoryId, UpdateCategoryRequestDto requestDto) {
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Danh mục với ID " + categoryId + " không tồn tại"));

        if (requestDto.getName() != null && !requestDto.getName().isEmpty()) {
            String standardizedName = standardizeName(requestDto.getName());
            category.setName(standardizedName);

            String baseSlug = generateBaseSlug(standardizedName);
            String finalSlug = baseSlug + "-" + categoryId;
            if (!finalSlug.equals(category.getSlug()) && categoryRepo.findBySlugAndStoreId(finalSlug, category.getStore().getId()).isPresent()) {
                throw new IllegalArgumentException("Slug '" + finalSlug + "' đã tồn tại trong cửa hàng này");
            }
            category.setSlug(finalSlug);
        } else if (requestDto.getSlug() != null && !requestDto.getSlug().isEmpty() && !requestDto.getSlug().equals(category.getSlug())) {
            if (categoryRepo.findBySlugAndStoreId(requestDto.getSlug(), category.getStore().getId()).isPresent()) {
                throw new IllegalArgumentException("Slug '" + requestDto.getSlug() + "' đã tồn tại trong cửa hàng này");
            }
            category.setSlug(requestDto.getSlug());
        }

        if (requestDto.getParentId() != null && (category.getParent() == null || !requestDto.getParentId().equals(category.getParent().getId()))) {
            Category parent = categoryRepo.findByIdAndStoreId(requestDto.getParentId(), category.getStore().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Danh mục cha với ID " + requestDto.getParentId() + " không tồn tại hoặc không thuộc cửa hàng"));

            if (isDescendant(categoryId, requestDto.getParentId())) {
                throw new IllegalArgumentException("Không thể đặt danh mục cha là con hoặc chính nó để tránh vòng lặp");
            }
            category.setParent(parent);
        } else if (requestDto.getParentId() == null && category.getParent() != null) {
            category.setParent(null);
        }

        if (requestDto.getDescription() != null) {
            category.setDescription(requestDto.getDescription());
        }

        category = categoryRepo.save(category);
        return convertToDto(category);
    }

    @Transactional
    public void deleteCategory(Long categoryId) {
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Danh mục với ID " + categoryId + " không tồn tại"));

        List<Long> descendantIds = categoryRepo.findAllDescendantIds(categoryId);
        if (descendantIds.size() > 1) {
            throw new IllegalArgumentException("Không thể xóa danh mục vì nó có danh mục con");
        }

        // Lấy tất cả sản phẩm thuộc danh mục và đặt category về null
        List<Product> products = productRepo.findByStoreIdAndCategoryIdAndIsActiveTrue(category.getStore().getId(), categoryId);
        for (Product product : products) {
            product.setCategory(null);
            productRepo.save(product);
        }

        // Xóa danh mục
        categoryRepo.delete(category);
    }

    @Transactional
    public void addProductToCategory(Long storeId, Long categoryId, Long productId) {
        Category category = categoryRepo.findByIdAndStoreId(categoryId, storeId)
                .orElseThrow(() -> new EntityNotFoundException("Danh mục với ID " + categoryId + " không tồn tại hoặc không thuộc cửa hàng"));

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm với ID " + productId + " không tồn tại"));

        if (!product.getStore().getId().equals(storeId)) {
            throw new IllegalArgumentException("Sản phẩm không thuộc cửa hàng này");
        }

        product.setCategory(category);
        productRepo.save(product);
    }

    @Transactional
    public void removeProductFromCategory(Long storeId, Long categoryId, Long productId) {
        Category category = categoryRepo.findByIdAndStoreId(categoryId, storeId)
                .orElseThrow(() -> new EntityNotFoundException("Danh mục với ID " + categoryId + " không tồn tại hoặc không thuộc cửa hàng"));

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm với ID " + productId + " không tồn tại"));

        if (!product.getStore().getId().equals(storeId)) {
            throw new IllegalArgumentException("Sản phẩm không thuộc cửa hàng này");
        }

        if (product.getCategory() == null || !product.getCategory().getId().equals(categoryId)) {
            throw new IllegalArgumentException("Sản phẩm không thuộc danh mục này");
        }

        product.setCategory(null);
        productRepo.save(product);
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