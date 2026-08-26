package com.zjournal.web;

import com.zjournal.store.DataStore;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * The "journal" collection in db.json is a singleton object (app title, categories, admin
 * details, ...), not an array, so unlike articles/contacts/qna it only supports get/replace.
 */
@Tag(name = "Journal", description = "The single app-wide settings object — title, nav state, "
        + "category list, component palette, and admin details. Unlike the other resources this "
        + "is a singleton: no id, and `GET`/`PUT` only (no create/delete).")
@RestController
@RequestMapping("/journal")
public class JournalController {

    private final DataStore dataStore;

    public JournalController(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    @Operation(summary = "Get the journal settings object")
    @GetMapping
    public Map<String, Object> get() {
        return dataStore.getJournal();
    }

    @Operation(summary = "Replace the journal settings object")
    @PutMapping
    public Map<String, Object> replace(@RequestBody Map<String, Object> body) {
        return dataStore.setJournal(body);
    }
}
