import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Home, Briefcase, Users, MessageSquare, Settings,
  LogOut, User, Moon, Sun, Rocket, Shield, Network
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
          { icon: <Home size={18} />, label: 'Dashboard', path: '/employer' },
          { icon: <Users size={18} />, label: 'Talent Search', path: '/network' },
          { icon: <Briefcase size={18} />, label: 'Job Listings', path: '/jobs' },
        ];
      case 'admin':
        return [
          { icon: <Home size={18} />, label: 'Control Center', path: '/admin' },
          { icon: <Users size={18} />, label: 'Directory', path: '/network' },
          { icon: <Briefcase size={18} />, label: 'Jobs', path: '/jobs' },
        ];
      default:
        return [
          { icon: <Home size={18} />, label: 'Dashboard', path: '/student' },
          { icon: <Rocket size={18} />, label: 'Jobs', path: '/jobs' },
          { icon: <Users size={18} />, label: 'Alumni', path: '/alumni' },
          { icon: <MessageSquare size={18} />, label: 'Messages', path: '/messaging' },
        ];
    }
  };

  const navItems = getNavItems();
  const bottomNavItems = [
    ...navItems,
    { icon: <User size={22} />, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-transparent flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed h-full glass-panel border-r border-[var(--border)] z-50">
        <div className="p-6 flex items-center justify-between border-b border-[var(--border)]">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[var(--foreground)]">Cohort</h1>
            <p className="text-xs text-[var(--primary-500)]">University of Bristol</p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[var(--foreground)]"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border)]">
            <Shield size={14} className="text-[#F97316]" />
            <span className="text-xs font-semibold text-[var(--foreground)] capitalize">{user?.role}</span>
            <span className="text-xs text-[var(--primary-500)] truncate ml-auto">{user?.name?.split(' ')[0]}</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-2">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all relative ${
                  isActive
                    ? 'text-[var(--foreground)] font-medium'
                    : 'text-[var(--primary-600)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-lg border border-[var(--border)]"
                    initial={false}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  />
                )}
                <span className="relative z-10">{item.icon}</span>
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border)] space-y-1">
          <button
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[var(--primary-600)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <User size={18} /><span>Profile</span>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[var(--primary-600)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <Settings size={18} /><span>Settings</span>
          </button>
          <button
            onClick={() => { logoutUser(); navigate('/auth'); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors mt-2"
          >
            <LogOut size={18} /><span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 relative min-h-screen">
        <div className="p-4 md:p-8 max-w-5xl mx-auto text-[var(--foreground)]">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 w-full glass-panel border-t border-[var(--border)] z-50 px-6 py-3 flex justify-around items-center">
                {bottomNavItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                isActive ? 'text-[var(--foreground)]' : 'text-[var(--primary-600)] hover:text-[var(--foreground)]'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}