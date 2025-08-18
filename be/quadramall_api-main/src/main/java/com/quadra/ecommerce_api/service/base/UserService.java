package com.quadra.ecommerce_api.service.base;

import com.quadra.ecommerce_api.dto.base.user.UserDTO;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.mapper.base.user.UserMapper;
import com.quadra.ecommerce_api.repository.user.UserRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepo userRepo;
    private UserMapper userMapper;

    @Autowired
    public UserService(UserRepo userRepo, UserMapper userMapper) {
        this.userRepo = userRepo;
        this.userMapper = userMapper;
    }

    @Transactional
    public void save(User user) {
        userRepo.save(user);
    }

    @Transactional
    public boolean existsByEmail(String email) {
        return userRepo.existsByEmail(email);
    }

    public List<UserDTO> getUsers() {
        List<User> users = userRepo.findAll();
        return users.stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }
}
