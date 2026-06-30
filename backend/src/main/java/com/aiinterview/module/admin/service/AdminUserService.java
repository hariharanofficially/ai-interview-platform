package com.aiinterview.module.admin.service;

import com.aiinterview.common.exception.ResourceNotFoundException;
import com.aiinterview.common.response.PagedResponse;
import com.aiinterview.module.admin.dto.UserAdminResponse;
import com.aiinterview.module.auth.entity.User;
import com.aiinterview.module.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PagedResponse<UserAdminResponse> getUsers(int page, int size, String sort, String direction) {
        Sort.Direction sortDirection = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));

        Page<User> userPage = userRepository.findAll(pageable);
        return new PagedResponse<>(userPage.map(this::mapToAdminResponse));
    }

    @Transactional
    public void updateUserStatus(UUID userId, boolean active) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        userRepository.updateActiveStatus(userId, active);
    }

    private UserAdminResponse mapToAdminResponse(User user) {
        return UserAdminResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
