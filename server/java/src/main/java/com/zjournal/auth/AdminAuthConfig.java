package com.zjournal.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zjournal.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Turns the admin gate on when zjournal.auth is configured. Auth may only be off in development
 * (zjournal.env=development): anywhere else the app refuses to start rather than serving an
 * open API.
 */
@Configuration
public class AdminAuthConfig implements WebMvcConfigurer {

    private static final Logger log = LoggerFactory.getLogger(AdminAuthConfig.class);

    private final AppProperties appProperties;
    private final ObjectMapper objectMapper;
    private final ObjectProvider<TokenVerifier> tokenVerifier;

    public AdminAuthConfig(AppProperties appProperties, ObjectMapper objectMapper,
                           ObjectProvider<TokenVerifier> tokenVerifier) {
        this.appProperties = appProperties;
        this.objectMapper = objectMapper;
        this.tokenVerifier = tokenVerifier;
    }

    @Bean
    TokenVerifier googleTokenVerifier() {
        return new GoogleTokenVerifier(appProperties.getAuth().getGoogleClientId());
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        AppProperties.Auth auth = appProperties.getAuth();
        if (!auth.isConfigured()) {
            if (!appProperties.isDevelopment()) {
                throw new IllegalStateException(
                        "Admin auth is not configured: set ZJOURNAL_GOOGLE_CLIENT_ID and ZJOURNAL_ADMIN_EMAILS "
                                + "before running in production (or ZJOURNAL_ENV=development for local use).");
            }
            log.warn("Admin auth is DISABLED (ZJOURNAL_ENV=development, ZJOURNAL_GOOGLE_CLIENT_ID / "
                    + "ZJOURNAL_ADMIN_EMAILS not set) — every API write is open.");
            return;
        }

        AdminAuthenticator authenticator = new AdminAuthenticator(tokenVerifier.getObject(), auth.getAdminEmails());
        registry.addInterceptor(new AdminAuthInterceptor(authenticator, objectMapper))
                .addPathPatterns("/**")
                // Spring's own error dispatch (after a handler already ran) — not a client request.
                .excludePathPatterns("/error");
    }
}
