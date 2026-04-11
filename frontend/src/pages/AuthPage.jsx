import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hexagon, Lock, User, Mail, Briefcase, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { loginUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'student'
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      let bodyData;
      let headers = {};
      
      if (isLogin) {
         bodyData = new URLSearchParams();
         bodyData.append('username', formData.email);
         bodyData.append('password', formData.password);
         headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
      } else {
         bodyData = JSON.stringify(formData);
         headers = { 'Content-Type': 'application/json' };
      }

      const baseUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://cohortconnect-1.onrender.com');
      const res = await fetch(`${baseUrl}/api/auth/${isLogin ? 'login' : 'register'}`, {
        method: 'POST',
        headers,
        body: bodyData
      });
      
      const data = await res.json();
      
      if (res.ok) {
        loginUser(data);
        if(data.role === 'admin') navigate('/admin');
        else if(data.role === 'employer') navigate('/employer');
        else navigate('/student');
      } else {
        setError(data.detail || 'Authentication failed');
      }
    } catch(err) {
       setError("Network error connecting to live auth server.");
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-[var(--foreground)] bg-[var(--background)] transition-colors duration-300">
      <button onClick={toggleTheme} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors z-50">
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Left side visual */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative overflow-hidden bg-gradient-to-br from-[var(--background)] to-[var(--card)] border-r border-[var(--border)]">
        <div className="relative z-10 max-w-lg">
           <Hexagon size={48} className="mb-8 text-[var(--foreground)]" strokeWidth={1.5} />
           <h1 className="text-4xl font-light mb-6 tracking-tight">Access the professional network.</h1>
           <p className="text-lg text-[var(--primary-500)] font-light leading-relaxed">Cohort uses advanced semantic graphs to map students, employers, and alumni effortlessly.</p>
        </div>
      </div>
      
      {/* Right side form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <AnimatePresence mode="wait">
          <motion.div 
            key={isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md mx-auto glass-panel p-10 rounded-2xl"
          >
             <div className="text-center mb-8 lg:hidden">
                <Hexagon size={40} className="mx-auto text-[var(--foreground)] mb-4" strokeWidth={1.5} />
                <h2 className="text-xl font-medium text-[var(--foreground)]">Cohort</h2>
             </div>

             <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-2">{isLogin ? 'Sign In' : 'Join Now'}</h2>
             <p className="text-sm text-[var(--primary-500)] mb-8">Secure entry to your workspace.</p>

             {error && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm font-medium border border-red-500/20">{error}</div>}

             <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="text-xs font-semibold text-[var(--primary-500)] block mb-1">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-3 text-[var(--primary-500)]" />
                      <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full pl-10 pr-3 py-2 bg-transparent border border-[var(--border)] rounded-md focus:border-[var(--foreground)] outline-none text-[var(--foreground)] transition-colors" placeholder="e.g. Jane Doe" />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-xs font-semibold text-[var(--primary-500)] block mb-1">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-[var(--primary-500)]" />
                    <input required type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full pl-10 pr-3 py-2 bg-transparent border border-[var(--border)] rounded-md focus:border-[var(--foreground)] outline-none text-[var(--foreground)] transition-colors" placeholder="user@domain.com" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--primary-500)] block mb-1">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-[var(--primary-500)]" />
                    <input required type="password" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} className="w-full pl-10 pr-3 py-2 bg-transparent border border-[var(--border)] rounded-md focus:border-[var(--foreground)] outline-none text-[var(--foreground)] transition-colors" placeholder="••••••••" />
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="text-xs font-semibold text-[var(--primary-500)] block mb-1">Account Role</label>
                    <div className="relative">
                      <Briefcase size={16} className="absolute left-3 top-3 text-[var(--primary-500)]" />
                      <select value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})} className="w-full pl-10 pr-3 py-2 bg-transparent border border-[var(--border)] rounded-md focus:border-[var(--foreground)] outline-none appearance-none text-[var(--foreground)] transition-colors">
                         <option className="bg-[var(--background)] text-[var(--foreground)]" value="student">Student</option>
                         <option className="bg-[var(--background)] text-[var(--foreground)]" value="employer">Employer / Recruiter</option>
                         <option className="bg-[var(--background)] text-[var(--foreground)]" value="alumni">Alumni</option>
                         <option className="bg-[var(--background)] text-[var(--foreground)]" value="admin">Administrator</option>
                      </select>
                    </div>
                  </div>
                )}

                <button disabled={isLoading} className="w-full bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 font-medium py-2.5 rounded-md shadow-sm transition-opacity mt-6 disabled:opacity-50">
                   {isLoading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Join')}
                </button>
             </form>

             <div className="mt-8 text-center border-t border-[var(--border)] pt-6">
                <span className="text-sm text-[var(--primary-500)]">
                   {isLogin ? "No account? " : "Already have an account? "}
                   <button onClick={()=>setIsLogin(!isLogin)} className="text-[var(--foreground)] font-medium hover:underline">
                      {isLogin ? 'Request access' : 'Sign in'}
                   </button>
                </span>
             </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
