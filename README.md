# SecurityWeb (ThisCount) - Secure Web Application 🛡️

This project demonstrates a secure web application architecture based on **Java Spring Boot** and **React**.

The primary goal is to implement **Secure SDLC (Software Development Life Cycle)** principles, protecting user data against common vulnerabilities (OWASP Top 10) and ensuring robust authentication.

## 🚀 Tech Stack

- **Backend:** Java 21, Spring Boot 3.x
- **Frontend:** React 19, TypeScript, Vite
- **Security Framework:** Spring Security
- **Cryptography:** Argon2 (Password Hashing)
- **Containerization:** Docker + Kubernetes (Minikube)
- **Build Tool:** Maven
- **Database:** PostgreSQL 15

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

## 🐳 Running Locally (Docker Compose)

For local development without Kubernetes. Runs PostgreSQL and the Spring Boot backend only — the frontend is served by Vite's dev server.

**Prerequisites:** Docker Desktop running.

```bash
# Start PostgreSQL
docker-compose up -d

# Start the backend (in /backend)
./mvnw spring-boot:run

# Start the frontend (in /frontend)
npm install
npm run dev
```

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:5173`

---

## ☸️ Running via Kubernetes (Minikube)

The application is fully deployed to a local Kubernetes cluster using Minikube. All three components — PostgreSQL, Spring Boot backend, and React frontend — run as pods inside a dedicated `thiscount` namespace, exposed through an Nginx Ingress at `http://thiscount.local`.

### Architecture

```
Browser → http://thiscount.local
              │
         minikube tunnel (127.0.0.1:80)
              │
         Ingress Controller (nginx)
          /api/*  →  backend-service:8080  →  Spring Boot pod
                                                    │
                                            postgres-service:5432
                                                    │
                                             PostgreSQL pod + PVC
             /*  →  frontend-service:80  →  Nginx pod (React build)
```

### Prerequisites

- Docker Desktop running
- Minikube installed (`winget install Kubernetes.minikube`)
- Both images built in Minikube's Docker context (see below)
- `127.0.0.1  thiscount.local` added to `C:\Windows\System32\drivers\etc\hosts`

### First-time setup

```powershell
# 1. Start Minikube
minikube start --driver=docker --memory=4096 --cpus=2

# 2. Enable the Nginx Ingress addon
minikube addons enable ingress

# 3. Point Docker CLI at Minikube's daemon and build both images
minikube docker-env | Invoke-Expression
docker build -t thiscount-backend:latest ./backend
docker build -t thiscount-frontend:latest ./frontend

# 4. Apply all Kubernetes manifests in order
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/ingress.yaml

# 5. In a separate Admin PowerShell — keep this window open
minikube tunnel
```

Wait approximately 90 seconds for all pods to reach `1/1 Running`, then open **`http://thiscount.local`** in the browser.

### Daily usage (after first-time setup)

```powershell
# Terminal 1 — start the cluster
minikube start --driver=docker

# Terminal 2 — Admin PowerShell, keep open
minikube tunnel
```

Then open `http://thiscount.local`. Your pods and database data persist between restarts.

### Verify the cluster is healthy

```powershell
kubectl get all -n thiscount
kubectl get ingress -n thiscount
```

All three pods (`postgres`, `backend`, `frontend`) should show `1/1 Running`.

### Rebuilding after code changes

```powershell
minikube docker-env | Invoke-Expression
docker build -t thiscount-backend:latest ./backend
kubectl rollout restart deployment/backend -n thiscount
```

### Tear down

```powershell
# Remove all K8s resources (pods, services, secrets, PVC)
kubectl delete namespace thiscount

# Stop the cluster
minikube stop
```

For a full explanation of every Kubernetes design decision, see [KUBERNETES-MIGRATION.md](KUBERNETES-MIGRATION.md).

---

## 📁 Project Structure

```
project/
├── backend/                    # Spring Boot application
│   ├── src/
│   └── Dockerfile              # Multi-stage Maven → JRE 21 build
├── frontend/                   # React + TypeScript application
│   ├── src/
│   ├── Dockerfile              # Multi-stage Node → Nginx build
│   └── nginx.conf              # SPA routing + /api/* reverse proxy
├── k8s/                        # Kubernetes manifests
│   ├── namespace.yaml
│   ├── secrets.yaml
│   ├── configmap.yaml
│   ├── postgres-pvc.yaml
│   ├── postgres-deployment.yaml
│   ├── postgres-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   └── ingress.yaml
├── docker-compose.yml          # Local dev: PostgreSQL only
└── KUBERNETES-MIGRATION.md     # Full migration guide with all decisions explained
```