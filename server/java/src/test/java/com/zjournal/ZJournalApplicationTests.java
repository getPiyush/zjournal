package com.zjournal;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// Development mode so the context starts without Google auth configured (see AdminAuthConfig).
@SpringBootTest(properties = "zjournal.env=development")
class ZJournalApplicationTests {

	@Test
	void contextLoads() {
	}

}
