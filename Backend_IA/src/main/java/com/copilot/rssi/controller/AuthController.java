package com.copilot.rssi.controller;

import com.copilot.rssi.dto.request.ForgotPasswordRequest;
import com.copilot.rssi.dto.request.LoginRequest;
import com.copilot.rssi.dto.request.VerifyEmailRequest;
import com.copilot.rssi.dto.response.ApiResponse;
import com.copilot.rssi.dto.response.AuthResponse;
import com.copilot.rssi.dto.response.UserResponse;
import com.copilot.rssi.service.interfaces.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Connexion utilisateur")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request));
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Vérifier si l'email existe dans la base de données")
    public ApiResponse<Boolean> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        boolean exists = authService.verifyEmail(request.getEmail());
        return ApiResponse.ok(exists);
    }

    @PostMapping("/reset-password-with-email")
    @Operation(summary = "Réinitialiser le mot de passe après vérification de l'email")
    public ApiResponse<String> resetPasswordWithEmail(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ApiResponse.ok("Mot de passe réinitialisé avec succès");
    }

    @GetMapping("/me")
    @Operation(summary = "Profil utilisateur connecté")
    public ApiResponse<UserResponse> me(@AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.ok(authService.getCurrentUser(userDetails.getUsername()));
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Liste des utilisateurs")
    public ApiResponse<List<UserResponse>> getAllUsers() {
        return ApiResponse.ok(authService.getAllUsers());
    }

    @PostMapping("/reset-password/{username}")
    @Operation(summary = "Réinitialiser le mot de passe (Debug)")
    public ApiResponse<String> resetPassword(@PathVariable String username) {
        try {
            authService.resetPasswordByUsername(username, "rssi123");
            return ApiResponse.ok("Mot de passe réinitialisé à rssi123 pour " + username);
        } catch (Exception e) {
            return ApiResponse.error("Erreur lors de la réinitialisation: " + e.getMessage());
        }
    }

    @GetMapping("/debug/users")
    @Operation(summary = "Liste des utilisateurs (Debug - No Auth)")
    public ApiResponse<String> debugUsers() {
        try {
            List<String> users = authService.getAllUsers().stream()
                .map(u -> u.getUsername() + " - " + u.getRole())
                .toList();
            return ApiResponse.ok("Utilisateurs: " + String.join(", ", users));
        } catch (Exception e) {
            return ApiResponse.error("Erreur: " + e.getMessage());
        }
    }
}
