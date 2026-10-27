package com.zjournal.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zjournal.config.AppProperties;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.support.StaticListableBeanFactory;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThatNoException;

class AdminAuthConfigTest {

    private static AdminAuthConfig config(String env) {
        AppProperties properties = new AppProperties();
        properties.setEnv(env);
        return new AdminAuthConfig(properties, new ObjectMapper(),
                new StaticListableBeanFactory().getBeanProvider(TokenVerifier.class));
    }

    @Test
    void refusesToStartInProductionWithoutAuthConfig() {
        assertThatThrownBy(() -> config("production").addInterceptors(new InterceptorRegistry()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("ZJOURNAL_ADMIN_EMAILS");
    }

    @Test
    void allowsDevelopmentWithoutAuthConfig() {
        assertThatNoException().isThrownBy(() -> config("development").addInterceptors(new InterceptorRegistry()));
    }
}
