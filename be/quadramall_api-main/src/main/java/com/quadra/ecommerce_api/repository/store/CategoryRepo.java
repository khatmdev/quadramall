package com.quadra.ecommerce_api.repository.store;

import com.quadra.ecommerce_api.entity.store.Category;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepo extends JpaRepository<Category, Long> {
    @Query("SELECT c FROM Category c WHERE c.store.id = :storeId")
    List<Category> findByStoreId(Long storeId);


    @Query("SELECT c.id FROM Category c WHERE c.id = :categoryId OR c.parent.id = :categoryId")
    List<Long> findAllDescendantIds(@Param("categoryId") Long categoryId);

    @Query("SELECT c FROM Category c WHERE c.slug = :slug AND c.store.id = :storeId")
    Optional<Category> findBySlugAndStoreId(String slug, Long storeId);

    @Query("SELECT c FROM Category c WHERE c.id = :parentId AND c.store.id = :storeId")
    Optional<Category> findByIdAndStoreId(Long parentId, Long storeId);

    @Query("SELECT COUNT(c) FROM Category c WHERE c.store.id = :storeId")
    Long countByStoreId(Long storeId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.store.id = :storeId AND p.isActive = true AND p.category.id IS NOT NULL")
    Long countProductsWithCategoryByStoreId(Long storeId);
}
