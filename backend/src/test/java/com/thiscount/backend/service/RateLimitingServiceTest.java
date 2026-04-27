package com.thiscount.backend.service;

import io.github.bucket4j.Bucket;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

// White Box Unit Test — RateLimitingService
// No mocks needed: service is pure in-memory (Bucket4j, no external deps).
class RateLimitingServiceTest {

    private RateLimitingService rateLimitingService;

    @BeforeEach
    void setUp() {
        // Arrange — fresh instance resets the in-memory cache before each test
        rateLimitingService = new RateLimitingService();
    }

    @Test
    @DisplayName("New email: a bucket is created and returned")
    void resolveBucket_forNewEmail_returnsNonNullBucket() {
        // Arrange
        String email = "newuser@thiscount.com";

        // Act
        Bucket bucket = rateLimitingService.resolveBucket(email);

        // Assert
        assertNotNull(bucket);
    }

    @Test
    @DisplayName("Same email: the same bucket instance is returned (cache hit)")
    void resolveBucket_forSameEmail_returnsSameBucketInstance() {
        // Arrange
        String email = "returning@thiscount.com";

        // Act
        Bucket firstCall  = rateLimitingService.resolveBucket(email);
        Bucket secondCall = rateLimitingService.resolveBucket(email);

        // Assert
        assertSame(firstCall, secondCall);
    }

    @Test
    @DisplayName("Within limit: first 3 requests all consume a token successfully")
    void resolveBucket_firstThreeRequests_areAllAllowed() {
        // Arrange
        Bucket bucket = rateLimitingService.resolveBucket("normal@thiscount.com");

        // Act
        boolean first  = bucket.tryConsume(1);
        boolean second = bucket.tryConsume(1);
        boolean third  = bucket.tryConsume(1);

        // Assert
        assertTrue(first);
        assertTrue(second);
        assertTrue(third);
    }

    @Test
    @DisplayName("Rate limit: 4th request is blocked after 3 tokens exhausted")
    void resolveBucket_fourthRequest_isRateLimited() {
        // Arrange
        Bucket bucket = rateLimitingService.resolveBucket("attacker@evil.com");
        bucket.tryConsume(1);
        bucket.tryConsume(1);
        bucket.tryConsume(1); // bucket empty

        // Act
        boolean fourthAttempt = bucket.tryConsume(1);

        // Assert
        assertFalse(fourthAttempt);
    }

    @Test
    @DisplayName("Isolation: exhausting one user's bucket does not affect another")
    void resolveBucket_differentEmails_haveIndependentBuckets() {
        // Arrange
        Bucket attackerBucket = rateLimitingService.resolveBucket("attacker@evil.com");
        Bucket innocentBucket = rateLimitingService.resolveBucket("alice@thiscount.com");
        attackerBucket.tryConsume(1);
        attackerBucket.tryConsume(1);
        attackerBucket.tryConsume(1);

        // Act
        boolean attackerBlocked = attackerBucket.tryConsume(1);
        boolean innocentAllowed = innocentBucket.tryConsume(1);

        // Assert
        assertFalse(attackerBlocked);
        assertTrue(innocentAllowed);
        assertNotSame(attackerBucket, innocentBucket);
    }
}
