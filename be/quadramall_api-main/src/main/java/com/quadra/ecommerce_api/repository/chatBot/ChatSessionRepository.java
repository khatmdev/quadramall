package com.quadra.ecommerce_api.repository.chatBot;
import com.quadra.ecommerce_api.entity.chatBot.ChatSession;
import com.quadra.ecommerce_api.enums.chatBot.SessionStatus;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

    Optional<ChatSession> findBySessionId(String sessionId);

    Optional<ChatSession> findByConversationId(String conversationId);

    List<ChatSession> findByUserIdOrderByLastActivityDesc(Long userId);

    Page<ChatSession> findByUserIdOrderByLastActivityDesc(Long userId, Pageable pageable);

    @Query("SELECT cs FROM ChatSession cs WHERE cs.userId = :userId AND cs.status = :status ORDER BY cs.lastActivity DESC")
    List<ChatSession> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") SessionStatus status);

    @Query("SELECT cs FROM ChatSession cs WHERE cs.userId = :userId AND cs.status = 'ACTIVE' ORDER BY cs.lastActivity DESC LIMIT 1")
    Optional<ChatSession> findLatestActiveSessionByUserId(@Param("userId") Long userId);

    @Query("SELECT cs FROM ChatSession cs WHERE cs.lastActivity < :cutoffTime AND cs.status = 'ACTIVE'")
    List<ChatSession> findExpiredActiveSessions(@Param("cutoffTime") LocalDateTime cutoffTime);

    @Query("SELECT cs FROM ChatSession cs WHERE cs.lastActivity < :cutoffTime")
    List<ChatSession> findSessionsOlderThan(@Param("cutoffTime") LocalDateTime cutoffTime);

    Long countByUserIdAndStatus(Long userId, SessionStatus status);

    Long countByStatus(SessionStatus status);

    @Query("SELECT COUNT(cs) FROM ChatSession cs WHERE cs.createdAt >= :since")
    Long countSessionsCreatedSince(@Param("since") LocalDateTime since);

    @Modifying
    @Query("UPDATE ChatSession cs SET cs.status = :newStatus WHERE cs.lastActivity < :cutoffTime AND cs.status = :currentStatus")
    int updateExpiredSessions(@Param("cutoffTime") LocalDateTime cutoffTime,
                              @Param("currentStatus") SessionStatus currentStatus,
                              @Param("newStatus") SessionStatus newStatus);

    @Modifying
    @Query("DELETE FROM ChatSession cs WHERE cs.lastActivity < :cutoffTime AND cs.status = :status")
    int deleteOldSessions(@Param("cutoffTime") LocalDateTime cutoffTime, @Param("status") SessionStatus status);

    @Query("SELECT AVG(cs.messageCount) FROM ChatSession cs WHERE cs.status = 'CLOSED'")
    Double getAverageMessagesPerSession();

    @Query("""
        SELECT cs FROM ChatSession cs 
        WHERE cs.userId = :userId 
        AND cs.conversationType = :conversationType 
        AND cs.status = 'ACTIVE' 
        ORDER BY cs.lastActivity DESC 
        LIMIT 1
        """)
    Optional<ChatSession> findActiveSessionByUserAndType(@Param("userId") Long userId,
                                                         @Param("conversationType") String conversationType);
}