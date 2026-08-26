package com.zjournal.web;

import com.zjournal.store.DataStore;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.MediaType;
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

    @Operation(summary = "List items", description = "Supports `_sort`/`_order`, exact `field=value` "
            + "filters, substring `field_like=value` filters, and repeated keys (`?id=a&id=b`) OR'd "
            + "together while distinct keys AND.")
    @GetMapping
    public List<Map<String, Object>> list(
            @Parameter(description = "Query params, e.g. `_sort=dateCreated&_order=desc&published=true`")
            @RequestParam MultiValueMap<String, String> params) {
        return QueryEngine.apply(dataStore.getCollection(collectionName()), params);
    }

    @Operation(summary = "Get item by id")
    @ApiResponse(responseCode = "404", description = "No item with that id")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@Parameter(description = "The item's `id` field") @PathVariable String id) {
        return dataStore.findById(collectionName(), id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create an item")
    @PostMapping
    public Map<String, Object> create(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            examples = @ExampleObject("{\n  \"title\": \"Example title\"\n}")))
            @RequestBody Map<String, Object> body) {
        return dataStore.addToCollection(collectionName(), body);
    }

    @Operation(summary = "Replace an item by id")
    @ApiResponse(responseCode = "404", description = "No item with that id")
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @Parameter(description = "The item's `id` field") @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        return dataStore.updateInCollection(collectionName(), id, body)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Delete an item by id")
    @ApiResponse(responseCode = "404", description = "No item with that id")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@Parameter(description = "The item's `id` field") @PathVariable String id) {
        return dataStore.deleteFromCollection(collectionName(), id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
