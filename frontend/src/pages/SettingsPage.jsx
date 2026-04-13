import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Shield, Lock, Globe, Eye, Mail, Zap, Moon, Sun,
  LogOut, CheckCircle, AlertCircle, Fingerprint,
  EyeOff, Cloud, Share2
} from 'lucide-react';

const Toggle = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
      enabled ? 'bg-[#F97316]' : 'bg-black/20 dark:bg-white/10'
    }`}
  >
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
      enabled ? 'translate-x-5' : 'translate-x-0'
    }`} />
  </button>
);

export default function SettingsPage() {
  const { user, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [authData, setAuthData] = useState({ current_password: '', new_password: '', confirm: '' });
  const [pwStatus, setPwStatus] = useState(null);
  const [pwLoading, setPwLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [toggles, setToggles] = useState({
    twoFactor: false,
    profileVisible: true,
    stealthMode: false,
    emailNotifs: true,
    analyticsEnabled: true,
  });

  const handleToggle = (key) => {
    setSyncing(true);
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
    setTimeout(() => setSyncing(false), 800);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (authData.new_password !== authData.confirm) {
      setPwStatus({ ok: false, msg: 'New passwords do not match.' });
      return;
    }
    if (authData.new_password.length < 8) {
      setPwStatus({ ok: false, msg: 'Password must be at least 8 characters.' });
      return;
    }
    setPwLoading(true);
    setPwStatus(null);
    try {
      await api.put('/api/auth/password', {
        current_password: authData.current_password,
        new_password: authData.new_password,
      });
      setPwStatus({ ok: true, msg: 'Password updated successfully.' });
      setAuthData({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setPwStatus({ ok: false, msg: err.response?.data?.detail || 'Password update failed.' });
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/auth');
  };

  const menuSections = [
    {
      title: 'Security Hub',
      icon: <Shield className="text-emerald-500" size={20} />,
      items: [
        {
          id: 'password',
          label: 'Account Credentials',
          description: 'Update your login password',
          icon: <Lock size={16} />,
          type: 'form',
        },
        {
          id: '2fa',
          label: 'Identity Protection',
          description: 'Enable two-factor authentication',
          icon: <Fingerprint size={16} />,
          type: 'toggle',
          key: 'twoFactor',
        },
      ],
    },
    {
      title: 'Career Presence',
      icon: <Globe className="text-sky-500" size={20} />,
      items: [
        {
          id: 'visibility',
          label: 'Hiring Visibility',
          description: 'Allow employers to discover your profile',
          icon: <Eye size={16} />,
          type: 'toggle',
          key: 'profileVisible',
        },
        {
          id: 'stealth',
          label: 'Confidential Mode',
          description: 'Hide your identity from the general network',
          icon: <EyeOff size={16} />,
          type: 'toggle',
          key: 'stealthMode',
        },
      ],
    },
    {
      title: 'Communications',
      icon: <Cloud className="text-purple-500" size={20} />,
      items: [
        {
          id: 'email',
          label: 'Placement Alerts',
          description: 'Receive job match notifications by email',
          icon: <Mail size={16} />,
          type: 'toggle',
          key: 'emailNotifs',
        },
        {
          id: 'analytics',
          label: 'Anonymous Analytics',
          description: 'Help improve matching with anonymous usage data',
          icon: <Zap size={16} />,
          type: 'toggle',
          key: 'analyticsEnabled',
        },
      ],
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--primary-500)] mb-1">Settings</p>
            <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Command Centre</h1>
            <p className="text-[var(--primary-500)] text-sm mt-1">Manage your privacy and placement visibility.</p>
          </div>
          <AnimatePresence>
            {syncing && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20"
              >
                <span className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                Saving
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel border border-[var(--border)] rounded-2xl p-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark'
              ? <Moon size={18} className="text-[var(--primary-500)]" />
              : <Sun size={18} className="text-yellow-400" />}
            <div>
              <p className="text-sm font-bold text-[var(--foreground)]">
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </p>
              <p className="text-xs text-[var(--primary-500)]">Toggle interface appearance</p>
            </div>
          </div>
          <Toggle enabled={theme === 'dark'} onChange={toggleTheme} />
        </div>
      </motion.div>

      {/* Settings sections */}
      {menuSections.map((section, sIdx) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sIdx * 0.08 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-3 px-1">
            <span className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-[var(--border)]">
              {section.icon}
            </span>
            <h2 className="text-xs font-black uppercase tracking-widest text-[var(--primary-500)]">
              {section.title}
            </h2>
          </div>

          <div className="glass-panel border border-[var(--border)] rounded-2xl overflow-hidden divide-y divide-[var(--border)]">
            {section.items.map((item) => (
              <div key={item.id} className="p-5">
                {item.type === 'toggle' ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--primary-500)]">{item.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-[var(--foreground)]">{item.label}</p>
                        <p className="text-xs text-[var(--primary-500)]">{item.description}</p>
                      </div>
                    </div>
                    <Toggle
                      enabled={toggles[item.key]}
                      onChange={() => handleToggle(item.key)}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--primary-500)]">{item.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-[var(--foreground)]">{item.label}</p>
                        <p className="text-xs text-[var(--primary-500)]">{item.description}</p>
                      </div>
                    </div>
                    <form onSubmit={handlePasswordChange} className="space-y-3">
                      {[
                        { key: 'current_password', placeholder: 'Current password' },
                        { key: 'new_password', placeholder: 'New password (min 8 chars)' },
                        { key: 'confirm', placeholder: 'Confirm new password' },
                      ].map((f) => (
                        <input
                          key={f.key}
                          type="password"
                          placeholder={f.placeholder}
                          value={authData[f.key]}
                          onChange={(e) => setAuthData({ ...authData, [f.key]: e.target.value })}
                          required
                          className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--primary-500)] outline-none focus:border-[#F97316]/50 transition-colors"
                        />
                      ))}

                      <AnimatePresence>
                        {pwStatus && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                              pwStatus.ok
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/10 border border-red-500/20 text-red-400'
                            }`}
                          >
                            {pwStatus.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                            {pwStatus.msg}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={pwLoading}
                          className="px-5 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#ea6c0a] text-white text-sm font-bold transition-all shadow-lg shadow-[#F97316]/20 disabled:opacity-50 flex items-center gap-2"
                        >
                          {pwLoading
                            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating…</>
                            : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Danger zone */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel border border-red-500/20 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[var(--foreground)]">Sign out of Cohort Connect</p>
            <p className="text-xs text-[var(--primary-500)]">You will be redirected to the login screen.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-bold transition-all"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </motion.div>
        </div>
  );
}