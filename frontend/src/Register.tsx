import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from './Layout';
import RegistrationSuccess from './RegistrationSuccess';

function getCsrfToken() {
  return document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, "$1");
}

interface RegisterProps {
  onNavigateToLogin: () => void;
  onNavigateToAbout?: () => void;
}

const Register = ({ onNavigateToLogin, onNavigateToAbout }: RegisterProps) => {
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/auth/status', { credentials: 'include' });
        const data = await response.json();
        if (data.isSetupRequired) {
          setIsSetupMode(true);
        }
      } catch (error) {
        console.error("Could not check system status", error);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const endpoint = isSetupMode ? '/setup' : '/register';
    const url = `/api/auth${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': getCsrfToken()
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Network error. Is the backend running?");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return <RegistrationSuccess onLoginClick={onNavigateToLogin} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-tc-bg">
        <div className="flex items-center gap-3 text-tc-muted">
          <svg className="w-5 h-5 animate-spin text-tc-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Checking system status...
        </div>
      </div>
    );
  }

  return (
    <Layout onNavigateToLogin={onNavigateToLogin} onNavigateToAbout={onNavigateToAbout}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`tc-card p-8 sm:p-10 w-full max-w-md shadow-dark-lg ${isSetupMode ? 'border-tc-purple/40' : ''}`}
      >
        <div className="flex justify-center mb-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${isSetupMode ? 'bg-tc-purple/10 border-tc-purple/20' : 'bg-tc-blue/10 border-tc-blue/20'}`}>
            {isSetupMode ? (
              <svg className="w-6 h-6 text-tc-purple" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-tc-blue" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
            )}
          </div>
        </div>

        <h2 className={`text-2xl font-bold mb-1 text-center ${isSetupMode ? 'text-tc-purple' : 'text-tc-text'}`}>
          {isSetupMode ? 'First Time Setup' : 'Create Account'}
        </h2>
        <p className="text-tc-muted text-sm text-center mb-8">
          {isSetupMode ? 'No users found. Initialize the Admin account.' : 'Join the secure platform today'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-tc-muted mb-1.5">Full Name</label>
            <input type="text" name="fullName" className="tc-input" placeholder="Jane Doe" onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-tc-muted mb-1.5">Email</label>
            <input type="email" name="email" className="tc-input" placeholder="you@example.com" onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-tc-muted mb-1.5">Password</label>
            <input type="password" name="password" className="tc-input" placeholder="••••••••" onChange={handleChange} required />
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
            className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-200 mt-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-dark-sm ${isSetupMode ? 'bg-tc-purple text-white hover:brightness-110' : 'tc-btn-primary'}`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Processing...
              </span>
            ) : isSetupMode ? 'Initialize System' : 'Create Account'}
          </motion.button>
        </form>

        <p className="text-center text-tc-muted text-sm mt-6">
          Already have an account?{' '}
          <button onClick={onNavigateToLogin} className="text-tc-blue hover:underline font-semibold">
            Log In
          </button>
        </p>
      </motion.div>
    </Layout>
  );
};

export default Register;
