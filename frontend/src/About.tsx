import Layout from './Layout';

interface AboutProps {
  onNavigateToLogin: () => void;
}

const About = ({ onNavigateToLogin }: AboutProps) => {
  return (
    <Layout onNavigateToLogin={onNavigateToLogin}>
      <div className="max-w-4xl w-full space-y-10 pb-20">

        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-6 py-3">
            <span className="text-3xl">🛡️</span>
            <h1 className="text-3xl font-extrabold text-gray-800">
              <span className="text-blue-600">This</span>Count
            </h1>
          </div>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            A secure web application demonstrating <span className="font-semibold text-blue-600">Secure SDLC</span> principles,
            protecting against OWASP Top 10 vulnerabilities with robust authentication and data handling.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            🚀 Tech Stack
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Backend', value: 'Java 17 + Spring Boot 3' },
              { label: 'Frontend', value: 'React + TypeScript + Vite' },
              { label: 'Security', value: 'Spring Security' },
              { label: 'Cryptography', value: 'Argon2 Password Hashing' },
              { label: 'Containerization', value: 'Docker' },
              { label: 'Build Tool', value: 'Maven' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">{label}</p>
                <p className="text-sm font-semibold text-gray-700">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security Sections */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🔒 Security Implementation
          </h2>

          {/* Card 1 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 text-base mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-lg px-2 py-1 text-sm font-mono">1</span>
              Advanced Identity & Authentication (Argon2)
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span><span><strong>Argon2 Hashing:</strong> Passwords are hashed using Argon2, the winner of the Password Hashing Competition — avoiding legacy methods like MD5 or SHA.</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span><span><strong>Memory-Hardness:</strong> Configured to require significant memory, making GPU-based brute force and rainbow table attacks highly impractical.</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span><span><strong>Unique Salting:</strong> Every password is cryptographically salted before hashing.</span></li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 text-base mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-lg px-2 py-1 text-sm font-mono">2</span>
              Secure File Upload & Validation 📁
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span><span><strong>Strict Validation:</strong> Server-side verification of file types, extensions, and sizes via a dedicated <code className="bg-gray-100 px-1 rounded text-xs">FileValidationService</code>.</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span><span><strong>Secure Configuration:</strong> Managed upload properties via <code className="bg-gray-100 px-1 rounded text-xs">FileUploadConfig</code> to ensure files stay within safe directory boundaries.</span></li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 text-base mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-lg px-2 py-1 text-sm font-mono">3</span>
              Rate Limiting & DoS Protection 🛑
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span><span><strong>Brute Force Mitigation:</strong> A <code className="bg-gray-100 px-1 rounded text-xs">RateLimitingService</code> restricts the number of requests per user/IP.</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span><span><strong>Service Stability:</strong> Protects authentication and sensitive API endpoints from automated attacks and resource exhaustion.</span></li>
            </ul>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 text-base mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-lg px-2 py-1 text-sm font-mono">4</span>
              Secure Data Storage & Handling
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span><span><strong>Input Validation:</strong> Server-side validation and sanitization prevent SQL Injection and XSS.</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span><span><strong>CSRF Protection:</strong> State-changing requests are protected using Spring Security's token-based CSRF defense.</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span><span><strong>Least Privilege:</strong> Database connections and application roles are restricted to the minimum necessary permissions.</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span><span><strong>Data Privacy:</strong> Sensitive data is handled according to privacy-by-design standards.</span></li>
            </ul>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 text-base mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-lg px-2 py-1 text-sm font-mono">5</span>
              Application Security Testing
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span><span><strong>Security Unit Tests:</strong> Verifying authentication logic correctly rejects invalid credentials and handles edge cases.</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span><span><strong>Integration Testing:</strong> Ensuring secure data flow between the Client, Controller, and Database layers.</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span><span><strong>Vulnerability Checks:</strong> Automated tests to detect security misconfigurations in the Spring Boot context.</span></li>
            </ul>
          </div>

          {/* Card 6 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 text-base mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-lg px-2 py-1 text-sm font-mono">🐳</span>
              Running via Docker
            </h3>
            <p className="text-sm text-gray-600">
              The application is containerized to ensure a consistent, isolated, and secure runtime environment across all deployment targets.
            </p>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default About;
