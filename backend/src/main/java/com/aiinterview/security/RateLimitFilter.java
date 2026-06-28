package com.aiinterview.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Token-bucket rate limiting filter using Redis.
 *
 * <p>Limits requests per IP address to {@code app.rate-limit.requests-per-minute}
 * over a 1-minute sliding window. Exceeding the limit returns HTTP 429.
 *
 * <p>Rate limit headers are added to every response:
 * <ul>
 *   <li>X-RateLimit-Limit: max requests per window</li>
 *   <li>X-RateLimit-Remaining: remaining requests in current window</li>
 *   <li>X-RateLimit-Reset: seconds until window resets</li>
 * </ul>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private final RedisTemplate<String, String> stringRedisTemplate;

    @Value("${app.rate-limit.requests-per-minute}")
    private int requestsPerMinute;

    private static final String RATE_LIMIT_PREFIX = "rate_limit:";
    private static final int WINDOW_SECONDS = 60;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String clientIp  = resolveClientIp(request);
        String redisKey  = RATE_LIMIT_PREFIX + clientIp;

        try {
            Long currentCount = stringRedisTemplate.opsForValue().increment(redisKey);
            if (currentCount == null) currentCount = 1L;

            // Set expiry on first request in the window
            if (currentCount == 1) {
                stringRedisTemplate.expire(redisKey, WINDOW_SECONDS, TimeUnit.SECONDS);
            }

            long remaining = Math.max(0, requestsPerMinute - currentCount);
            Long ttl       = stringRedisTemplate.getExpire(redisKey, TimeUnit.SECONDS);
            long resetIn   = ttl != null && ttl > 0 ? ttl : WINDOW_SECONDS;

            response.setHeader("X-RateLimit-Limit",     String.valueOf(requestsPerMinute));
            response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));
            response.setHeader("X-RateLimit-Reset",     String.valueOf(resetIn));

            if (currentCount > requestsPerMinute) {
                log.warn("Rate limit exceeded for IP: {}", clientIp);
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write(
                        "{\"success\":false,\"error\":\"RATE_LIMIT_EXCEEDED\"," +
                        "\"message\":\"Too many requests. Please wait " + resetIn + " seconds before retrying.\"}");
                return;
            }
        } catch (Exception ex) {
            // Redis failure: fail open (don't block legitimate traffic)
            log.error("Rate limit check failed (Redis error), allowing request: {}", ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String resolveClientIp(HttpServletRequest request) {
        // Check for proxied IP (Nginx/CloudFront)
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}
