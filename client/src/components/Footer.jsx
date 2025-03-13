import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase mb-4">
              Company
            </h3>
            <p className="text-base text-gray-500">
              © {currentYear} Production Timeline Tool. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <button className="text-base text-gray-500 hover:text-gray-900 transition-colors">
                  Clear Projects
                </button>
              </li>
              <li>
                <button className="text-base text-gray-500 hover:text-gray-900 transition-colors">
                  Add New Project
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li className="text-base text-gray-500">
                Need help? Contact support
              </li>
              <li>
                <button className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  <svg 
                    className="w-5 h-5 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                    />
                  </svg>
                  Contact Support
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Optional: Bottom bar with additional info */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-400 text-center">
            Designed and developed for efficient production management
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;