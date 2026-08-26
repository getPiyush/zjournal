package com.zjournal.web;

import com.zjournal.store.DataStore;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
