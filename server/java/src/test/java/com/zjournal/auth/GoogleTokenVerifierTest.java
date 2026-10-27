package com.zjournal.auth;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Date;
import java.util.function.Consumer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Signs tokens with throwaway RSA keys, so signature checking is real. */
class GoogleTokenVerifierTest {

    private static final String CLIENT_ID = "client-id.apps.googleusercontent.com";
    private static RSAKey googleKey;
    private static RSAKey otherKey;
    private static GoogleTokenVerifier verifier;

    @BeforeAll
    static void setUp() throws JOSEException {
        googleKey = new RSAKeyGenerator(2048).keyID("key-1").generate();
        otherKey = new RSAKeyGenerator(2048).keyID("key-1").generate();
        verifier = new GoogleTokenVerifier(CLIENT_ID, new ImmutableJWKSet<>(new JWKSet(googleKey.toPublicJWK())));
    }

    private static String token(RSAKey key, Consumer<JWTClaimsSet.Builder> customize) throws JOSEException {
        JWTClaimsSet.Builder claims = new JWTClaimsSet.Builder()
                .issuer("https://accounts.google.com")
                .audience(CLIENT_ID)
                .expirationTime(new Date(System.currentTimeMillis() + 3_600_000))
                .claim("email", "admin@example.com")
                .claim("email_verified", true);
        customize.accept(claims);
        SignedJWT jwt = new SignedJWT(
                new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(key.getKeyID()).build(), claims.build());
        jwt.sign(new RSASSASigner(key));
        return jwt.serialize();
    }

    @Test
    void acceptsAValidGoogleToken() throws Exception {
        assertThat(verifier.verify(token(googleKey, c -> {}))).containsEntry("email", "admin@example.com");
    }

    @Test
    void acceptsTheBareIssuerForm() throws Exception {
        assertThat(verifier.verify(token(googleKey, c -> c.issuer("accounts.google.com")))).isNotNull();
    }

    @Test
    void rejectsATokenSignedByAnotherKey() {
        assertThatThrownBy(() -> verifier.verify(token(otherKey, c -> {}))).isInstanceOf(Exception.class);
    }

    @Test
    void rejectsTheWrongAudience() {
        assertThatThrownBy(() -> verifier.verify(token(googleKey, c -> c.audience("other-client"))))
                .isInstanceOf(Exception.class);
    }

    @Test
    void rejectsTheWrongIssuer() {
        assertThatThrownBy(() -> verifier.verify(token(googleKey, c -> c.issuer("https://evil.example"))))
                .isInstanceOf(Exception.class);
    }

    @Test
    void rejectsAnExpiredToken() {
        assertThatThrownBy(() -> verifier.verify(token(googleKey,
                c -> c.expirationTime(new Date(System.currentTimeMillis() - 3_600_000)))))
                .isInstanceOf(Exception.class);
    }

    @Test
    void rejectsGarbage() {
        assertThatThrownBy(() -> verifier.verify("not.a.jwt")).isInstanceOf(Exception.class);
    }
}
