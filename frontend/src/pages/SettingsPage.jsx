import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Eye, Shield, ChevronRight, Lock, CheckCircle, 
  AlertCircle, X, Smartphone, Globe, Cloud, Zap, 
  Sparkles, Fingerprint, Mail, Share2
} from 'lucide-react';
import axios from '../api/axios';

export default function SettingsPage() {
  const [activeForm, setActiveForm] = useState(null);
  const [authData, setAuthData] = useState({ current_password: '', new_password: '' });
  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    twoFactor: false,
    emailNotips: true,
    profileVisible: true,
    stealthMode: false,
    analyticsEnabled: true
  });

  const handleToggle = (key) => {
    setSyncing(true);
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    // Simulate cloud sync
    setTimeout(() => setSyncing(false), 800);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });
    try {
      await axios.put('/api/auth/password', authData);
      setStatus({ type: 'success', message: 'Credentials updated successfully.' });
      setAuthData({ current_password: '', new_password: '' });
      setTimeout(() => setActiveForm(null), 2000);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.detail || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const menuSections = [
    {
      title: "Security Hub",
      icon: <Shield className="text-emerald-500" size={24} />,
      items: [
        { id: 'password', label: "Account Credentials", description: "Secure your access password", icon: <Lock size={18}/> },
        { id: '2fa', label: "Identity Protection", description: "Enable 2FA via authenticator app", icon: <Fingerprint size={18}/>, type: 'toggle', key: 'twoFactor' }
      ]
    },
    {
      title: "Career Presence",
      icon: <Globe className="text-sky-500" size={24} />,
      items: [
        { id: 'visibility', label: "Hiring Visibility", description: "Allow placement officers to see your profile", icon: <Eye size={18}/>, type: 'toggle', key: 'profileVisible' },
        { id: 'stealth', label: "Confidential Mode", description: "Hide your identity from the general network", icon: <Share2 size={18}/>, type: 'toggle', key: 'stealthMode' }
      ]
    },
    {
      title: "Communications",
      icon: <Cloud className="text-purple-500" size={24} />,
      items: [
        { id: 'email', label: "Placement Alerts", description: "Get job alerts via email", icon: <Mail size={18}/>, type: 'toggle', key: 'emailNotips' },
        { id: 'analytics', label: "Strategy Feedback", description: "Help improve our matching with anonymous data", icon: <Zap size={18}/>, type: 'toggle', key: 'analyticsEnabled' }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      
      <div className="flex justify-between items-end gap-6 pt-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-[var(--foreground)] tracking-tighter">Command Center</h1>
          <p className="text-[var(--primary-500)] text-lg font-medium">Calibrate your privacy and placement visibility parameters.</p>
        </div>
        <AnimatePresence>
          {syncing && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-widest rounded-full border border-emerald-500/20 mb-2"
            >
              <Sparkles size={12} className="animate-spin" /> Updating Ecosystem
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-8">
        {menuSections.map((section, sId) => (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sId * 0.1 }}
            key={sId} 
            className="group"
          >
            <div className="flex items-center gap-3 mb-4 px-4">
              <span className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border)]">{section.icon}</span>
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[var(--primary-500)]">{section.title}</h2>
            </div>

            <div className="glass-panel border border-[var(--border)] rounded-[2.5rem] overflow-hidden bg-[var(--background)]/60 backdrop-blur-3xl">
              <div className="divide-y divide-[var(--border)]">
                {section.items.map((item) => (
                  <div key={item.id} className="relative">
                    <div 
                      onClick={() => item.type !== 'toggle' && setActiveForm(activeForm === item.id ? null : item.id)}
                      className={`p-8 flex items-center justify-between transition-all ${item.type !== 'toggle' ? 'hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer' : ''}`}
                    >
                      <div className="flex items-center gap-6">
                        <div className="p-3 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-2xl text-[var(--primary-600)]">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-[var(--foreground)] tracking-tight">{item.label}</h3>
                          <p className="text-sm text-[var(--primary-600)] font-medium mt-1">{item.description}</p>
                        </div>
                      </div>

                      {item.type === 'toggle' ? (
                        <button 
                          onClick={() => handleToggle(item.key)}
                          className={`w-14 h-8 rounded-full transition-all relative flex items-center p-1 ${settings[item.key] ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-[var(--border)] border border-[var(--border)]'}`}
                        >
                          <motion.div 
                            animate={{ x: settings[item.key] ? 24 : 0 }}
                            className={`w-6 h-6 rounded-full shadow-lg ${settings[item.key] ? 'bg-white' : 'bg-[var(--primary-600)]'}`}
                          />
                        </button>
                      ) : (
                        <ChevronRight className={`text-[var(--primary-500)] transition-transform ${activeForm === item.id ? 'rotate-90' : ''}`} />
                      )}
                    </div>
                    
                    {/* PASSWORD CHANGE FORM */}
                    <AnimatePresence>
                      {activeForm === 'password' && item.id === 'password' && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-[var(--border)] bg-black/5 dark:bg-white/5"
                        >
                          <form onSubmit={handlePasswordChange} className="p-8 md:p-12 space-y-6 max-w-xl mx-auto">
                            {status.message && (
                               <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                  {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />} {status.message}
                               </div>
                            )}
                            <div className="space-y-4">
                              <div>
                                <label className="text-xs font-black text-[var(--primary-500)] uppercase tracking-widest pl-1">Current Password</label>
                                <input 
                                  type="password" required 
                                  value={authData.current_password} 
                                  onChange={e => setAuthData({...authData, current_password: e.target.value})}
                                  className="w-full mt-2 bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4 outline-none text-[var(--foreground)] font-bold focus:border-[var(--primary-500)] transition-all" 
                                />
                              </div>
                              <div>
                                <label className="text-xs font-black text-[var(--primary-500)] uppercase tracking-widest pl-1">New Identity Code</label>
                                <input 
                                  type="password" required 
                                  value={authData.new_password} 
                                  onChange={e => setAuthData({...authData, new_password: e.target.value})}
                                  className="w-full mt-2 bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4 outline-none text-[var(--foreground)] font-bold focus:border-[var(--primary-500)] transition-all" 
                                />
                              </div>
                            </div>
                            <div className="flex gap-4 justify-end pt-4">
                               <button type="button" onClick={() => setActiveForm(null)} className="px-6 py-3 font-bold text-[var(--primary-500)] hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all">Cancel</button>
                               <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-3 font-black bg-[var(--foreground)] text-[var(--background)] rounded-2xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 shadow-xl">
                                  {loading ? "Re-syncing..." : "Update Security"}
                               </button>
                            </div>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
