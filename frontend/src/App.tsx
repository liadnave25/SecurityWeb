import { useState } from 'react';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'dashboard'>('login');

  return (
    <div>
      {currentPage === 'login' && (
        <Login 
          onSwitchToRegister={() => setCurrentPage('register')} 
          onLoginSuccess={() => setCurrentPage('dashboard')} 
        />
      )}
      
      {currentPage === 'register' && (
        <Register onNavigateToLogin={() => setCurrentPage('login')} />
      )}

      {currentPage === 'dashboard' && (
        <Dashboard onLogout={() => setCurrentPage('login')} />
      )}
    </div>
  );
}

export default App;