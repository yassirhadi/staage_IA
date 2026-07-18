package com.copilot.rssi.config;

import com.copilot.rssi.entity.Asset;
import com.copilot.rssi.entity.Referential;
import com.copilot.rssi.entity.Role;
import com.copilot.rssi.entity.User;
import com.copilot.rssi.entity.enums.AssetType;
import com.copilot.rssi.entity.enums.AssetStatus;
import com.copilot.rssi.entity.enums.Criticality;
import com.copilot.rssi.entity.enums.RoleName;
import com.copilot.rssi.repository.AssetRepository;
import com.copilot.rssi.repository.ReferentialRepository;
import com.copilot.rssi.repository.RoleRepository;
import com.copilot.rssi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final ReferentialRepository referentialRepository;
    private final AssetRepository assetRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initRoles();
        initDefaultUsers();
        initReferentials();
        initDefaultAssets();
    }

    private void initRoles() {
        for (RoleName roleName : RoleName.values()) {
            roleRepository.findByName(roleName).orElseGet(() -> {
                String description = switch (roleName) {
                    case ADMIN -> "Administrateur système";
                    case RSSI -> "Responsable Sécurité SI";
                    case AUDITEUR -> "Auditeur de sécurité";
                    case LECTEUR -> "Lecteur seul";
                };
                Role role = Role.builder()
                        .name(roleName)
                        .description(description)
                        .build();
                log.info("Création du rôle: {}", roleName);
                return roleRepository.save(role);
            });
        }
    }

    private void initDefaultUsers() {
        // Always reset passwords for debug purposes
        Role adminRole = roleRepository.findByName(RoleName.ADMIN).orElseThrow();
        Role rssiRole = roleRepository.findByName(RoleName.RSSI).orElseThrow();

        if (!userRepository.existsByUsername("admin")) {
            userRepository.save(User.builder()
                    .username("admin")
                    .email("admin@copilot-rssi.ma")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("Admin")
                    .lastName("System")
                    .role(adminRole)
                    .enabled(true)
                    .build());
            log.info("Utilisateur admin créé (admin / admin123)");
        } else {
            // Reset admin password
            User admin = userRepository.findByUsername("admin").orElseThrow();
            admin.setPassword(passwordEncoder.encode("admin123"));
            userRepository.save(admin);
            log.info("Mot de passe admin réinitialisé (admin / admin123)");
        }

        if (!userRepository.existsByUsername("rssi")) {
            userRepository.save(User.builder()
                    .username("rssi")
                    .email("rssi@copilot-rssi.ma")
                    .password(passwordEncoder.encode("rssi123"))
                    .firstName("Responsable")
                    .lastName("SSI")
                    .role(rssiRole)
                    .enabled(true)
                    .build());
            log.info("Utilisateur RSSI créé (rssi / rssi123)");
        } else {
            // Reset rssi password
            User rssi = userRepository.findByUsername("rssi").orElseThrow();
            rssi.setPassword(passwordEncoder.encode("rssi123"));
            userRepository.save(rssi);
            log.info("Mot de passe RSSI réinitialisé (rssi / rssi123)");
        }
    }

    private void initReferentials() {
        seedReferential("ISO27001", "ISO/IEC 27001", "NORME",
                "Système de management de la sécurité de l'information (SMSI). Exigences pour établir, mettre en œuvre et améliorer un SMSI.",
                "2022");
        seedReferential("NIST-CSF", "NIST Cybersecurity Framework", "NORME",
                "5 fonctions: Identify, Protect, Detect, Respond, Recover. Cadre de référence pour la cybersécurité.",
                "2.0");
        seedReferential("CIS-CONTROLS", "CIS Controls", "NORME",
                "18 contrôles de sécurité priorités pour protéger les organisations contre les cyberattaques.",
                "v8");
        seedReferential("LOI-09-08", "Loi 09-08 - Protection des données personnelles", "LOI",
                "Loi marocaine relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel.",
                "2009");
        seedReferential("POL-SSI", "Politique SSI interne", "POLITIQUE",
                "Classification: Public, Interne, Confidentiel, Très confidentiel. Les PII doivent être classifiées Confidentiel minimum.",
                "1.0");
    }

    private void seedReferential(String code, String name, String category, String content, String version) {
        referentialRepository.findByCode(code).orElseGet(() ->
                referentialRepository.save(Referential.builder()
                        .code(code)
                        .name(name)
                        .category(category)
                        .content(content)
                        .version(version)
                        .active(true)
                        .build()));
    }

    private void initDefaultAssets() {
        seedAsset("Serveur Principal", AssetType.MATERIEL, "Serveur de production", Criticality.ELEVEE);
        seedAsset("Routeur Cisco", AssetType.MATERIEL, "Routeur réseau principal", Criticality.ELEVEE);
        seedAsset("Switch Réseau", AssetType.MATERIEL, "Switch VLAN entreprise", Criticality.MOYENNE);
        seedAsset("Firewall Fortinet", AssetType.MATERIEL, "Pare-feu périmétrique", Criticality.CRITIQUE);
        seedAsset("ERP Interne", AssetType.LOGICIEL, "Application ERP", Criticality.ELEVEE);
        seedAsset("Antivirus EDR", AssetType.LOGICIEL, "Solution endpoint protection", Criticality.ELEVEE);
        seedAsset("Base MySQL copilot_rssi", AssetType.LOGICIEL, "Base de données applicative", Criticality.ELEVEE);
        seedAsset("Politique SSI", AssetType.ORGANISATIONNEL, "Document de gouvernance SSI", Criticality.CRITIQUE);
    }

    private void seedAsset(String name, AssetType type, String desc, Criticality criticality) {
        if (assetRepository.findByNameContainingIgnoreCase(name).isEmpty()) {
            assetRepository.save(Asset.builder()
                    .name(name)
                    .assetType(type)
                    .description(desc)
                    .owner("RSSI")
                    .criticality(criticality)
                    .status(AssetStatus.ACTIF)
                    .build());
        }
    }
}
