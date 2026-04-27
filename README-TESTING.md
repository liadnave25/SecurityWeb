# Testing Documentation — SecurityWeb (ThisCount)

> **Audience:** Developers new to this project who need to understand what is tested, why, and how to run the suite.
> **Last updated:** April 2026 · **Total tests:** 23 (17 backend · 6 frontend) · **Status:** ✅ All passing

---

## Table of Contents

1. [Testing Overview](#1-testing-overview)
2. [Technology Stack](#2-technology-stack)
3. [Summary Table](#3-summary-table)
4. [Test Files Breakdown](#4-test-files-breakdown)
   - [FileValidationServiceTest.java](#41-filevalidationservicetestjava)
   - [RateLimitingServiceTest.java](#42-ratelimitingservicetestjava)
   - [AuthenticationControllerIntegrationTest.java](#43-authenticationcontrollerintegrationtestjava)
   - [FileUploadComponent.test.tsx](#44-fileuploadcomponenttesttsx)
5. [Running the Tests](#5-running-the-tests)
6. [Testing Methodology Glossary](#6-testing-methodology-glossary)

---

## 1. Testing Overview

The SecurityWeb project follows a **layered testing strategy** aligned with the **Secure SDLC** (Software Development Life Cycle) principles it is designed to demonstrate.

Tests are written at two levels:

- **Unit Tests** verify individual services and UI components in complete isolation, with all external dependencies replaced by controlled mocks. This allows fast, deterministic feedback on business logic.
- **Integration Tests** verify that the application's components work correctly *together* through the real HTTP pipeline, including Spring Security filters, CSRF protection, serialization, and Argon2 password verification.

Every test in this project is structured using the **AAA pattern** (Arrange, Act, Assert), and every test that requires external dependencies uses **Mockito** (backend) or **Vitest spies** (frontend) to replace them with controlled substitutes.

The security features explicitly covered by the test suite are:

| Security Feature | Test File |
|---|---|
| File type & magic-byte forgery prevention | `FileValidationServiceTest.java` |
| Brute-force & DoS mitigation (rate limiting) | `RateLimitingServiceTest.java` |
| Argon2 password verification | `AuthenticationControllerIntegrationTest.java` |
| CSRF token enforcement | `AuthenticationControllerIntegrationTest.java` |
| User enumeration prevention | `AuthenticationControllerIntegrationTest.java` |
| Frontend error handling & double-submit prevention | `FileUploadComponent.test.tsx` |

---

## 2. Technology Stack

### Backend

| Tool | Role |
|---|---|
| **JUnit 5** | Test runner and assertion library |
| **Mockito** | Mocking framework (`@Mock`, `@InjectMocks`, `@MockBean`) |
| **Spring Boot Test** | `@WebMvcTest`, `@SpringBootTest` context loaders |
| **MockMvc** | Simulated HTTP client for integration tests |
| **Spring Security Test** | `csrf()` post-processor for CSRF-aware requests |
| **Apache Tika** (real, not mocked) | Content-type detection used in file validation tests |

### Frontend

| Tool | Role |
|---|---|
| **Vitest** | Jest-compatible test runner (native Vite integration) |
| **React Testing Library** | DOM rendering and query utilities |
| **`@testing-library/user-event`** | Realistic user interaction simulation |
| **jsdom** | Virtual browser DOM environment |
| **`@testing-library/jest-dom`** | Extended DOM matchers (`toBeInTheDocument`, `toHaveValue`, etc.) |

---

## 3. Summary Table

| # | File | Layer | Test Count | Type | Methodology | Mocks Used |
|---|---|---|---|---|---|---|
| 1 | `FileValidationServiceTest.java` | Backend · Service | 6 | Unit | White Box | `FileUploadConfig`, `MultipartFile` (Mockito) |
| 2 | `RateLimitingServiceTest.java` | Backend · Service | 5 | Unit | White Box | None (pure in-memory logic) |
| 3 | `AuthenticationControllerIntegrationTest.java` | Backend · Controller | 5 | Integration | Black Box | `CustomUserDetailsService`, `AuthService` (Mockito `@MockBean`) |
| 4 | `FileUploadComponent.test.tsx` | Frontend · UI | 6 | Unit | White Box | `global.fetch`, `onSuccess` callback (Vitest `vi.fn()`) |
| | **Totals** | | **22** | | | |

> **Note on methodology overlap:** White Box and Black Box are not mutually exclusive. The integration tests are Black Box at the *HTTP* level (inputs/outputs only) but use mocks — a White Box technique — for infrastructure dependencies. This is standard practice.

---

## 4. Test Files Breakdown

---

### 4.1 `FileValidationServiceTest.java`

**Location:**
```
backend/backend/src/test/java/com/thiscount/backend/service/FileValidationServiceTest.java
```

#### Purpose

Tests the `FileValidationService.validate()` method, which is the server-side security gate for all file uploads. It enforces three sequential checks:

1. **Size check** — rejects files exceeding the configured limit.
2. **Extension allowlist** — rejects file extensions not in `[jpg, jpeg, png]`.
3. **Magic-byte check (Tika)** — rejects files whose *actual content* does not match an image signature, regardless of their extension. This defeats attacks where an attacker renames `virus.exe` to `virus.png`.

#### Testing Methodologies

| Methodology | Applied? | Notes |
|---|---|---|
| Unit Test | ✅ | No Spring context loaded; the service is instantiated directly by Mockito |
| White Box Testing | ✅ | Each `if` branch in `validate()` is targeted by a dedicated test case |
| Black Box Testing | ❌ | Not applicable at this layer |
| Integration Test | ❌ | Not applicable at this layer |

#### Mocks

| Dependency | Mock Type | Reason |
|---|---|---|
| `FileUploadConfig` | `@Mock` (Mockito) | Returns controlled values for `maxBytesPerFile` and `allowedExtensions` without a Spring context or `application.properties` |
| `MultipartFile` | `mock(MultipartFile.class)` (Mockito) | Controls `getSize()` and `getOriginalFilename()` return values for branch tests that do not reach Tika |
| **`Tika`** | **NOT mocked** | Tika is a private field initialised directly inside the service. Real byte arrays (including the PNG magic header `89 50 4E 47 0D 0A 1A 0A`) are provided so Tika performs genuine detection |

`@MockitoSettings(strictness = Strictness.LENIENT)` is applied at class level because the shared `@BeforeEach` stubs are not consumed by every test (early-exit branches short-circuit before reading some config values).

#### AAA Pattern

The `@BeforeEach` method `setUpConfigMock()` provides the shared **Arrange** step for the config mock. Each test method then adds its own specific **Arrange** (the file mock), performs the **Act** (calling `validate()`), and checks the **Assert** (exception type, message content, and Mockito interaction verifications with `verify(..., never())`).

#### Individual Test Cases

| Test Method | Branch Covered | Technique |
|---|---|---|
| `validate_whenFileSizeExceedsLimit` | Size check → throws | Mockito mock returning oversized `getSize()` |
| `validate_whenFilenameIsNull` | Null filename guard | Mockito mock returning `null` from `getOriginalFilename()` |
| `validate_whenFilenameHasNoExtension` | No-dot filename guard | Mockito mock returning `"malware"` (no dot) |
| `validate_whenExtensionNotInAllowlist` | Extension allowlist rejection | Mockito mock with `"ransomware.exe"`; verifies `getInputStream()` is **never** called |
| `validate_whenFileIsGenuinePng` | Happy path — all checks pass | `MockMultipartFile` with real PNG magic bytes |
| `validate_whenContentIsNotAnImage` | Tika content mismatch | `MockMultipartFile` with plain-text bytes named `"virus.png"` |

---

### 4.2 `RateLimitingServiceTest.java`

**Location:**
```
backend/backend/src/test/java/com/thiscount/backend/service/RateLimitingServiceTest.java
```

#### Purpose

Tests `RateLimitingService`, which implements a **token-bucket** algorithm via Bucket4j to mitigate brute-force and Denial-of-Service attacks. Each user (identified by email) receives an independent bucket with a capacity of **3 tokens**, refilled every **5 minutes**. Tests verify the bucket creation, cache behaviour, token consumption, exhaustion, and per-user isolation.

#### Testing Methodologies

| Methodology | Applied? | Notes |
|---|---|---|
| Unit Test | ✅ | The service is instantiated directly with `new RateLimitingService()` — no Spring context |
| White Box Testing | ✅ | Tests target specific code paths: `computeIfAbsent()` cache-miss path, cache-hit path, token exhaustion path, and per-key isolation of the `ConcurrentHashMap` |
| Black Box Testing | ❌ | Not applicable at this layer |
| Integration Test | ❌ | Not applicable at this layer |

#### Mocks

**No mocks are used in this file.** This is a deliberate design choice: `RateLimitingService` has no external dependencies. Using the real Bucket4j implementation verifies that the *actual rate-limiting algorithm* behaves as configured — mocking it would only test the mock itself.

A fresh `RateLimitingService` instance is created in `@BeforeEach` to reset the in-memory `ConcurrentHashMap` and guarantee full test isolation without needing database rollbacks or mock resets.

#### AAA Pattern

The global `@BeforeEach` `setUp()` serves as the shared **Arrange** for all tests (creating a clean service instance). Within each test, the three sections are clearly labelled with `// ── Arrange`, `// ── Act`, and `// ── Assert` comments.

#### Individual Test Cases

| Test Method | Branch / Behaviour Covered |
|---|---|
| `resolveBucket_forNewEmail_returnsNonNullBucket` | `computeIfAbsent()` — bucket created for a new key |
| `resolveBucket_forSameEmail_returnsSameBucketInstance` | `computeIfAbsent()` — existing key returns cached bucket (`assertSame`) |
| `resolveBucket_firstThreeRequests_areAllAllowed` | All 3 tokens consumed successfully |
| `resolveBucket_fourthRequest_isRateLimited` | 4th `tryConsume()` returns `false` — **rate limiting is active** |
| `resolveBucket_differentEmails_haveIndependentBuckets` | Exhausting one bucket does not affect another; `assertNotSame` on buckets |

---

### 4.3 `AuthenticationControllerIntegrationTest.java`

**Location:**
```
backend/backend/src/test/java/com/thiscount/backend/controller/AuthenticationControllerIntegrationTest.java
```

#### Purpose

Tests the `AuthController` REST endpoints (`GET /api/auth/status` and `POST /api/auth/login`) from the **outside**, as a real HTTP client would. The test suite verifies the complete request-response cycle including:

- JSON serialisation / deserialisation
- Spring Security's CSRF filter (`CookieCsrfTokenRepository`)
- The real Argon2 password verification pipeline (`DaoAuthenticationProvider` → `PasswordEncoder.matches()`)
- HTTP status codes and JSON response body fields
- Prevention of **user enumeration** (unknown email returns the same 401 as a wrong password)

#### Testing Methodologies

| Methodology | Applied? | Notes |
|---|---|---|
| Unit Test | ❌ | The Spring MVC layer, security filters, and serialisation are all active |
| White Box Testing | ❌ | No internal state is inspected; only HTTP inputs/outputs are asserted |
| Black Box Testing | ✅ | Tests interact with the API exactly as an external client would |
| Integration Test | ✅ | `@WebMvcTest` + `@Import(SecurityConfig.class)` loads the real MVC + Security pipeline |

#### Mocks

| Dependency | Mock Type | Reason |
|---|---|---|
| `CustomUserDetailsService` | `@MockBean` (Spring Boot Test) | Replaces the real JPA-backed user service. Tests control which users "exist" by configuring `loadUserByUsername()` return values — no database required |
| `AuthService` | `@MockBean` (Spring Boot Test) | Required by `AuthController`'s constructor; `isFirstUser()` is called by the status endpoint |
| **`AuthenticationManager`** | **NOT mocked** | The real `AuthenticationManager` is created by `SecurityConfig` using the mocked `CustomUserDetailsService` and the real Argon2 `PasswordEncoder`. This means **genuine Argon2 hash comparison runs in every login test** |

`@TestInstance(Lifecycle.PER_CLASS)` is used so that `@Autowired PasswordEncoder passwordEncoder` is accessible in `@BeforeEach` for encoding the test password with the real Argon2 algorithm.

#### AAA Pattern

`@BeforeEach setUpMocks()` handles the shared **Arrange**: it encodes the test password with real Argon2 and configures the `customUserDetailsService` mock to return a `UserDetails` containing that hash. Each test then provides its own **Act** (the `mockMvc.perform(...)` call) and **Assert** (`.andExpect(...)` chain).

#### Individual Test Cases

| Test Method | Endpoint | Scenario | Expected Result |
|---|---|---|---|
| `getStatus_returns200WithSystemStatusJson` | `GET /api/auth/status` | Public endpoint, no auth | `200 OK` + `{"isSetupRequired": false}` |
| `login_withValidCredentials_returns200` | `POST /api/auth/login` | Correct email + password | `200 OK` + `{"message": "Login Successful!", "user": "..."}` |
| `login_withWrongPassword_returns401` | `POST /api/auth/login` | Correct email, wrong password | `401 Unauthorized` + `{"error": "Invalid email or password"}` |
| `login_withUnknownEmail_returns401` | `POST /api/auth/login` | Non-existent email | `401 Unauthorized` — same message as wrong password (no enumeration) |
| `login_withoutCsrfToken_returns403` | `POST /api/auth/login` | Missing `X-XSRF-TOKEN` header | `403 Forbidden` — controller is **never reached** (verified with `verify(..., never())`) |

---

### 4.4 `FileUploadComponent.test.tsx`

**Location:**
```
frontend/src/__tests__/FileUploadComponent.test.tsx
```

#### Purpose

Tests the `FileUploadComponent` React component — a standalone file upload form that submits deal data to the backend. The test suite verifies the component's rendering, user interaction handling, and all response branches of the asynchronous `handleSubmit` function:

- Happy path: successful upload clears the form and triggers the `onSuccess` callback.
- Error path: a backend rejection error message is displayed to the user.
- Network failure path: a generic connection error message is displayed.
- In-flight state: the submit button is disabled while a request is pending, preventing double-submission.

#### Testing Methodologies

| Methodology | Applied? | Notes |
|---|---|---|
| Unit Test | ✅ | The component is rendered in jsdom isolation; no real server or browser |
| White Box Testing | ✅ | Each `if/else` branch in `handleSubmit()` and each piece of React state (`errorMessage`, `selectedFile`, `isSubmitting`) is deliberately exercised |
| Black Box Testing | ❌ | Not applicable (internal state branches are explicitly targeted) |
| Integration Test | ❌ | Not applicable at this layer |

#### Mocks

| Dependency | Mock Type | Reason |
|---|---|---|
| `global.fetch` | `vi.fn()` (Vitest spy) | Replaces the browser's native `fetch` API. Each test queues a specific response (`mockResolvedValueOnce` / `mockRejectedValueOnce`), allowing the component to run its full async logic against a controlled "server" |
| `onSuccess` prop | `vi.fn()` (Vitest spy) | Allows tests to assert whether the success callback was triggered (or correctly *not* triggered on error) |

`vi.clearAllMocks()` is called in `beforeEach` to reset all recorded calls and queued responses between tests, ensuring full isolation.

The **CSRF token** is not mocked separately: `document.cookie` is empty in jsdom, so `getCsrfToken()` returns an empty string. This is intentional — CSRF enforcement is the backend's responsibility and is verified in `AuthenticationControllerIntegrationTest.java`.

#### Setup File

`src/__tests__/setup.ts` is loaded before every test file (configured in `vite.config.ts`). It imports `@testing-library/jest-dom`, which extends Vitest's `expect` with DOM-specific matchers:

```typescript
import '@testing-library/jest-dom';
// Enables: toBeInTheDocument(), toHaveTextContent(), toHaveValue(), toBeDisabled(), etc.
```

#### AAA Pattern

Every test case is structured with `// ── Arrange`, `// ── Act`, and `// ── Assert` comment blocks. The shared `beforeEach` provides the reset step; individual test bodies handle their own specific arrangement (mock queue and render) before acting and asserting.

#### Individual Test Cases

| Test | State / Branch Covered | Key Assertion |
|---|---|---|
| `renders the upload form with all required input elements` | Initial render — no state set | All `data-testid` elements present; error and filename hidden |
| `displays the selected filename after the user picks a file` | `selectedFile` state branch | `[data-testid="selected-filename"]` shows `"vacation.jpg"` |
| `displays the backend error message when the upload is rejected` | `!res.ok` branch | `[role="alert"]` contains server error text; `onSuccess` not called |
| `clears form fields and calls onSuccess after a successful upload` | `res.ok === true` branch | Inputs reset to `""`; `onSuccess` called exactly once |
| `shows a connection error message when the network request fails` | `catch` block | Alert shows `"Server connection lost"` |
| `disables the submit button while the upload is in progress` | `isSubmitting === true` branch | Button is `disabled` and shows `"Processing..."` text |

---

## 5. Running the Tests

### Backend (Maven)

Runs all 17 backend tests across the three test classes:

```bash
cd backend/backend
./mvnw test
```

To run a single test class:

```bash
./mvnw test -Dtest=FileValidationServiceTest
./mvnw test -Dtest=RateLimitingServiceTest
./mvnw test -Dtest=AuthenticationControllerIntegrationTest
```

Expected output:

```
Tests run: 17, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

> **Note:** `AuthenticationControllerIntegrationTest` runs Argon2 hashing in `@BeforeEach`, which adds ~150 ms per test. This is intentional — the real password encoder is exercised, not a test substitute.

### Frontend (Vitest)

Runs all 6 frontend tests:

```bash
cd frontend
npx vitest run
```

To run in watch mode during development:

```bash
npx vitest
```

Expected output:

```
Test Files  1 passed (1)
     Tests  6 passed (6)
```

---

## 6. Testing Methodology Glossary

| Term | Definition | Where used in this project |
|---|---|---|
| **Unit Test** | Tests a single class or function in isolation; all dependencies are replaced by mocks | `FileValidationServiceTest`, `RateLimitingServiceTest`, `FileUploadComponent.test.tsx` |
| **Integration Test** | Tests multiple components working together through real pipelines (HTTP, security filters, serialisation) | `AuthenticationControllerIntegrationTest` |
| **White Box Testing** | The tester knows the internal logic and deliberately targets specific branches (`if/else`, edge cases, exceptions) | All four test files |
| **Black Box Testing** | The tester treats the system as a black box: only inputs and outputs (HTTP request/response) are inspected | `AuthenticationControllerIntegrationTest` |
| **AAA Pattern** | **Arrange** (set up preconditions) → **Act** (call the code under test) → **Assert** (verify the outcome) | All four test files |
| **Mock** | A controlled substitute for a real dependency. Returns pre-configured values so the test focuses on the unit under test | `@Mock` / `@MockBean` (Mockito), `vi.fn()` (Vitest) |
| **`@WebMvcTest`** | Spring Boot annotation that loads only the web layer (controllers + security). Faster than `@SpringBootTest` and does not require a database | `AuthenticationControllerIntegrationTest` |
| **MockMvc** | Spring's simulated HTTP client. Sends requests through the real MVC + Security pipeline without starting a server | `AuthenticationControllerIntegrationTest` |
| **`vi.fn()` / `jest.fn()`** | Creates a spy function that records calls and can be configured to return specific values or throw errors | `FileUploadComponent.test.tsx` |
