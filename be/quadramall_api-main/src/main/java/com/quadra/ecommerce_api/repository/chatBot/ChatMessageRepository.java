package com.quadra.ecommerce_api.repository.chatBot;
import com.quadra.ecommerce_api.entity.chatBot.ChatMessage;
import com.quadra.ecommerce_api.enums.chatBot.MessageRole;
import com.quadra.ecommerce_api.enums.chatBot.MessageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    Optional<ChatMessage> findByMessageId(String messageId);

    @Query("SELECT cm FROM ChatMessage cm WHERE cm.session.sessionId = :sessionId ORDER BY cm.createdAt ASC")
    List<ChatMessage> findBySessionIdOrderByCreatedAt(@Param("sessionId") String sessionId);

    @Query("SELECT cm FROM ChatMessage cm WHERE cm.session.sessionId = :sessionId ORDER BY cm.createdAt DESC")
    Page<ChatMessage> findBySessionIdOrderByCreatedAtDesc(@Param("sessionId") String sessionId, Pageable pageable);

    @Query("SELECT cm FROM ChatMessage cm WHERE cm.userId = :userId ORDER BY cm.createdAt DESC")
    Page<ChatMessage> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);

    @Query("""
        SELECT cm FROM ChatMessage cm 
        WHERE cm.session.sessionId = :sessionId 
        AND cm.createdAt >= :since 
        ORDER BY cm.createdAt DESC
        """)
    List<ChatMessage> findRecentMessagesBySessionId(@Param("sessionId") String sessionId,
                                                    @Param("since") LocalDateTime since);

    @Query("""
        SELECT cm FROM ChatMessage cm 
        WHERE cm.userId = :userId 
        AND cm.createdAt >= :since 
        ORDER BY cm.createdAt DESC
        """)
    List<ChatMessage> findRecentMessagesByUserId(@Param("userId") Long userId,
                                                 @Param("since") LocalDateTime since);

    Long countBySessionId(Long sessionId);

    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.session.sessionId = :sessionId")
    Long countBySessionSessionId(@Param("sessionId") String sessionId);

    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.userId = :userId AND cm.role = :role")
    Long countByUserIdAndRole(@Param("userId") Long userId, @Param("role") MessageRole role);

    @Query("SELECT AVG(cm.aiResponseTime) FROM ChatMessage cm WHERE cm.role = 'ASSISTANT' AND cm.aiResponseTime IS NOT NULL")
    Double getAverageResponseTime();

    @Query("""
        SELECT AVG(cm.aiResponseTime) FROM ChatMessage cm 
        WHERE cm.role = 'ASSISTANT' 
        AND cm.aiResponseTime IS NOT NULL 
        AND cm.createdAt >= :since
        """)
    Double getAverageResponseTimeSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.createdAt >= :since")
    Long countMessagesCreatedSince(@Param("since") LocalDateTime since);

    @Query("""
        SELECT cm FROM ChatMessage cm 
        WHERE cm.session.sessionId = :sessionId 
        AND cm.role = :role 
        ORDER BY cm.createdAt DESC 
        LIMIT :limit
        """)
    List<ChatMessage> findLatestMessagesBySessionAndRole(@Param("sessionId") String sessionId,
                                                         @Param("role") MessageRole role,
                                                         @Param("limit") int limit);

    @Query("""
        SELECT cm FROM ChatMessage cm 
        WHERE cm.userId = :userId 
        AND cm.status = :status 
        ORDER BY cm.createdAt DESC
        """)
    List<ChatMessage> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") MessageStatus status);

    @Query("""
        SELECT COUNT(cm) FROM ChatMessage cm 
        WHERE cm.session.sessionId = :sessionId 
        AND cm.role = 'ASSISTANT' 
        AND cm.productsCount > 0
        """)
    Long countProductMessages(@Param("sessionId") String sessionId);
}