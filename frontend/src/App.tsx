import { useState } from 'react';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import About from './About';

type Page = 'login' | 'register' | 'dashboard' | 'about';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');

  return (
    <div>
      {currentPage === 'login' && (
        <Login
          onSwitchToRegister={() => setCurrentPage('register')}
          onLoginSuccess={() => setCurrentPage('dashboard')}
          onNavigateToAbout={() => setCurrentPage('about')}
        />
      )}

      {currentPage === 'register' && (
        <Register
          onNavigateToLogin={() => setCurrentPage('login')}
          onNavigateToAbout={() => setCurrentPage('about')}
        />
      )}

      {currentPage === 'dashboard' && (
        <Dashboard
          onLogout={() => setCurrentPage('login')}
          onNavigateToAbout={() => setCurrentPage('about')}
        />
      )}

      {currentPage === 'about' && (
        <About
          onNavigateToLogin={() => setCurrentPage('login')}
          onNavigateToDashboard={() => setCurrentPage('dashboard')}
        />
      )}
    </div>
  );
}

export default App;
