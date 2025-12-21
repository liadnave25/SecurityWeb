# SecurityWeb (ThisCount) - Secure Web Application 🛡️

This project demonstrates a secure web application architecture based on **Java Spring Boot**.

The primary goal is to implement **Secure SDLC (Software Development Life Cycle)** principles, protecting user data against common vulnerabilities (OWASP Top 10) and ensuring robust authentication.

## 🚀 Tech Stack

- **Backend:** Java 17, Spring Boot 3.x
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

### 2. Secure Data Storage & Handling

- **Input Validation:** Strict server-side validation and sanitization are implemented to prevent **SQL Injection** and **Cross-Site Scripting (XSS)**.
- **Principle of Least Privilege:** Database connections and application roles are restricted to the minimum necessary permissions.
- **Data Privacy:** Sensitive user data is handled according to privacy-by-design standards.

### 3. Application Security Testing

The development process included rigorous testing phases:

- **Security Unit Tests:** Verifying that the authentication logic correctly rejects invalid credentials and handles edge cases.
- **Integration Testing:** Ensuring secure data flow between the Client, Controller, and Database layers.
- **Vulnerability Checks:** Automated tests to detect security misconfigurations in the Spring Boot context.

---

## 🐳 Running via Docker

The application is containerized to ensure a consistent, isolated, and secure runtime environment.
