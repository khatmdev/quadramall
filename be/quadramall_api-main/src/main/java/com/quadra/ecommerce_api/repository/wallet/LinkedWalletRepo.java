package com.quadra.ecommerce_api.repository.wallet;

import com.quadra.ecommerce_api.entity.wallet.LinkedWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LinkedWalletRepo extends JpaRepository<LinkedWallet, Long> {
}