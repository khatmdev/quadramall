package com.quadra.ecommerce_api.repository.store;


import com.quadra.ecommerce_api.entity.store.SellerRegistration;
import com.quadra.ecommerce_api.enums.store.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SellerRegistrationRepo extends JpaRepository<SellerRegistration, Long> {

    List<SellerRegistration> findByStatus(RegistrationStatus status);

    Optional<SellerRegistration> findByUserId(Long userId);

    boolean existsByUserIdAndStatus(Long userId, RegistrationStatus status);

    List<SellerRegistration> findAllByUserId(Long userId);

    boolean existsByUserEmailAndStatus(String email, RegistrationStatus status);

    Optional<SellerRegistration> findByIdAndStatus(Long id, RegistrationStatus status);

    /**
     * Tìm đăng ký theo email user
     */
    Optional<SellerRegistration> findByUserEmail(String email);

    /**
     * Tìm đăng ký theo user ID và status
     */
    Optional<SellerRegistration> findByUserIdAndStatus(Long userId, RegistrationStatus status);

    /**
     * Tìm đăng ký mới nhất của user (theo thời gian tạo)
     */
    Optional<SellerRegistration> findFirstByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<SellerRegistration> findFirstByUserIdAndStatusInOrderByCreatedAtDesc(Long userId, List<RegistrationStatus> statuses);
}
