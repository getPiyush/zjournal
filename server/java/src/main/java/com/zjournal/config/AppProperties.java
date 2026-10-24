package com.zjournal.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "zjournal")
public class AppProperties {

    private String encryptionKey;
    private String dbFile;
    private boolean encryptionEnabled = true;
    private String env = "production";
    private final Auth auth = new Auth();

    public static class Auth {
        private String googleClientId = "";
        private List<String> adminEmails = new ArrayList<>();

        public String getGoogleClientId() {
            return googleClientId;
        }

        public void setGoogleClientId(String googleClientId) {
            this.googleClientId = googleClientId == null ? "" : googleClientId.trim();
        }

        public List<String> getAdminEmails() {
            return adminEmails;
        }

        public void setAdminEmails(List<String> adminEmails) {
            this.adminEmails = adminEmails == null ? new ArrayList<>() : adminEmails.stream()
                    .map(String::trim)
                    .filter(email -> !email.isEmpty())
                    .toList();
        }

        public boolean isConfigured() {
            return !googleClientId.isEmpty() && !adminEmails.isEmpty();
        }
    }

    public String getEncryptionKey() {
        return encryptionKey;
    }

    public void setEncryptionKey(String encryptionKey) {
        this.encryptionKey = encryptionKey;
    }

    public String getDbFile() {
        return dbFile;
    }

    public void setDbFile(String dbFile) {
        this.dbFile = dbFile;
    }

    public boolean isEncryptionEnabled() {
        return encryptionEnabled;
    }

    public void setEncryptionEnabled(boolean encryptionEnabled) {
        this.encryptionEnabled = encryptionEnabled;
    }

    public String getEnv() {
        return env;
    }

    public void setEnv(String env) {
        this.env = env;
    }

    public boolean isDevelopment() {
        return "development".equalsIgnoreCase(env);
    }

    public Auth getAuth() {
        return auth;
    }
}
