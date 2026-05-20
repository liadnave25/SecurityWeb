import { motion } from 'framer-motion';

interface RegistrationSuccessProps {
  onLoginClick: () => void;
}

const RegistrationSuccess = ({ onLoginClick }: RegistrationSuccessProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-tc-bg font-sans text-tc-text">

      <header className="sticky top-0 z-50 bg-tc-surface border-b border-tc-border">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onLoginClick}>
            <div className="w-7 h-7 bg-tc-blue rounded-md flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-tc-bg" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-tc-blue">This</span><span className="text-tc-text">Count</span>
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onLoginClick}
            className="px-4 py-1.5 border border-tc-border text-tc-text rounded-lg hover:border-tc-blue hover:text-tc-blue font-medium transition-colors duration-200"
          >
            Log In
          </motion.button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="tc-card p-10 sm:p-12 text-center w-full max-w-md shadow-dark-lg"
        >
          <div className="mx-auto mb-6 w-16 h-16 bg-tc-emerald/10 border border-tc-emerald/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-tc-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-tc-text mb-2">Account Created</h1>
          <p className="text-tc-muted text-sm mb-8 leading-relaxed">
            Your secure account is ready. Sign in to access the platform.
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onLoginClick}
            className="tc-btn-primary w-full"
          >
            Log In to Your Account
          </motion.button>

          <p className="text-xs text-tc-faint mt-6">
            A confirmation email has been sent to your inbox.
          </p>
        </motion.div>
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

export default RegistrationSuccess;
