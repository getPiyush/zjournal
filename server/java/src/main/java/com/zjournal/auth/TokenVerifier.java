package com.zjournal.auth;

import java.util.Map;

/** Verifies an ID token and returns its claims, or throws if it isn't valid. */
@FunctionalInterface
public interface TokenVerifier {
    Map<String, Object> verify(String token) throws Exception;
}
