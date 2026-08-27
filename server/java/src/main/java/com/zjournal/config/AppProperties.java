package com.zjournal.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "zjournal")
public class AppProperties {

    private String encryptionKey;
    private String dbFile;
    private boolean encryptionEnabled = true;

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
}
