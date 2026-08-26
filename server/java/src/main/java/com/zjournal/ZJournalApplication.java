package com.zjournal;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@OpenAPIDefinition(info = @Info(
        title = "zJournal API",
        description = """
                Java/Spring Boot rewrite of the PHP and Node zJournal backends, serving the same \
                `db.json`-shaped data.

                ### Resources
                - **Articles**, **Contacts**, **QnA** — full CRUD collections
                - **Journal** — a single settings object (get/replace only)

                ### Encryption
                By default every request/response body is wrapped in an encrypted `ezjData` \
                envelope (PBKDF2 + AES-256-CBC, keyed by `zjournal.app-password`), which makes \
                **Try it out** below unusable as-is. To test interactively, start the app with:
                ```
                ./mvnw spring-boot:run -Dspring-boot.run.arguments=--zjournal.encryption-enabled=false
                ```
                `GET /` and `GET /health` are always unencrypted, regardless of that setting.""",
        version = "v1"
))
public class ZJournalApplication {

	public static void main(String[] args) {
		SpringApplication.run(ZJournalApplication.class, args);
	}

}
