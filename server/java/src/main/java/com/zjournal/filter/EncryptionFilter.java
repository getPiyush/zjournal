package com.zjournal.filter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zjournal.crypto.CryptoService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.WriteListener;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Set;

/**
 * Reproduces the envelope handling from server/php/index.php: every request/response body
 * is wrapped as {"ezjData": "<base64 envelope>"} and encrypted via {@link CryptoService},
 * which implements the matching PBKDF2/AES-256-CBC scheme from server/php/crypto.php.
 */
@Component
public class EncryptionFilter extends OncePerRequestFilter {

    private static final Set<String> UNENCRYPTED_PATHS = Set.of("/", "/health");

    private final CryptoService cryptoService;
    private final ObjectMapper objectMapper;

    public EncryptionFilter(CryptoService cryptoService, ObjectMapper objectMapper) {
        this.cryptoService = cryptoService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        if (UNENCRYPTED_PATHS.contains(request.getRequestURI())) {
            chain.doFilter(request, response);
            return;
        }

        HttpServletRequest requestToUse = request;
        byte[] rawBody = request.getInputStream().readAllBytes();
        if (rawBody.length > 0) {
            requestToUse = new DecryptedRequestWrapper(request, decryptEnvelope(rawBody));
        }

        BufferingResponseWrapper wrappedResponse = new BufferingResponseWrapper(response);
        chain.doFilter(requestToUse, wrappedResponse);

        byte[] plainResponseBody = wrappedResponse.getBufferedContent();
        String plainJson = plainResponseBody.length == 0
                ? "null"
                : new String(plainResponseBody, StandardCharsets.UTF_8);

        byte[] out = objectMapper.writeValueAsBytes(Map.of("ezjData", cryptoService.encrypt(plainJson)));

        response.setStatus(wrappedResponse.getStatus());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setContentLength(out.length);
        response.getOutputStream().write(out);
    }

    private byte[] decryptEnvelope(byte[] rawBody) throws IOException {
        Map<String, String> envelope = objectMapper.readValue(rawBody, new TypeReference<Map<String, String>>() {
        });
        String ezjData = envelope.get("ezjData");
        if (ezjData == null) {
            return rawBody;
        }
        return cryptoService.decrypt(ezjData).getBytes(StandardCharsets.UTF_8);
    }

    private static final class DecryptedRequestWrapper extends HttpServletRequestWrapper {
        private final byte[] body;

        DecryptedRequestWrapper(HttpServletRequest request, byte[] body) {
            super(request);
            this.body = body;
        }

        @Override
        public ServletInputStream getInputStream() {
            ByteArrayInputStream byteStream = new ByteArrayInputStream(body);
            return new ServletInputStream() {
                @Override
                public boolean isFinished() {
                    return byteStream.available() == 0;
                }

                @Override
                public boolean isReady() {
                    return true;
                }

                @Override
                public void setReadListener(ReadListener readListener) {
                }

                @Override
                public int read() {
                    return byteStream.read();
                }
            };
        }

        @Override
        public BufferedReader getReader() {
            return new BufferedReader(new InputStreamReader(getInputStream(), StandardCharsets.UTF_8));
        }
    }

    private static final class BufferingResponseWrapper extends HttpServletResponseWrapper {
        private final ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        private PrintWriter writer;
        private int status = HttpServletResponse.SC_OK;

        BufferingResponseWrapper(HttpServletResponse response) {
            super(response);
        }

        @Override
        public void setStatus(int sc) {
            this.status = sc;
        }

        @Override
        public void sendError(int sc) {
            this.status = sc;
        }

        @Override
        public void sendError(int sc, String msg) {
            this.status = sc;
        }

        @Override
        public int getStatus() {
            return status;
        }

        @Override
        public ServletOutputStream getOutputStream() {
            return new ServletOutputStream() {
                @Override
                public boolean isReady() {
                    return true;
                }

                @Override
                public void setWriteListener(WriteListener writeListener) {
                }

                @Override
                public void write(int b) {
                    buffer.write(b);
                }
            };
        }

        @Override
        public PrintWriter getWriter() {
            if (writer == null) {
                writer = new PrintWriter(new OutputStreamWriter(buffer, StandardCharsets.UTF_8), true);
            }
            return writer;
        }

        byte[] getBufferedContent() {
            if (writer != null) {
                writer.flush();
            }
            return buffer.toByteArray();
        }
    }
}
