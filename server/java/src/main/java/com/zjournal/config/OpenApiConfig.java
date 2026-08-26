package com.zjournal.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zjournal.web.ArticleController;
import com.zjournal.web.ContactController;
import com.zjournal.web.JournalController;
import com.zjournal.web.QnaController;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.parameters.RequestBody;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.HandlerMethod;

import java.util.List;
import java.util.Map;

/**
 * Swagger request/response bodies are declared as {@code Map<String, Object>} everywhere (see
 * {@link com.zjournal.web.AbstractCollectionController}), since every resource shares the same
 * generic CRUD handler methods and db.json's schema is untyped. That leaves springdoc with
 * nothing but "an object" to show, so this customizer swaps in a realistic, resource-specific
 * JSON example per controller for every generated request/response body.
 */
@Configuration
public class OpenApiConfig {

    private static final String ARTICLE_EXAMPLE = """
            {
              "id": "6262a7781b467",
              "author": "Ada Lovelace",
              "title": "How Preformulation Studies Shape a New Drug",
              "categryId": "Quality Control",
              "dateCreated": "2022-04-22T13:02:23.218Z",
              "dateModified": "2022-04-22T13:02:23.218Z",
              "origin": "server",
              "published": false,
              "content": [
                { "componentId": "c1", "componenType": "h2", "data": "Introduction", "numbered": false },
                { "componentId": "c2", "componenType": "Paragraph", "data": "Preformulation study is a group of studies on the physicochemical properties of a new drug candidate.", "numbered": false }
              ]
            }
            """;

    private static final String CONTACT_EXAMPLE = """
            {
              "id": 1,
              "name": "Ada Lovelace",
              "email": "ada@example.com",
              "phone": "+1 555-0100",
              "comment": "Loved the article on preformulation studies!",
              "dateContacted": "2022-04-09T19:16:42.645Z"
            }
            """;

    private static final String QNA_EXAMPLE = """
            {
              "id": 1,
              "question": "What is Preformulation study?",
              "answer": "A group of studies on the physicochemical properties of a new drug candidate that could affect drug performance and dosage form development.",
              "published": true,
              "dateCreated": "2022-04-12T07:16:45.652Z"
            }
            """;

    private static final String JOURNAL_EXAMPLE = """
            {
              "title": "zJournal",
              "selectedPage": "home",
              "loggedIn": false,
              "categories": ["Production", "Quality Assurance", "Engineering", "Quality Control"],
              "components": ["h2", "h3", "h4", "h5", "Image", "Paragraph", "List", "Table"]
            }
            """;

    private static final Map<Class<?>, String> EXAMPLES_BY_CONTROLLER = Map.of(
            ArticleController.class, ARTICLE_EXAMPLE,
            ContactController.class, CONTACT_EXAMPLE,
            QnaController.class, QNA_EXAMPLE,
            JournalController.class, JOURNAL_EXAMPLE
    );

    private final ObjectMapper objectMapper;

    public OpenApiConfig(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Bean
    public OperationCustomizer resourceExampleCustomizer() {
        return this::applyExample;
    }

    private Operation applyExample(Operation operation, HandlerMethod handlerMethod) {
        String exampleJson = EXAMPLES_BY_CONTROLLER.get(handlerMethod.getBeanType());
        if (exampleJson == null) {
            return operation;
        }

        Object example = parse(exampleJson);
        boolean isListOperation = List.class.isAssignableFrom(handlerMethod.getMethod().getReturnType());
        Object responseExample = isListOperation ? List.of(example) : example;

        applyRequestBodyExample(operation.getRequestBody(), example);
        applyResponseExamples(operation.getResponses(), responseExample);
        return operation;
    }

    private void applyRequestBodyExample(RequestBody requestBody, Object example) {
        if (requestBody == null) {
            return;
        }
        setExampleOnContent(requestBody.getContent(), example);
    }

    private void applyResponseExamples(ApiResponses responses, Object example) {
        if (responses == null) {
            return;
        }
        ApiResponse okResponse = responses.get("200");
        if (okResponse != null) {
            setExampleOnContent(okResponse.getContent(), example);
        }
    }

    private void setExampleOnContent(Content content, Object example) {
        if (content == null) {
            return;
        }
        content.values().forEach(mediaType -> mediaType.setExample(example));
    }

    private Object parse(String json) {
        try {
            return objectMapper.readValue(json, Object.class);
        } catch (Exception e) {
            throw new IllegalStateException("Invalid built-in OpenAPI example JSON", e);
        }
    }
}
