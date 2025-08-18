package com.quadra.ecommerce_api.repository.user;

import com.quadra.ecommerce_api.entity.user.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepo  extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String buyer);
}
