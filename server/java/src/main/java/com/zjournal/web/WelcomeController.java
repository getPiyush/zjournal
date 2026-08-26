package com.zjournal.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Plaintext, unencrypted endpoints (matching the "/" root response in server/php/index.php)
 * kept outside the EncryptionFilter's envelope so the server is reachable without a client
 * that speaks the PBKDF2/AES envelope, e.g. for health checks.
 */
@Tag(name = "Health", description = "Always unencrypted, regardless of zjournal.encryption-enabled")
@RestController
public class WelcomeController {

    @Operation(summary = "Welcome message")
    @GetMapping("/")
    public String welcome() {
        return "Welcome to zjournal Feeder";
    }

    @Operation(summary = "Health check")
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }
}
