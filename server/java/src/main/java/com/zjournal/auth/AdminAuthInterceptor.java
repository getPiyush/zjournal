package com.zjournal.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.web.cors.CorsUtils;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;

/**
 * Admin gate for the API. A HandlerInterceptor rather than a servlet filter because Spring MVC
 * adds the CORS headers (CorsConfig) before interceptors run: a 401/403 from here still
 * carries them, so the browser can read the status instead of seeing an opaque network error.
 * It runs inside EncryptionFilter, so its error body is encrypted like any other response.
 */
public class AdminAuthInterceptor implements HandlerInterceptor {

    public static final String ADMIN_EMAIL_ATTRIBUTE = "zjournal.adminEmail";

    private final AdminAuthenticator authenticator;
    private final ObjectMapper objectMapper;

    public AdminAuthInterceptor(AdminAuthenticator authenticator, ObjectMapper objectMapper) {
        this.authenticator = authenticator;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        if (CorsUtils.isPreFlightRequest(request)) {
            return true;
        }
        String authorization = request.getHeader("Authorization");
        if (!AdminRoutes.requiresAdmin(request.getMethod(), path)) {
            boolean adminAwareRead = ("GET".equals(request.getMethod()) || "HEAD".equals(request.getMethod()))
                    && PublicView.ADMIN_AWARE_READS.contains(AdminRoutes.collectionOf(path));
            if (!adminAwareRead) {
                return true;
            }
            // Anonymous: the public view. Presenting credentials means they must be valid,
            // though, rather than silently falling back to the public view.
            if (authorization == null || authorization.isEmpty()) {
                request.setAttribute(PublicView.ATTRIBUTE, true);
                return true;
            }
        }

        try {
            request.setAttribute(ADMIN_EMAIL_ATTRIBUTE,
                    authenticator.authenticate(authorization));
            return true;
        } catch (AuthException e) {
            response.setStatus(e.getStatus());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            objectMapper.writeValue(response.getOutputStream(),
                    Map.of("error", Map.of("code", e.getCode(), "message", e.getMessage())));
            return false;
        }
    }
}
