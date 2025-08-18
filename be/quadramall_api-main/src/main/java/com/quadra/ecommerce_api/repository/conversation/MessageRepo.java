package com.quadra.ecommerce_api.repository.conversation;

import com.quadra.ecommerce_api.entity.conversation.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepo extends JpaRepository<Message, Long> {
    List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
    
    void deleteByConversationId(Long conversationId);
}
