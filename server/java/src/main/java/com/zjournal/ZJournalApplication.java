package com.zjournal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ZJournalApplication {

	public static void main(String[] args) {
		SpringApplication.run(ZJournalApplication.class, args);
	}

}
