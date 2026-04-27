import { useState, useEffect } from 'react';
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

  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/auth/status', { credentials: 'include' });
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const endpoint = isSetupMode ? '/setup' : '/register';
    const url = `http://localhost:8080/api/auth${endpoint}`;

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
        alert("Action Failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Network Error: Is backend running?");
    }
  };

  if (isSuccess) {
    return <RegistrationSuccess onLoginClick={onNavigateToLogin} />;
  }

  if (loading) return <div className="text-center mt-20">Loading system status...</div>;

  return (
    <Layout onNavigateToLogin={onNavigateToLogin} onNavigateToAbout={onNavigateToAbout}>
      <div 
        className={`bg-white rounded-2xl p-8 sm:p-12 w-full max-w-lg shadow-2xl transition-all duration-500 ${isSetupMode ? 'border-2 border-thiscount-blue-primary' : ''}`}
        style={{boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.2), 0 10px 10px -5px rgba(59, 130, 246, 0.1)'}}
      >
        <h2 className="text-3xl font-bold mb-2 text-center text-thiscount-text-primary">
          {isSetupMode ? '🚀 First Time Setup' : 'Create Account'}
        </h2>
        <p className="text-sm text-center text-gray-500 mb-8">
          {isSetupMode ? "Database is empty. Create Admin." : "Join our community today"}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" name="fullName" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-thiscount-blue-primary outline-none"
              onChange={handleChange} required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" name="email" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-thiscount-blue-primary outline-none"
              onChange={handleChange} required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" name="password" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-thiscount-blue-primary outline-none"
              onChange={handleChange} required
            />
          </div>

          <button 
            type="submit" 
            className={`w-full text-white font-semibold py-3 px-6 rounded-full transition duration-300 shadow-lg mt-4 ${isSetupMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSetupMode ? 'Initialize System' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 text-center">
            <button onClick={onNavigateToLogin} className="text-blue-600 hover:underline font-medium">
                Already have an account? Log In
            </button>
        </div>
      </div>
    </Layout>
  );
};

export default Register;