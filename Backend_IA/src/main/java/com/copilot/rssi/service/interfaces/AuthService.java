package com.copilot.rssi.service.interfaces;

import com.copilot.rssi.dto.request.ForgotPasswordRequest;
import com.copilot.rssi.dto.request.LoginRequest;
import com.copilot.rssi.dto.request.RegisterRequest;
import com.copilot.rssi.dto.request.ResetPasswordRequest;
import com.copilot.rssi.dto.request.UpdateUserRequest;
import com.copilot.rssi.dto.response.AuthResponse;
import com.copilot.rssi.dto.response.UserResponse;

import java.util.List;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    UserResponse register(RegisterRequest request);
    UserResponse getCurrentUser(String username);
    List<UserResponse> getAllUsers();
    UserResponse updateUser(Long id, UpdateUserRequest request, String adminUsername);
    void deleteUser(Long id, String adminUsername);
    UserResponse resetPassword(Long id, ResetPasswordRequest request, String adminUsername);
    void resetPasswordByUsername(String username, String newPassword);
    boolean verifyEmail(String email);
    void forgotPassword(ForgotPasswordRequest request);
}
