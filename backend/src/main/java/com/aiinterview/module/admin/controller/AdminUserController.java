package com.aiinterview.module.admin.controller;

import com.aiinterview.common.response.ApiResponse;
import com.aiinterview.common.response.PagedResponse;
import com.aiinterview.module.admin.dto.UserAdminResponse;
import com.aiinterview.module.admin.service.AdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin - User Management", description = "Endpoints for admins to manage users")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    @Operation(summary = "Get paginated list of all users")
    public ResponseEntity<ApiResponse<PagedResponse<UserAdminResponse>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        
        PagedResponse<UserAdminResponse> users = adminUserService.getUsers(page, size, sort, direction);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @PutMapping("/{id}/suspend")
    @Operation(summary = "Suspend a user account")
    public ResponseEntity<ApiResponse<Void>> suspendUser(@PathVariable UUID id) {
        adminUserService.updateUserStatus(id, false);
        return ResponseEntity.ok(ApiResponse.success("User suspended successfully", null));
    }

    @PutMapping("/{id}/activate")
    @Operation(summary = "Activate a user account")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable UUID id) {
        adminUserService.updateUserStatus(id, true);
        return ResponseEntity.ok(ApiResponse.success("User activated successfully", null));
    }
}
