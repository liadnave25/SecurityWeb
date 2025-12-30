package com.thiscount.backend.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {

    // מפה השומרת דלי לכל משתמש (לפי אימייל)
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    // פונקציה ליצירת דלי חדש עם הגבלות
    private Bucket createNewBucket() {
        // הגדרה: 3 העלאות (Tokens) שמצטברות, והדלי מתמלא ב-3 טוקנים חדשים כל 5 דקות
        Refill refill = Refill.intervally(3, Duration.ofMinutes(5));
        Bandwidth limit = Bandwidth.classic(3, refill);
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    public Bucket resolveBucket(String email) {
        return cache.computeIfAbsent(email, key -> createNewBucket());
    }
}