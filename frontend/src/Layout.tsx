import { motion } from 'framer-motion';

interface LayoutProps {
  children: any;
  onNavigateToLogin?: () => void;
  loginLabel?: string;
  onNavigateToAbout?: () => void;
}

const Layout = ({ children, onNavigateToLogin, loginLabel = 'Log In', onNavigateToAbout }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-tc-bg font-sans text-tc-text">

      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="sticky top-0 z-50 bg-tc-surface border-b border-tc-border"
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-tc-blue rounded-md flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-tc-bg" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-tc-blue">This</span>
              <span className="text-tc-text">Count</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-3">
            {onNavigateToAbout && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onNavigateToAbout}
                className="text-tc-muted hover:text-tc-blue font-medium transition-colors duration-200 px-3 py-1.5 rounded-md hover:bg-tc-elevated"
              >
                About
              </motion.button>
            )}
            {onNavigateToLogin && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onNavigateToLogin}
                className="px-4 py-1.5 border border-tc-border text-tc-text rounded-lg hover:border-tc-blue hover:text-tc-blue font-medium transition-colors duration-200"
              >
                {loginLabel}
              </motion.button>
            )}
          </nav>

        </div>
      </motion.header>

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="bg-tc-surface border-t border-tc-border">
        <div className="container mx-auto px-6 py-6 text-center">
          <div className="flex justify-center items-center gap-8 mb-3">
            <a href="#" className="text-sm text-tc-muted hover:text-tc-blue transition-colors duration-200">Terms of Service</a>
            <a href="#" className="text-sm text-tc-muted hover:text-tc-blue transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="text-sm text-tc-muted hover:text-tc-blue transition-colors duration-200">Contact Us</a>
          </div>
          <p className="text-sm text-tc-faint">© 2025 ThisCount. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default Layout;
