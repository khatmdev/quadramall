package com.quadra.ecommerce_api.entity.chatBot;

import com.quadra.ecommerce_api.enums.chatBot.MessageRole;
import com.quadra.ecommerce_api.enums.chatBot.MessageStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chat_messages", indexes = {
        @Index(name = "idx_message_id", columnList = "messageId"),
        @Index(name = "idx_session_id", columnList = "session_id"),
        @Index(name = "idx_user_id", columnList = "userId"),
        @Index(name = "idx_role", columnList = "role"),
        @Index(name = "idx_created_at", columnList = "createdAt"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_session_created", columnList = "session_id, createdAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "message_id", unique = true, nullable = false, length = 255)
    private String messageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession session;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50)
    private MessageRole role;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    @Builder.Default
    private MessageStatus status = MessageStatus.SENT;

    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata;

    @Column(name = "ai_response_time")
    private Long aiResponseTime;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "products_count")
    private Integer productsCount;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (messageId == null) {
            messageId = UUID.randomUUID().toString();
        }
        if (status == null) {
            status = MessageStatus.SENT;
        }
    }

    public boolean isFromUser() {
        return MessageRole.USER.equals(role);
    }

    public boolean isFromAssistant() {
        return MessageRole.ASSISTANT.equals(role);
    }

    public boolean isSystemMessage() {
        return MessageRole.SYSTEM.equals(role);
    }
}