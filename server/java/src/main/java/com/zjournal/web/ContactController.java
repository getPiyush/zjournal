package com.zjournal.web;

import com.zjournal.store.DataStore;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Contacts", description = "CRUD for the \"contact us\" message inbox — one entry per "
        + "visitor submission (`name`, `email`, `phone`, `comment`, `dateContacted`).")
@RestController
@RequestMapping("/contacts")
public class ContactController extends AbstractCollectionController {

    public ContactController(DataStore dataStore) {
        super(dataStore);
    }

    @Override
    protected String collectionName() {
        return "contacts";
    }
}
