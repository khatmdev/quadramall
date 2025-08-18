package com.quadra.ecommerce_api.controller.profile;

import com.quadra.ecommerce_api.controller.ImageUploadController;
import com.quadra.ecommerce_api.dto.custom.auth.response.LoginResponse;
import com.quadra.ecommerce_api.dto.custom.profile.request.ProfileRequest;
import com.quadra.ecommerce_api.dto.custom.profile.response.ProfileResponse;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.service.auth.AuthService;
import com.quadra.ecommerce_api.service.base.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;


@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
@Tag(name = "Auth" ,description = "Quản lý thông tin cá nhân")
public class ProfileController {

    private final UserService userService;
    private final AuthService authService;
    private final ImageUploadController  imageUploadController;

    @GetMapping
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal User user) {

        LoginResponse rs = authService.getUserAndResponseLoginResponse(user);

        return ResponseEntity.ok(rs);

    }


    @PostMapping("/update")
    public ResponseEntity<?> updateProfile(@ModelAttribute ProfileRequest profileRequest,
                                                              @AuthenticationPrincipal User user
                                                              ) {
        System.out.println("Update profile request: "+profileRequest);
        if(profileRequest.getFullName() != null){
            user.setFullName(profileRequest.getFullName());
        }
        if(profileRequest.getPhone() != null){
            user.setPhone(profileRequest.getPhone());
        }
        if(profileRequest.getAvatar() != null){
            ResponseEntity<String> url =imageUploadController.uploadImage(profileRequest.getAvatar());
           user.setAvatarUrl(url.getBody());
        }
        userService.save(user);
        LoginResponse rs = authService.getUserAndResponseLoginResponse(user);


        System.out.println("Update profile request: "+user);

        return ResponseEntity.ok(rs);

    }


}
