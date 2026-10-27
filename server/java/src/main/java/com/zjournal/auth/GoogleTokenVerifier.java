package com.zjournal.auth;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.JWKSourceBuilder;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.BadJWTException;
import com.nimbusds.jwt.proc.DefaultJWTClaimsVerifier;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;

import java.net.MalformedURLException;
import java.net.URI;
import java.util.Map;
import java.util.Set;

/** Verifies Google ID tokens: RS256 signature against Google's keys, audience, issuer, expiry. */
public class GoogleTokenVerifier implements TokenVerifier {

    static final String GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
    static final Set<String> GOOGLE_ISSUERS = Set.of("accounts.google.com", "https://accounts.google.com");

    private final DefaultJWTProcessor<SecurityContext> processor = new DefaultJWTProcessor<>();

    public GoogleTokenVerifier(String clientId) {
        this(clientId, googleKeys());
    }

    // The key source is injectable so tests can sign tokens with their own keys.
    GoogleTokenVerifier(String clientId, JWKSource<SecurityContext> keys) {
        processor.setJWSKeySelector(new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, keys));
        processor.setJWTClaimsSetVerifier(
                new DefaultJWTClaimsVerifier<>(clientId, null, Set.of("iss", "exp", "email")));
    }

    // Caches Google's keys and refetches when a token carries an unknown key id.
    private static JWKSource<SecurityContext> googleKeys() {
        try {
            return JWKSourceBuilder.<SecurityContext>create(URI.create(GOOGLE_JWKS_URL).toURL()).build();
        } catch (MalformedURLException e) {
            throw new IllegalStateException(e);
        }
    }

    @Override
    public Map<String, Object> verify(String token) throws Exception {
        JWTClaimsSet claims = processor.process(token, null);
        if (!GOOGLE_ISSUERS.contains(claims.getIssuer())) {
            throw new BadJWTException("Unexpected issuer " + claims.getIssuer());
        }
        return claims.getClaims();
    }
}
