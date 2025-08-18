package com.quadra.ecommerce_api.repository.store;

import com.quadra.ecommerce_api.dto.custom.store.response.StoreHomeResponseDTO;
import com.quadra.ecommerce_api.entity.store.Store;
import com.quadra.ecommerce_api.enums.store.StoreStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreRepo extends JpaRepository<Store, Long> {

    /**
     * Tìm top 10 stores có rating trung bình cao nhất
     * Join với Product, ProductVariant, OrderItem và ProductReview để tính rating
     * @param pageable Thông tin phân trang để giới hạn kết quả
     * @return Danh sách StoreHomeResponseDTO với thông tin store và rating
     */
    @Query("SELECT new com.quadra.ecommerce_api.dto.custom.store.response.StoreHomeResponseDTO(" +
            "s.id, s.name, COALESCE(AVG(pr.rating), 0), s.slug, s.logoUrl) " +
            "FROM Store s " +
            "LEFT JOIN Product p ON p.store = s " +
            "LEFT JOIN ProductVariant pv ON pv.product = p " +
            "LEFT JOIN OrderItem oi ON oi.variant = pv " +
            "LEFT JOIN ProductReview pr ON pr.orderItem = oi " +
            "GROUP BY s.id, s.name " +
            "ORDER BY AVG(pr.rating) DESC")
    List<StoreHomeResponseDTO> findTop10StoresByAverageRating(Pageable pageable);

    /**
     * Tìm top stores theo loại sản phẩm và rating
     * Lọc stores có sản phẩm thuộc các itemType được chỉ định
     * @param itemTypeIds Danh sách ID của item types cần lọc
     * @param pageable Thông tin phân trang
     * @return Danh sách stores có sản phẩm thuộc itemTypes được sắp xếp theo rating
     */
    @Query("""
        SELECT new com.quadra.ecommerce_api.dto.custom.store.response.StoreHomeResponseDTO(
            s.id, s.name, COALESCE(AVG(pr.rating), 0), s.slug, s.logoUrl
        )
        FROM Store s
        LEFT JOIN Product p ON p.store = s
        LEFT JOIN ProductVariant pv ON pv.product = p
        LEFT JOIN OrderItem oi ON oi.variant = pv
        LEFT JOIN ProductReview pr ON pr.orderItem = oi
        WHERE s.id IN (
            SELECT DISTINCT s2.id
            FROM Store s2
            JOIN Product p2 ON p2.store = s2
            WHERE (:itemTypeIds IS NULL OR p2.itemType.id IN :itemTypeIds)
        )
        GROUP BY s.id, s.name, s.slug, s.logoUrl
        ORDER BY AVG(pr.rating) DESC
    """)
    List<StoreHomeResponseDTO> findTopStoresByItemTypeIds(
            @Param("itemTypeIds") List<Long> itemTypeIds,
            Pageable pageable
    );

    /**
     * Tìm tất cả stores thuộc sở hữu của một user
     * @param ownerId ID của user owner
     * @return Danh sách stores thuộc sở hữu của user
     */
    List<Store> findByOwnerId(Long ownerId);

    /**
     * Kiểm tra xem một store có thuộc sở hữu của user không
     * @param storeId ID của store cần kiểm tra
     * @param ownerId ID của user owner
     * @return true nếu store thuộc sở hữu của user, false nếu không
     */
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Store s WHERE s.id = :storeId AND s.owner.id = :ownerId")
    boolean existsByIdAndOwnerId(Long storeId, Long ownerId);

    /**
     * Kiểm tra xem slug của store đã tồn tại chưa
     * @param slug Slug cần kiểm tra
     * @return true nếu slug đã tồn tại, false nếu chưa
     */
    boolean existsBySlug(String slug);

    /**
     * Tìm stores theo status và include thông tin owner
     * @param status Status của store cần lọc (null để lấy tất cả)
     * @return Danh sách stores với thông tin owner
     */
    @Query("SELECT s, u FROM Store s LEFT JOIN s.owner u WHERE :status IS NULL OR s.status = :status")
    List<Store> findStoresByStatus(@Param("status") StoreStatus status);

    /**
     * Tìm store theo slug và status
     * @param slug Slug của store
     * @param status Status của store
     * @return Optional chứa store nếu tìm thấy
     */
    Optional<Store> findBySlugAndStatus(String slug, StoreStatus status);

    /**
     * Kiểm tra user có store nào không
     * @param ownerId ID của user owner
     * @return true nếu user có ít nhất 1 store, false nếu không có store nào
     */
    boolean existsByOwnerId(Long ownerId);

    /**
     * Đếm số lượng stores của một user
     * @param ownerId ID của user owner
     * @return Số lượng stores thuộc sở hữu của user
     */
    long countByOwnerId(Long ownerId);

    /**
     * Tìm stores của user theo status cụ thể
     * @param ownerId ID của user owner
     * @param status Status của stores cần tìm
     * @return Danh sách stores của user có status được chỉ định
     */
    List<Store> findByOwnerIdAndStatus(Long ownerId, StoreStatus status);
}