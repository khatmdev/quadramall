package com.quadra.ecommerce_api.repository.user;

import com.quadra.ecommerce_api.entity.user.UserBehaviorLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserBehaviorLogRepo extends JpaRepository<UserBehaviorLog, Long> {
}
