import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from './Layout';

interface AboutProps {
  onNavigateToLogin: () => void;
  onNavigateToDashboard: () => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.07, ease: 'easeOut' as const },
  }),
};

const About = ({ onNavigateToLogin, onNavigateToDashboard }: AboutProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/debug/me', { credentials: 'include' })
      .then(res => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  const handleBack = () => isLoggedIn ? onNavigateToDashboard() : onNavigateToLogin();
  const techStack = [
    { label: 'Backend', value: 'Java 21 + Spring Boot 3' },
    { label: 'Frontend', value: 'React 19 + TypeScript + Vite' },
    { label: 'Security', value: 'Spring Security' },
    { label: 'Cryptography', value: 'Argon2 Password Hashing' },
    { label: 'Infrastructure', value: 'Docker + Kubernetes' },
    { label: 'Build Tool', value: 'Maven' },
    { label: 'Database', value: 'PostgreSQL 15' },
    { label: 'CI/CD', value: 'GitHub Actions' },
  ];

  const securityCards = [
    {
      num: '01',
      title: 'Advanced Identity & Authentication',
      accent: 'tc-blue',
      items: [
        { bold: 'Argon2 Hashing', text: 'Winner of the Password Hashing Competition — replaces legacy MD5/SHA entirely.' },
        { bold: 'Memory-Hardness', text: 'Configured to require significant RAM, making GPU-based brute force highly impractical.' },
        { bold: 'Unique Salting', text: 'Every password is cryptographically salted before hashing.' },
      ],
    },
    {
      num: '02',
      title: 'Secure File Upload & Validation',
      accent: 'tc-blue',
      items: [
        { bold: 'Strict Validation', text: 'Server-side verification of file types, extensions, and sizes via FileValidationService.' },
        { bold: 'Magic-Byte Detection', text: 'Apache Tika inspects file content to catch executables disguised as images.' },
        { bold: 'Boundary Enforcement', text: 'FileUploadConfig ensures uploads stay within safe directory boundaries.' },
      ],
    },
    {
      num: '03',
      title: 'Rate Limiting & DoS Protection',
      accent: 'tc-amber',
      items: [
        { bold: 'Bucket4j Token Bucket', text: '3 requests per 5 minutes per user/IP — blocks brute force at the service layer.' },
        { bold: 'Service Stability', text: 'Protects authentication and sensitive API endpoints from automated attacks.' },
      ],
    },
    {
      num: '04',
      title: 'Secure Data Storage & Handling',
      accent: 'tc-blue',
      items: [
        { bold: 'Input Validation', text: 'Server-side sanitization prevents SQL Injection and XSS.' },
        { bold: 'CSRF Protection', text: 'CookieCsrfTokenRepository — state-changing requests require a valid CSRF token.' },
        { bold: 'Least Privilege', text: 'Database connections and application roles restricted to minimum permissions.' },
        { bold: 'Data Privacy', text: 'No user enumeration — unknown email and wrong password return identical errors.' },
      ],
    },
    {
      num: '05',
      title: 'Application Security Testing',
      accent: 'tc-emerald',
      items: [
        { bold: 'Unit Tests (JUnit + Mockito)', text: 'FileValidationService and RateLimitingService covered across all branches.' },
        { bold: 'Integration Tests (MockMvc)', text: 'Full security pipeline tested without a live database.' },
        { bold: 'Frontend Tests (Vitest + RTL)', text: 'FileUploadComponent covered including error states and network failure.' },
        { bold: 'CI Pipeline', text: 'GitHub Actions runs all backend and frontend tests on every push.' },
      ],
    },
    {
      num: '06',
      title: 'Cloud-Native Deployment',
      accent: 'tc-purple',
      items: [
        { bold: 'Kubernetes (Minikube)', text: 'All three services run as pods in a dedicated namespace with health probes.' },
        { bold: 'Nginx Ingress', text: 'Single entry point routes /api/* to the backend and /* to the React SPA.' },
        { bold: 'Secret Management', text: 'Credentials injected via K8s Secrets — never hardcoded or committed.' },
        { bold: 'Multi-stage Docker Builds', text: 'Minimal production images — no build tools in the final container.' },
      ],
    },
  ];

  const accentBorder: Record<string, string> = {
    'tc-blue':   'border-tc-blue/30',
    'tc-amber':  'border-tc-amber/30',
    'tc-emerald':'border-tc-emerald/30',
    'tc-purple': 'border-tc-purple/30',
  };
  const accentText: Record<string, string> = {
    'tc-blue':   'text-tc-blue',
    'tc-amber':  'text-tc-amber',
    'tc-emerald':'text-tc-emerald',
    'tc-purple': 'text-tc-purple',
  };
  const accentBg: Record<string, string> = {
    'tc-blue':   'bg-tc-blue/10',
    'tc-amber':  'bg-tc-amber/10',
    'tc-emerald':'bg-tc-emerald/10',
    'tc-purple': 'bg-tc-purple/10',
  };

  return (
    <Layout onNavigateToLogin={handleBack} loginLabel={isLoggedIn ? 'Dashboard' : 'Log In'}>
      <div className="max-w-4xl w-full space-y-10 pb-20">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-3 tc-card px-6 py-3 rounded-2xl">
            <svg className="w-7 h-7 text-tc-blue" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xl font-bold">
              <span className="text-tc-blue">This</span><span className="text-tc-text">Count</span>
            </span>
          </div>
          <p className="text-tc-muted text-base max-w-2xl mx-auto leading-relaxed">
            A secure web application demonstrating{' '}
            <span className="font-semibold text-tc-blue">Secure SDLC</span> principles —
            protecting against OWASP Top 10 vulnerabilities with robust authentication, rate limiting, and cloud-native deployment.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleBack}
            className="tc-btn-primary inline-block mt-2"
          >
            {isLoggedIn ? 'Back to Dashboard' : 'Go to Login'}
          </motion.button>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
          className="tc-card p-6"
        >
          <h2 className="text-sm font-bold text-tc-muted uppercase tracking-widest mb-5">Tech Stack</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {techStack.map(({ label, value }) => (
              <div key={label} className="bg-tc-elevated border border-tc-border rounded-xl p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-tc-faint mb-1">{label}</p>
                <p className="text-sm font-semibold text-tc-text leading-snug">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security Cards */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-tc-muted uppercase tracking-widest">Security Implementation</h2>
          {securityCards.map((card, i) => (
            <motion.div
              key={card.num}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className={`tc-card p-6 border ${accentBorder[card.accent]}`}
            >
              <h3 className="font-bold text-tc-text text-sm mb-4 flex items-center gap-3">
                <span className={`font-mono text-xs px-2 py-0.5 rounded ${accentBg[card.accent]} ${accentText[card.accent]} border ${accentBorder[card.accent]}`}>
                  {card.num}
                </span>
                {card.title}
              </h3>
              <ul className="space-y-2.5">
                {card.items.map(({ bold, text }) => (
                  <li key={bold} className="flex items-start gap-2.5 text-sm">
                    <span className={`mt-0.5 flex-shrink-0 ${accentText[card.accent]}`}>▸</span>
                    <span className="text-tc-muted">
                      <strong className="text-tc-text font-semibold">{bold}:</strong> {text}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

      </div>
    </Layout>
  );
};

export default About;
