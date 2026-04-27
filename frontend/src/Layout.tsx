
interface LayoutProps {
  children: any;
  onNavigateToLogin?: () => void;
  onNavigateToAbout?: () => void;
}

const Layout = ({ children, onNavigateToLogin, onNavigateToAbout }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-thiscount-gray-light font-sans text-gray-700">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold cursor-pointer">
            <span className="text-blue-600">This</span><span className="text-gray-800">Count</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={onNavigateToAbout}
              className="text-gray-600 hover:text-blue-600 font-medium transition"
            >
              About
            </button>
            {onNavigateToLogin && (
              <button
                onClick={onNavigateToLogin}
                className="px-5 py-2 text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-100 font-medium transition"
              >
                Log In
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-700 text-white">
        <div className="container mx-auto px-6 py-6 text-center">
          <div className="flex justify-center items-center space-x-6 mb-4">
            <a href="#" className="text-sm hover:underline">Terms of Service</a>
            <a href="#" className="text-sm hover:underline">Privacy Policy</a>
            <a href="#" className="text-sm hover:underline">Contact Us</a>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            © 2025 ThisCount. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;