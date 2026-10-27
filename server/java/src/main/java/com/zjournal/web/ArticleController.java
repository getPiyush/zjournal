package com.zjournal.web;

import com.zjournal.auth.PublicView;
import com.zjournal.store.DataStore;
import jakarta.servlet.http.HttpServletRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

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

    // Anonymous callers only see published articles that aren't on the purge list.
    @Override
    protected boolean isVisible(HttpServletRequest request, Map<String, Object> article) {
        return !PublicView.applies(request) || PublicView.isPublicArticle(article);
    }

    // Spring prefers this literal path over the inherited /{id}, so "search" isn't read as an id.
    @Operation(summary = "Search articles", description = "Text search (`q`, `in`), `from`/`to` dates, "
            + "`status`, `categryId`, `author`, `sort`, and `page`/`limit` paging. Returns "
            + "`{items, total, page, limit}`. See server/SEARCH.md.")
    @GetMapping("/search")
    public Map<String, Object> search(@RequestParam Map<String, String> params, HttpServletRequest request) {
        return ArticleSearch.search(dataStore.getCollection(collectionName()),
                name -> params.getOrDefault(name, ""), PublicView.applies(request));
    }
}
