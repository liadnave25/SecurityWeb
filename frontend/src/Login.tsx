import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from './Layout';

function getCsrfToken() {
  return document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, "$1");
}

interface LoginProps {
  onSwitchToRegister: () => void;
  onLoginSuccess?: () => void;
  onNavigateToAbout?: () => void;
}

const Login = ({ onSwitchToRegister, onLoginSuccess, onNavigateToAbout }: LoginProps) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/auth/status', { credentials: 'include' })
      .then(() => console.log("CSRF Token initialized successfully"))
      .catch(err => console.error("Failed to init CSRF token", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': getCsrfToken()
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          alert("Login Successful! Welcome " + data.user);
        }
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout onNavigateToLogin={() => {}} onNavigateToAbout={onNavigateToAbout}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="tc-card p-8 sm:p-10 w-full max-w-md shadow-dark-lg"
      >
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-tc-blue/10 border border-tc-blue/20 rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6 text-tc-blue" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-1 text-center text-tc-text">Welcome back</h2>
        <p className="text-tc-muted text-sm text-center mb-8">Sign in to your secure account</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-tc-muted mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              className="tc-input"
              placeholder="you@example.com"
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-tc-muted mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              className="tc-input"
              placeholder="••••••••"
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 bg-tc-red/10 border border-tc-red/30 text-tc-red rounded-lg px-4 py-3 text-sm"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
            className="tc-btn-primary w-full mt-2"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </motion.button>
        </form>

        <p className="text-center text-tc-muted text-sm mt-6">
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} className="text-tc-blue hover:underline font-semibold">
            Sign Up
          </button>
        </p>
      </motion.div>
    </Layout>
  );
};

export default Login;
