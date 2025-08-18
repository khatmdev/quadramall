package com.quadra.ecommerce_api.repository.conversation;

import com.quadra.ecommerce_api.entity.conversation.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepo extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByCustomerIdAndStoreId(Long customerId, Long storeId);

    List<Conversation> findByCustomerIdOrderByUpdatedAtDesc(Long customerId);
    
    List<Conversation> findByStoreIdOrderByUpdatedAtDesc(Long storeId);

    @Query("SELECT COUNT(c) FROM Conversation c WHERE c.store.id = :storeId")
    long countByStoreId(Long storeId);

    @Query("SELECT COUNT(DISTINCT m.conversation.id) FROM Message m WHERE m.sender.id = :storeOwnerId AND m.conversation.store.id = :storeId")
    long countRespondedConversationsByStoreId(Long storeId, Long storeOwnerId);
}
