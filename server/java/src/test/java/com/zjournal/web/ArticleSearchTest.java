package com.zjournal.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Runs the shared cases in server/search_cases.json, which every backend's tests run too. */
class ArticleSearchTest {

    @SuppressWarnings("unchecked")
    @TestFactory
    Stream<DynamicTest> sharedCases() throws IOException {
        Map<String, Object> shared = new ObjectMapper().readValue(
                Path.of("..", "search_cases.json").toFile(), new TypeReference<>() {});
        List<Map<String, Object>> articles = (List<Map<String, Object>>) shared.get("articles");
        List<Map<String, Object>> cases = (List<Map<String, Object>>) shared.get("cases");

        return cases.stream().map(c -> DynamicTest.dynamicTest((String) c.get("name"), () -> {
            Map<String, String> params = (Map<String, String>) c.get("params");
            Map<String, Object> result = ArticleSearch.search(
                    articles, name -> params.getOrDefault(name, ""), (Boolean) c.get("public"));

            List<Object> ids = ((List<Map<String, Object>>) result.get("items")).stream()
                    .map(a -> a.get("id")).toList();
            assertEquals(c.get("ids"), ids);
            assertEquals(c.get("total"), result.get("total"));
            if (c.containsKey("page")) assertEquals(c.get("page"), result.get("page"));
            if (c.containsKey("limit")) assertEquals(c.get("limit"), result.get("limit"));
        }));
    }
}
