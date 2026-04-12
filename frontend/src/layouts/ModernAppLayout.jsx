
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Home, Briefcase, Users, MessageSquare,
  Settings, LogOut, User, Moon, Sun, Rocket
} from 'lucide-react';

export default function ModernAppLayout({ children, userType = 'student' }) {
  const { user, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const getNavItems = () => {
    switch (userType) {
      case 'employer':
        return [
          { icon: Home, label: 'Dashboard', path: '/employer' },
          { icon: Users, label: 'Talent Network', path: '/network' },
          { icon: Briefcase, label: 'My Listings', path: '/jobs' },
        ];
      case 'admin':
        return [
          { icon: Home, label: 'Control Center', path: '/admin' },
          { icon: Users, label: 'Directory', path: '/network' },
        ];
      default:
        return [
          { icon: Home, label: 'Dashboard', path: '/student' },
          { icon: Rocket, label: 'Jobs', path: '/jobs' },
          { icon: Users, label: 'Alumni', path: '/alumni' },
          { icon: MessageSquare, label: 'Messages', path: '/messaging' },
        ];
    }
  };

  const navItems = getNavItems();
  const bottomNavItems = [...navItems, { icon: User, label: 'Profile', path: '/profile' }];

  const handleNavigation = (path) => navigate(path);

  return (
    <div className="min-h-screen bg-transparent flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed h-full glass-panel border-r z-50">
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
            Cohort
          </h1>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[var(--foreground)]">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all relative ${isActive ? 'text-[var(--foreground)] font-medium' : 'text-[var(--primary-600)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-lg border border-[var(--border)]"
                    initial={false}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />
                )}
                <item.icon size={18} className="relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border)]">
          <button
            onClick={() => handleNavigation('/profile')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[var(--primary-600)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <User size={18} />
            <span>Profile</span>
          </button>
          <button
            onClick={() => handleNavigation('/settings')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[var(--primary-600)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button
            onClick={() => { logoutUser(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors mt-2"
          >
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 relative min-h-screen">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="p-4 md:p-8 max-w-5xl mx-auto text-[var(--foreground)]"
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full glass-panel border-t z-50 px-6 py-4 flex justify-between items-center pb-safe">
        {bottomNavItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.label}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${isActive ? 'text-[var(--foreground)]' : 'text-[var(--primary-600)] hover:text-[var(--foreground)]'
                }`}
            >
              <item.icon size={22} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

