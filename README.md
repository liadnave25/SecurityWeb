# SecurityWeb (ThisCount) - Secure Web Application 🛡️

This project demonstrates a secure web application architecture based on **Java Spring Boot** and **React**.

The primary goal is to implement **Secure SDLC (Software Development Life Cycle)** principles, protecting user data against common vulnerabilities (OWASP Top 10) and ensuring robust authentication.

## 🚀 Tech Stack

- **Backend:** Java 17, Spring Boot 3.x
- **Frontend:** React, TypeScript, Vite
- **Security Framework:** Spring Security
- **Cryptography:** Argon2 (Password Hashing)
- **Containerization:** Docker
- **Build Tool:** Maven

---

## 🔒 Security Implementation

### 1. Advanced Identity & Authentication (Argon2)

We prioritize credential safety by avoiding legacy hashing methods (like MD5 or SHA).

- **Argon2 Hashing:** Passwords are hashed using **Argon2**, the winner of the Password Hashing Competition.
- **Memory-Hardness:** This algorithm is configured to require significant memory usage, making it highly resistant to GPU-based brute force and rainbow table attacks.
- **Unique Salting:** Every password is cryptographically salted before hashing.

### 2. Secure File Upload & Validation 📁

To prevent malicious file execution and storage-based attacks:

- **Strict Validation:** Server-side verification of file types, extensions, and sizes using a dedicated **FileValidationService**.
- **Secure Configuration:** Managed upload properties via **FileUploadConfig** to ensure files are handled within safe directory boundaries.

### 3. Rate Limiting & DoS Protection 🛑

- **Brute Force Mitigation:** Implemented a **RateLimitingService** to restrict the number of requests per user/IP.
- **Service Stability:** Protects authentication and sensitive API endpoints from automated attacks and resource exhaustion.

### 4. Secure Data Storage & Handling

- **Input Validation:** Strict server-side validation and sanitization are implemented to prevent **SQL Injection** and **Cross-Site Scripting (XSS)**.
- **CSRF Protection:** State-changing requests are protected against Cross-Site Request Forgery (CSRF) using Spring Security’s CSRF defense (token-based validation).
- **Principle of Least Privilege:** Database connections and application roles are restricted to the minimum necessary permissions.
- **Data Privacy:** Sensitive user data is handled according to privacy-by-design standards.

### 5. Application Security Testing

The project includes a comprehensive test suite covering both backend and frontend layers, combining **White Box Unit Tests** and **Black Box Integration Tests** using the **AAA pattern** (Arrange / Act / Assert).

**Backend (JUnit 5 + Mockito)**

- **`FileValidationServiceTest`** — White box unit test. Uses `@Mock FileUploadConfig` and `@InjectMocks FileValidationService` with Mockito. Covers all branches in `validate()`: oversized files, null/missing extension, disallowed extension, and Tika magic-byte detection that catches executables masquerading as images.
- **`RateLimitingServiceTest`** — White box unit test. No mocks — instantiates `RateLimitingService` directly to verify real Bucket4j behavior: bucket creation, cache hits (same instance returned), first 3 requests allowed, 4th request blocked, and per-user bucket isolation.
- **`AuthenticationControllerIntegrationTest`** — Black box integration test. Uses `@WebMvcTest(AuthController.class)` + `@Import(SecurityConfig.class)` to load the full security pipeline (CSRF, Argon2, `DaoAuthenticationProvider`) without a database. `@MockBean` stubs only `CustomUserDetailsService` and `AuthService`. Tests: valid credentials return 200, wrong password returns 401, unknown email returns 401 (no user enumeration), and missing CSRF token returns 403.

**Frontend (Vitest + React Testing Library)**

- **`FileUploadComponent.test.tsx`** — White box unit test. Mocks `global.fetch` with `vi.fn()` to control network responses. Tests: form renders with all `data-testid` elements, filename displays after file selection, backend error message shown on 400 response, form resets and `onSuccess` called on 200 response, generic error shown when fetch throws (server down), and submit button disabled with "Processing..." text while request is in flight.

---

## 🐳 Running via Docker

The application is containerized to ensure a consistent, isolated, and secure runtime environment.