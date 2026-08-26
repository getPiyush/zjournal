package com.zjournal.web;

import com.zjournal.store.DataStore;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "QnA", description = "CRUD for the frequently-asked-questions list shown on the "
        + "public site — `question`/`answer` pairs, hidden from visitors while `published` is `false`.")
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
