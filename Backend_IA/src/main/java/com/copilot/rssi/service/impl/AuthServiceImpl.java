package com.copilot.rssi.service.impl;

import com.copilot.rssi.dto.request.*;
import com.copilot.rssi.dto.response.AuthResponse;
import com.copilot.rssi.dto.response.UserResponse;
import com.copilot.rssi.entity.Role;
import com.copilot.rssi.entity.User;
import com.copilot.rssi.exception.BusinessException;
import com.copilot.rssi.exception.ResourceNotFoundException;
import com.copilot.rssi.mapper.EntityMapper;
import com.copilot.rssi.repository.RoleRepository;
import com.copilot.rssi.repository.UserRepository;
import com.copilot.rssi.service.interfaces.AuditService;
import com.copilot.rssi.service.interfaces.AuthService;
import com.copilot.rssi.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final EntityMapper mapper;
    private final AuditService auditService;

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtUtil.generateToken(userDetails);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        auditService.log(user.getId(), "LOGIN", "User", user.getId(), "Connexion réussie");

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .build();
    }

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Ce nom d'utilisateur existe déjà", HttpStatus.CONFLICT);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Cet email existe déjà", HttpStatus.CONFLICT);
        }

        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new ResourceNotFoundException("Rôle non trouvé"));

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(role)
                .enabled(true)
                .build();

        User saved = userRepository.save(user);
        auditService.log((Long) null, "CREATE_USER", "User", saved.getId(), saved.getUsername());        return mapper.toUserResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        return mapper.toUserResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(mapper::toUserResponse)
                .toList();
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request, String adminUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getEnabled() != null) user.setEnabled(request.getEnabled());
        if (request.getRole() != null) {
            Role role = roleRepository.findByName(request.getRole())
                    .orElseThrow(() -> new ResourceNotFoundException("Rôle non trouvé"));
            user.setRole(role);
        }

        User saved = userRepository.save(user);
        auditService.log(adminUsername, "UPDATE_USER", "User", id, "Modification utilisateur " + user.getUsername());
        return mapper.toUserResponse(saved);
    }

    @Override
    @Transactional
    public void deleteUser(Long id, String adminUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        if ("admin".equals(user.getUsername())) {
            throw new BusinessException("Impossible de supprimer le compte admin principal");
        }
        auditService.log(adminUsername, "DELETE_USER", "User", id, user.getUsername());
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public UserResponse resetPassword(Long id, ResetPasswordRequest request, String adminUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        User saved = userRepository.save(user);
        auditService.log(adminUsername, "RESET_PASSWORD", "User", id, user.getUsername());
        return mapper.toUserResponse(saved);
    }

    @Override
    @Transactional
    public void resetPasswordByUsername(String username, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean verifyEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        // Validate password match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("Les mots de passe ne correspondent pas", HttpStatus.BAD_REQUEST);
        }

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("Aucun utilisateur trouvé avec cet email", HttpStatus.NOT_FOUND));

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Log the action
        auditService.log(user.getId(), "FORGOT_PASSWORD", "User", user.getId(), "Réinitialisation du mot de passe");
    }
}
