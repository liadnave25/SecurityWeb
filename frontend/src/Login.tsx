import { useState, useEffect } from 'react'; 
import Layout from './Layout'; 

function getCsrfToken() {
  return document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, "$1");
}

interface LoginProps {
  onSwitchToRegister: () => void;
  onLoginSuccess?: () => void; 
}

const Login = ({ onSwitchToRegister, onLoginSuccess }: LoginProps) => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  useEffect(() => {
    fetch('http://localhost:8080/api/auth/status', { credentials: 'include' })
      .then(() => console.log("CSRF Token initialized successfully"))
      .catch(err => console.error("Failed to init CSRF token", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': getCsrfToken()  
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (response.ok) {
        if (onLoginSuccess) {
            onLoginSuccess();
        } else {
            alert("Login Successful! Welcome " + data.user);
        }
      } else {
        alert("Login Failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Network Error");
    }
  };

  return (
    <Layout onNavigateToLogin={() => {}} onNavigateToRegister={onSwitchToRegister}>
       {/* ... אותו HTML שיש לך כבר ... */}
       <div className="bg-white rounded-2xl p-8 sm:p-12 w-full max-w-lg shadow-2xl" style={{boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.2), 0 10px 10px -5px rgba(59, 130, 246, 0.1)'}}>
            <h2 className="text-3xl font-bold mb-2 text-center text-thiscount-text-primary">Welcome Back</h2>
            {/* ... המשך הטופס שלך ... */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* ... שדות הקלט שלך ... */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-thiscount-blue-primary outline-none" onChange={handleChange} required />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" name="password" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-thiscount-blue-primary outline-none" onChange={handleChange} required />
                 </div>
                 <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-full hover:bg-blue-700 transition duration-300 shadow-lg hover:shadow-xl mt-4">Sign In</button>
            </form>
            <div className="mt-8 text-center">
                <p className="text-gray-600">
                    Don't have an account?{' '}
                    <button onClick={onSwitchToRegister} className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition">Sign Up</button>
                </p>
            </div>
       </div>
    </Layout>
  );
};

export default Login;