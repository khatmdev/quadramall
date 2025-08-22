package com.quadra.ecommerce_api.entity.chatBot;


import com.quadra.ecommerce_api.enums.chatBot.SessionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "chat_sessions", indexes = {
        @Index(name = "idx_session_id", columnList = "sessionId"),
        @Index(name = "idx_user_id", columnList = "userId"),
        @Index(name = "idx_conversation_id", columnList = "conversationId"),
        @Index(name = "idx_last_activity", columnList = "lastActivity"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_user_status", columnList = "userId, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", unique = true, nullable = false, length = 255)
    private String sessionId;

    @Column(name = "conversation_id", length = 255)
    private String conversationId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private com.quadra.ecommerce_api.enums.chatBot.SessionStatus status = SessionStatus.ACTIVE;

    @Column(name = "conversation_type", length = 100)
    private String conversationType;

    @Column(name = "current_topic", length = 255)
    private String currentTopic;

    @Column(name = "message_count")
    @Builder.Default
    private Integer messageCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "last_activity", nullable = false)
    private LocalDateTime lastActivity;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ChatMessage> messages = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (sessionId == null) {
            sessionId = UUID.randomUUID().toString();
        }
        if (status == null) {
            status = SessionStatus.INACTIVE;
        }
        if (messageCount == null) {
            messageCount = 0;
        }
    }

    public void addMessage(ChatMessage message) {
        messages.add(message);
        message.setSession(this);
        messageCount = messages.size();
        lastActivity = LocalDateTime.now();
    }

    public void incrementMessageCount() {
        this.messageCount = this.messageCount == null ? 1 : this.messageCount + 1;
        this.lastActivity = LocalDateTime.now();
    }

    public boolean isExpired(int timeoutHours) {
        return lastActivity.isBefore(LocalDateTime.now().minusHours(timeoutHours));
    }
}