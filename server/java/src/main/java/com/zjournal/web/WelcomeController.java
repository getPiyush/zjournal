package com.zjournal.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Plaintext, unencrypted endpoints (matching the "/" root response in server/php/index.php)
 * kept outside the EncryptionFilter's envelope so the server is reachable without a client
 * that speaks the PBKDF2/AES envelope, e.g. for health checks.
 */
@RestController
public class WelcomeController {

    @GetMapping("/")
    public String welcome() {
        return "Welcome to zjournal Feeder";
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }
}
