package com.zjournal.crypto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zjournal.config.AppProperties;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Reimplements the CryptoJSAesEncrypt/CryptoJSAesDecrypt pair from server/php/crypto.php:
 * PBKDF2-HMAC-SHA512 (999 iterations, 256-bit key) + AES-256-CBC, with a random 256-byte salt
 * and 16-byte IV carried alongside the ciphertext, the whole envelope base64-encoded once more.
 */
@Service
public class CryptoService {

    private static final String KEY_DERIVATION_ALGORITHM = "PBKDF2WithHmacSHA512";
    private static final int PBKDF2_ITERATIONS = 999;
    private static final int KEY_LENGTH_BITS = 256;
    private static final int SALT_LENGTH_BYTES = 256;
    private static final int IV_LENGTH_BYTES = 16;

    private final AppProperties appProperties;
    private final ObjectMapper objectMapper;
    private final SecureRandom secureRandom = new SecureRandom();

    public CryptoService(AppProperties appProperties, ObjectMapper objectMapper) {
        this.appProperties = appProperties;
        this.objectMapper = objectMapper;
    }

    public String encrypt(String plainText) {
        try {
            byte[] salt = randomBytes(SALT_LENGTH_BYTES);
            byte[] iv = randomBytes(IV_LENGTH_BYTES);
            SecretKeySpec key = deriveKey(appProperties.getEncryptionKey(), salt);

            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, key, new IvParameterSpec(iv));
            byte[] ciphertext = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            Map<String, String> envelope = new LinkedHashMap<>();
            envelope.put("ciphertext", Base64.getEncoder().encodeToString(ciphertext));
            envelope.put("iv", HexFormat.of().formatHex(iv));
            envelope.put("salt", HexFormat.of().formatHex(salt));

            String envelopeJson = objectMapper.writeValueAsString(envelope);
            return Base64.getEncoder().encodeToString(envelopeJson.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new CryptoException("Failed to encrypt payload", e);
        }
    }

    @SuppressWarnings("unchecked")
    public String decrypt(String base64Envelope) {
        try {
            byte[] envelopeJsonBytes = Base64.getDecoder().decode(base64Envelope);
            Map<String, String> envelope = objectMapper.readValue(envelopeJsonBytes, Map.class);

            byte[] salt = HexFormat.of().parseHex(envelope.get("salt"));
            byte[] iv = HexFormat.of().parseHex(envelope.get("iv"));
            byte[] ciphertext = Base64.getDecoder().decode(envelope.get("ciphertext"));

            SecretKeySpec key = deriveKey(appProperties.getEncryptionKey(), salt);

            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, key, new IvParameterSpec(iv));
            byte[] plainBytes = cipher.doFinal(ciphertext);

            return new String(plainBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new CryptoException("Failed to decrypt payload", e);
        }
    }

    private SecretKeySpec deriveKey(String passphrase, byte[] salt) throws Exception {
        SecretKeyFactory factory = SecretKeyFactory.getInstance(KEY_DERIVATION_ALGORITHM);
        PBEKeySpec spec = new PBEKeySpec(passphrase.toCharArray(), salt, PBKDF2_ITERATIONS, KEY_LENGTH_BITS);
        byte[] keyBytes = factory.generateSecret(spec).getEncoded();
        return new SecretKeySpec(keyBytes, "AES");
    }

    private byte[] randomBytes(int length) {
        byte[] bytes = new byte[length];
        secureRandom.nextBytes(bytes);
        return bytes;
    }

    public static class CryptoException extends RuntimeException {
        public CryptoException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
