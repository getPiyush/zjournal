package com.zjournal.web;

import com.zjournal.store.DataStore;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Articles", description = """
        CRUD for journal articles. Each article has a rich `content` array of typed components \
        (`h2`/`h3`/`h4`/`h5`/`Image`/`Paragraph`/`List`/`Table` — see `GET /journal` for the full \
        list) rendered in order. `categryId` (sic — matches the historical PHP/Node field name) \
        must be one of the values in `journal.categories`.""")
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
