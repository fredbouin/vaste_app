// src/components/layout/MainLayout.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Calculator, FileText, Settings } from 'lucide-react';

const MainLayout = ({ children }) => {
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Timeline',
      path: '/timeline',
      icon: Calendar
    },
    {
      name: 'Pricing',
      path: '/pricing',
      icon: Calculator
    },
    {
      name: 'Price Sheet',
      path: '/price-sheet',
      icon: FileText
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white border-r shadow-sm">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-800">Production Manager</h1>
        </div>
        
        <nav className="mt-4">
          {navigationItems.map(({ name, path, icon: Icon }) => {
            const isActive = location.pathname === path;
            
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;