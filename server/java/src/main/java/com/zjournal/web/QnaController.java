package com.zjournal.web;

import com.zjournal.store.DataStore;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/qna")
public class QnaController extends AbstractCollectionController {

    public QnaController(DataStore dataStore) {
        super(dataStore);
    }

    @Override
    protected String collectionName() {
        return "qna";
    }
}
