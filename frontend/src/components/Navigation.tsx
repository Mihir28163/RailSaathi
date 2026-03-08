"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { LogIn, LogOut, User, Menu, X } from 'lucide-react';

interface NavigationProps {
  currentPage?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, isLoading } = useAuth();

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Modules', href: '#modules' },
    { name: 'Dashboard', href: '/dashboard' },
  ];

  return (
    <>
      <nav className="bg-black/40 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Removed RailSaathi text */}
            <div className="flex items-center">
              {/* Empty space for alignment */}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`text-white/80 hover:text-white transition-colors font-medium ${
                    currentPage === item.name ? 'text-white' : ''
                  }`}
                >
                  {item.name}
                </a>
              ))}
              
              {/* Auth Section */}
              <div className="flex items-center space-x-4">
                {isLoading ? (
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : isAuthenticated && user ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <User size={20} className="text-white/60" />
                      <span className="text-white/80 font-medium">{user.email}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-white/60 hover:text-red-400 transition-colors"
                      title="Logout"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={openAuthModal}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <LogIn size={18} />
                    <span>Login</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white/60 hover:text-white transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden py-4 border-t border-white/20 bg-black/80"
            >
              <div className="space-y-2">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors font-medium ${
                      currentPage === item.name ? 'text-white bg-white/20' : ''
                    }`}
                  >
                    {item.name}
                  </a>
                ))}
                
                {/* Mobile Auth Section */}
                <div className="pt-4 border-t border-white/20">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : isAuthenticated && user ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 px-3 py-2">
                        <User size={18} className="text-white/60" />
                        <span className="text-white/80 font-medium text-sm">{user.email}</span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={openAuthModal}
                      className="flex items-center space-x-2 w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <LogIn size={18} />
                      <span>Login</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </>
  );
};
