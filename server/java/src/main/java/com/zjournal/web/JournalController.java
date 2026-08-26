package com.zjournal.web;

import com.zjournal.store.DataStore;
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
@RestController
@RequestMapping("/journal")
public class JournalController {

    private final DataStore dataStore;

    public JournalController(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    @GetMapping
    public Map<String, Object> get() {
        return dataStore.getJournal();
    }

    @PutMapping
    public Map<String, Object> replace(@RequestBody Map<String, Object> body) {
        return dataStore.setJournal(body);
    }
}
