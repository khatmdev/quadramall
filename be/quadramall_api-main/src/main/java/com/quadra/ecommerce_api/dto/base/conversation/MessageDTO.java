package com.quadra.ecommerce_api.dto.base.conversation;

import com.quadra.ecommerce_api.dto.base.user.UserDTO;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MessageDTO {
    private Long id;
    private ConversationDTO conversation;
    private UserDTO sender;
    private String messageText;
    private String imageUrl;
    private String videoUrl;
    private LocalDateTime createdAt;
}
