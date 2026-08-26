package com.zjournal.web;

import com.zjournal.store.DataStore;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/articles")
public class ArticleController extends AbstractCollectionController {

    public ArticleController(DataStore dataStore) {
        super(dataStore);
    }

    @Override
    protected String collectionName() {
        return "articles";
    }
}
