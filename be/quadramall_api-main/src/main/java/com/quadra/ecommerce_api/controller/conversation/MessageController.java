package com.quadra.ecommerce_api.controller.conversation;

import com.quadra.ecommerce_api.entity.conversation.Message;
import com.quadra.ecommerce_api.service.conversation.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService service;

    @PostMapping("/send")
    public ResponseEntity<Message> send(@RequestBody Message message) {
        return ResponseEntity.ok(service.sendMessage(message));
    }

    @PutMapping("/read/{id}")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        service.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}