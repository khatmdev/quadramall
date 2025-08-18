package com.quadra.ecommerce_api.dto.base.conversation;

import com.quadra.ecommerce_api.dto.base.store.StoreDTO;
import com.quadra.ecommerce_api.dto.base.user.UserDTO;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ConversationDTO {
    private Long id;
    private UserDTO customer;
    private StoreDTO store;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
