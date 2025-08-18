package com.quadra.ecommerce_api.controller.customer;

import com.quadra.ecommerce_api.dto.custom.user.request.BehaviorRequest;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.service.base.UserBehaviorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/public/user/behavior")
@RequiredArgsConstructor
public class UserBehaviorController {
    private final UserBehaviorService behaviorService;

    @PostMapping
    public ResponseEntity<?> logBehavior(@RequestBody BehaviorRequest dto, @AuthenticationPrincipal User user) {
        if(user == null) {
            return ResponseEntity.ok().build();
        }
        behaviorService.logBehavior(user.getId(), dto.getProductId(), dto.getBehaviorType());
        return ResponseEntity.ok().build();
    }
}
