package com.zjournal.web;

import com.zjournal.store.DataStore;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

/**
 * Shared CRUD surface for the array-backed collections (articles, contacts, qna) that
 * json-server auto-generated on the Node side and setters.php/getters.php hand-implemented
 * on the PHP side: list with filter/sort query support, get-by-id, create, update, delete.
 */
public abstract class AbstractCollectionController {

    protected final DataStore dataStore;

    protected AbstractCollectionController(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    protected abstract String collectionName();

    @GetMapping
    public List<Map<String, Object>> list(@RequestParam MultiValueMap<String, String> params) {
        return QueryEngine.apply(dataStore.getCollection(collectionName()), params);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable String id) {
        return dataStore.findById(collectionName(), id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Map<String, Object> create(@RequestBody Map<String, Object> body) {
        return dataStore.addToCollection(collectionName(), body);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return dataStore.updateInCollection(collectionName(), id, body)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable String id) {
        return dataStore.deleteFromCollection(collectionName(), id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
