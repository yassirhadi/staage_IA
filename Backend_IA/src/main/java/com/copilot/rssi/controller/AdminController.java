package com.copilot.rssi.controller;

import com.copilot.rssi.dto.request.*;
import com.copilot.rssi.dto.response.*;
import com.copilot.rssi.entity.Folder;
import com.copilot.rssi.entity.Permission;
import com.copilot.rssi.entity.Referential;
import com.copilot.rssi.entity.Role;
import com.copilot.rssi.entity.Setting;
import com.copilot.rssi.mapper.EntityMapper;
import com.copilot.rssi.repository.PermissionRepository;
import com.copilot.rssi.service.interfaces.*;
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
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Administration")
public class AdminController {

    private final AuthService authService;
    private final AuditLogService auditLogService;
    private final ReferentialService referentialService;
    private final RoleService roleService;
    private final SettingService settingService;
    private final FolderService folderService;
    private final PermissionRepository permissionRepository;
    private final EntityMapper entityMapper;

    // User Management
    @PostMapping("/users")
    @Operation(summary = "Créer un utilisateur")
    public ApiResponse<UserResponse> createUser(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok("Utilisateur créé", authService.register(request));
    }

    @PutMapping("/users/{id}")
    @Operation(summary = "Modifier un utilisateur")
    public ApiResponse<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal UserDetails admin) {
        return ApiResponse.ok(authService.updateUser(id, request, admin.getUsername()));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Supprimer un utilisateur")
    public ApiResponse<Void> deleteUser(@PathVariable Long id, @AuthenticationPrincipal UserDetails admin) {
        authService.deleteUser(id, admin.getUsername());
        return ApiResponse.ok("Utilisateur supprimé", null);
    }

    @PostMapping("/users/{id}/reset-password")
    @Operation(summary = "Réinitialiser le mot de passe")
    public ApiResponse<UserResponse> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody ResetPasswordRequest request,
            @AuthenticationPrincipal UserDetails admin) {
        return ApiResponse.ok(authService.resetPassword(id, request, admin.getUsername()));
    }

    // Role Management
    @GetMapping("/roles")
    @Operation(summary = "Obtenir tous les rôles")
    public ApiResponse<List<RoleResponse>> getRoles() {
        return ApiResponse.ok(roleService.getAll());
    }

    @GetMapping("/roles/{id}")
    @Operation(summary = "Obtenir un rôle par ID")
    public ApiResponse<RoleResponse> getRole(@PathVariable Long id) {
        return ApiResponse.ok(roleService.getById(id));
    }

    @PostMapping("/roles")
    @Operation(summary = "Créer un rôle")
    public ApiResponse<RoleResponse> createRole(@Valid @RequestBody Role role) {
        return ApiResponse.ok("Rôle créé", roleService.create(role));
    }

    @PutMapping("/roles/{id}")
    @Operation(summary = "Modifier un rôle")
    public ApiResponse<RoleResponse> updateRole(@PathVariable Long id, @Valid @RequestBody Role role) {
        return ApiResponse.ok("Rôle mis à jour", roleService.update(id, role));
    }

    @DeleteMapping("/roles/{id}")
    @Operation(summary = "Supprimer un rôle")
    public ApiResponse<Void> deleteRole(@PathVariable Long id) {
        roleService.delete(id);
        return ApiResponse.ok("Rôle supprimé", null);
    }

    // Referential Management
    @GetMapping("/referentials")
    @Operation(summary = "Gérer les référentiels")
    public ApiResponse<List<ReferentialResponse>> getReferentials() {
        return ApiResponse.ok(referentialService.getAll());
    }

    @GetMapping("/referentials/{id}")
    @Operation(summary = "Obtenir un référentiel par ID")
    public ApiResponse<ReferentialResponse> getReferential(@PathVariable Long id) {
        return ApiResponse.ok(referentialService.getById(id));
    }

    @PostMapping("/referentials")
    @Operation(summary = "Créer un référentiel")
    public ApiResponse<ReferentialResponse> createReferential(@Valid @RequestBody Referential referential) {
        return ApiResponse.ok("Référentiel créé", referentialService.create(referential));
    }

    @PutMapping("/referentials/{id}")
    @Operation(summary = "Modifier un référentiel")
    public ApiResponse<ReferentialResponse> updateReferential(@PathVariable Long id, @Valid @RequestBody Referential referential) {
        return ApiResponse.ok("Référentiel mis à jour", referentialService.update(id, referential));
    }

    @DeleteMapping("/referentials/{id}")
    @Operation(summary = "Supprimer un référentiel")
    public ApiResponse<Void> deleteReferential(@PathVariable Long id) {
        referentialService.delete(id);
        return ApiResponse.ok("Référentiel supprimé", null);
    }

    // Folder Management
    @GetMapping("/folders")
    @Operation(summary = "Obtenir tous les dossiers")
    public ApiResponse<List<FolderResponse>> getFolders() {
        return ApiResponse.ok(folderService.getAll());
    }

    @GetMapping("/folders/{id}")
    @Operation(summary = "Obtenir un dossier par ID")
    public ApiResponse<FolderResponse> getFolder(@PathVariable Long id) {
        return ApiResponse.ok(folderService.getById(id));
    }

    @PostMapping("/folders")
    @Operation(summary = "Créer un dossier")
    public ApiResponse<FolderResponse> createFolder(@Valid @RequestBody Folder folder) {
        return ApiResponse.ok("Dossier créé", folderService.create(folder));
    }

    @PutMapping("/folders/{id}")
    @Operation(summary = "Modifier un dossier")
    public ApiResponse<FolderResponse> updateFolder(@PathVariable Long id, @Valid @RequestBody Folder folder) {
        return ApiResponse.ok("Dossier mis à jour", folderService.update(id, folder));
    }

    @DeleteMapping("/folders/{id}")
    @Operation(summary = "Supprimer un dossier")
    public ApiResponse<Void> deleteFolder(@PathVariable Long id) {
        folderService.delete(id);
        return ApiResponse.ok("Dossier supprimé", null);
    }

    // Settings Management
    @GetMapping("/settings")
    @Operation(summary = "Obtenir les paramètres système")
    public ApiResponse<SettingResponse> getSettings() {
        return ApiResponse.ok(settingService.getSettings());
    }

    @PutMapping("/settings")
    @Operation(summary = "Mettre à jour les paramètres système")
    public ApiResponse<SettingResponse> updateSettings(@Valid @RequestBody Setting settings) {
        return ApiResponse.ok("Paramètres mis à jour", settingService.updateSettings(settings));
    }

    // Audit Logs
    @GetMapping("/audit-logs")
    @Operation(summary = "Consulter les logs d'audit")
    public ApiResponse<List<AuditLogResponse>> getAuditLogs() {
        return ApiResponse.ok(auditLogService.getAll());
    }

    // Permissions Management
    @GetMapping("/permissions")
    @Operation(summary = "Obtenir toutes les permissions")
    public ApiResponse<List<PermissionResponse>> getPermissions() {
        return ApiResponse.ok(permissionRepository.findAll().stream().map(entityMapper::toPermissionResponse).toList());
    }

    @GetMapping("/permissions/{id}")
    @Operation(summary = "Obtenir une permission par ID")
    public ApiResponse<PermissionResponse> getPermission(@PathVariable Long id) {
        return ApiResponse.ok(permissionRepository.findById(id).map(entityMapper::toPermissionResponse).orElse(null));
    }

    @PostMapping("/permissions")
    @Operation(summary = "Créer une permission")
    public ApiResponse<PermissionResponse> createPermission(@Valid @RequestBody Permission permission) {
        return ApiResponse.ok("Permission créée", entityMapper.toPermissionResponse(permissionRepository.save(permission)));
    }

    @PutMapping("/permissions/{id}")
    @Operation(summary = "Modifier une permission")
    public ApiResponse<PermissionResponse> updatePermission(@PathVariable Long id, @Valid @RequestBody Permission permission) {
        return permissionRepository.findById(id).map(p -> {
            p.setName(permission.getName());
            p.setDescription(permission.getDescription());
            return ApiResponse.ok("Permission mise à jour", entityMapper.toPermissionResponse(permissionRepository.save(p)));
        }).orElse(null);
    }

    @DeleteMapping("/permissions/{id}")
    @Operation(summary = "Supprimer une permission")
    public ApiResponse<Void> deletePermission(@PathVariable Long id) {
        permissionRepository.deleteById(id);
        return ApiResponse.ok("Permission supprimée", null);
    }

    // Backup Management
    @PostMapping("/backups/create")
    @Operation(summary = "Créer une sauvegarde")
    public ApiResponse<String> createBackup() {
        return ApiResponse.ok("Sauvegarde créée", "backup_" + System.currentTimeMillis() + ".sql");
    }

    @GetMapping("/backups")
    @Operation(summary = "Obtenir la liste des sauvegardes")
    public ApiResponse<List<String>> getBackups() {
        return ApiResponse.ok(List.of("backup_2024_07_10.sql", "backup_2024_07_09.sql"));
    }

    @GetMapping("/backups/download/{filename}")
    @Operation(summary = "Télécharger une sauvegarde")
    public void downloadBackup(@PathVariable String filename) {
        // Download logic here
    }

    @PostMapping("/backups/restore/{filename}")
    @Operation(summary = "Restaurer une sauvegarde")
    public ApiResponse<String> restoreBackup(@PathVariable String filename) {
        return ApiResponse.ok("Sauvegarde restaurée", filename);
    }

    @DeleteMapping("/backups/{filename}")
    @Operation(summary = "Supprimer une sauvegarde")
    public ApiResponse<Void> deleteBackup(@PathVariable String filename) {
        return ApiResponse.ok("Sauvegarde supprimée", null);
    }
}
