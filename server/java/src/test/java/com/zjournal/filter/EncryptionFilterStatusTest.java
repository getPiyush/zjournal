package com.zjournal.filter;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** The encrypted envelope must keep the handler's status (e.g. 404), not turn it into 200. */
@SpringBootTest(properties = {"zjournal.env=development", "zjournal.encryption-enabled=true"})
@AutoConfigureMockMvc
class EncryptionFilterStatusTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void keepsA404Status() throws Exception {
        mockMvc.perform(get("/articles/no-such-article"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.ezjData").exists());
    }

    @Test
    void keepsA200Status() throws Exception {
        mockMvc.perform(get("/journal"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ezjData").exists());
    }
}
