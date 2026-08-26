package com.zjournal.store;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zjournal.config.AppProperties;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * In-memory replica of db.json (same shape/fields as server/php/db.json and server/node/db.json:
 * articles/contacts/qna arrays plus a journal singleton). Loaded once at startup, mutated in
 * memory, and flushed back to disk periodically and on shutdown rather than on every write.
 */
@Component
public class DataStore {

    private final ObjectMapper objectMapper;
    private final AppProperties appProperties;
    private final AtomicBoolean dirty = new AtomicBoolean(false);

    private Map<String, Object> root;
    private Path dbFilePath;

    public DataStore(ObjectMapper objectMapper, AppProperties appProperties) {
        this.objectMapper = objectMapper;
        this.appProperties = appProperties;
    }

    @PostConstruct
    void load() throws IOException {
        dbFilePath = Path.of(appProperties.getDbFile());
        root = objectMapper.readValue(dbFilePath.toFile(), new TypeReference<Map<String, Object>>() {
        });
    }

    public synchronized List<Map<String, Object>> getCollection(String name) {
        return new ArrayList<>(rawCollection(name));
    }

    public synchronized Optional<Map<String, Object>> findById(String collectionName, String id) {
        return rawCollection(collectionName).stream()
                .filter(item -> id.equals(String.valueOf(item.get("id"))))
                .findFirst();
    }

    public synchronized Map<String, Object> getJournal() {
        return (Map<String, Object>) root.get("journal");
    }

    public synchronized Map<String, Object> setJournal(Map<String, Object> journal) {
        root.put("journal", journal);
        markDirty();
        return journal;
    }

    public synchronized Map<String, Object> addToCollection(String collectionName, Map<String, Object> item) {
        item.put("id", generateId());
        rawCollection(collectionName).add(item);
        markDirty();
        return item;
    }

    public synchronized Optional<Map<String, Object>> updateInCollection(String collectionName, String id, Map<String, Object> item) {
        List<Map<String, Object>> collection = rawCollection(collectionName);
        for (int i = 0; i < collection.size(); i++) {
            if (id.equals(String.valueOf(collection.get(i).get("id")))) {
                item.putIfAbsent("id", collection.get(i).get("id"));
                collection.set(i, item);
                markDirty();
                return Optional.of(item);
            }
        }
        return Optional.empty();
    }

    public synchronized Optional<Map<String, Object>> deleteFromCollection(String collectionName, String id) {
        Iterator<Map<String, Object>> it = rawCollection(collectionName).iterator();
        while (it.hasNext()) {
            Map<String, Object> item = it.next();
            if (id.equals(String.valueOf(item.get("id")))) {
                it.remove();
                markDirty();
                return Optional.of(item);
            }
        }
        return Optional.empty();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> rawCollection(String name) {
        return (List<Map<String, Object>>) root.computeIfAbsent(name, key -> new ArrayList<Map<String, Object>>());
    }

    private String generateId() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private void markDirty() {
        dirty.set(true);
    }

    @Scheduled(fixedDelay = 60_000)
    public synchronized void flushIfDirty() {
        if (!dirty.compareAndSet(true, false)) {
            return;
        }
        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(dbFilePath.toFile(), root);
        } catch (IOException e) {
            dirty.set(true);
            throw new UncheckedIOException("Failed to persist " + dbFilePath, e);
        }
    }

    @PreDestroy
    public void flushOnShutdown() {
        flushIfDirty();
    }
}
