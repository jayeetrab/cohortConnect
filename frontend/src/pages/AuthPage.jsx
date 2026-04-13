import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function AuthPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { value: 'student', label: 'Student', icon: '🎓' },
    { value: 'employer', label: 'Employer', icon: '🏢' },
    { value: 'alumni', label: 'Alumni', icon: '🤝' },
    { value: 'admin', label: 'Admin', icon: '🛡️' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        const params = new URLSearchParams();
        params.append('username', form.email);
        params.append('password', form.password);
        const res = await api.post('/api/auth/login', params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        loginUser(res.data);
      } else {
        const res = await api.post('/api/auth/register', form);
        loginUser(res.data);
      }
      const role = localStorage.getItem('cc_role') || form.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'employer') navigate('/employer');
      else navigate('/student');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#F97316] opacity-[0.05] blur-[140px]  pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#14B8A6] opacity-[0.05] blur-[120px] pointer-events-none" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#F97316]/20 to-[#14B8A6]/15 border border-[var(--border)] flex items-center justify-center text-xl font-black text-[var(--foreground)] shadow-2xl">
            CC
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Cohort Connect</h1>
          <p className="text-[var(--primary-500)] text-sm mt-1">University of Bristol · AI Placement Platform</p>
        </div>

        {/* Card */}
        <div className="glass-panel border border-[var(--border)] rounded-2xl p-8 shadow-2xl">
          {/* Toggle */}
          <div className="flex bg-black/5 dark:bg-white/5 rounded-xl p-1 mb-6">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === m
                    ? 'bg-[#F97316] text-white shadow-lg shadow-[#F97316]/20'
                    : 'text-[var(--primary-500)] hover:text-[var(--foreground)]'
                  }`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <input
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--primary-500)] focus:outline-none focus:border-[#F97316]/50 transition-colors"
              />
            )}
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--primary-500)] focus:outline-none focus:border-[#F97316]/50 transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--primary-500)] focus:outline-none focus:border-[#F97316]/50 transition-colors"
            />

            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-2">
                {roles.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`py-2.5 px-3 rounded-xl border text-sm transition-all duration-200 flex items-center gap-2 font-medium ${form.role === r.value
                        ? 'border-[#F97316]/60 bg-[#F97316]/10 text-[#F97316]'
                        : 'border-[var(--border)] text-[var(--primary-500)] hover:text-[var(--foreground)] hover:border-[var(--primary-500)]'
                      }`}
                  >
                    {r.icon} {r.label}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#F97316] hover:bg-[#ea6c0a] text-white font-bold text-sm transition-all duration-200 disabled:opacity-50 shadow-lg shadow-[#F97316]/20 hover:shadow-[#F97316]/30"
            >
              {loading
                ? 'Please wait…'
                : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}