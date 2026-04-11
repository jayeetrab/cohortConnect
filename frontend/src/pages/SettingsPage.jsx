import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Eye, Shield, ChevronRight, Lock, CheckCircle, AlertCircle, X } from 'lucide-react';
import axios from '../api/axios';

export default function SettingsPage() {
  const [activeForm, setActiveForm] = useState(null);
  const [authData, setAuthData] = useState({ current_password: '', new_password: '' });
  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });
    try {
      await axios.put('/auth/password', authData);
      setStatus({ type: 'success', message: 'Password updated successfully' });
      setAuthData({ current_password: '', new_password: '' });
      setTimeout(() => setActiveForm(null), 2000);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.detail || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      title: "Account Security",
      icon: <Shield className="text-emerald-500" size={24} />,
      items: [
        { id: 'password', label: "Change Password", description: "Update your authentication credentials" },
        { id: '2fa', label: "Two-Factor Authentication", description: "Add an extra layer of security" }
      ]
    },
    {
      title: "Notifications",
      icon: <Bell className="text-sky-500" size={24} />,
      items: [
        { id: 'email_pref', label: "Email Preferences", description: "Manage what updates you receive via email" }
      ]
    },
    {
      title: "Privacy",
      icon: <Eye className="text-purple-500" size={24} />,
      items: [
        { id: 'visibility', label: "Profile Visibility", description: "Control who can see your portfolio and details" }
      ]
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 text-[var(--foreground)]">
      <div>
        <h1 className="text-3xl font-bold mb-2 tracking-tight">Settings & Preferences</h1>
        <p className="text-[var(--primary-500)]">Manage your account security, notifications, and privacy options.</p>
      </div>

      <div className="space-y-6">
        {sections.map((section, sId) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sId * 0.1 }}
            key={sId} 
            className="glass-panel overflow-hidden rounded-2xl"
          >
            <div className="p-6 border-b border-[var(--border)] bg-black/5 dark:bg-white/5">
              <h2 className="text-lg font-bold flex items-center gap-3">
                {section.icon} {section.title}
              </h2>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {section.items.map((item) => (
                <div key={item.id}>
                  <div 
                    onClick={() => setActiveForm(activeForm === item.id ? null : item.id)}
                    className="p-6 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <div>
                      <h3 className="font-semibold group-hover:text-[var(--primary-600)] transition-colors">{item.label}</h3>
                      <p className="text-sm text-[var(--primary-500)] mt-1">{item.description}</p>
                    </div>
                    <ChevronRight className={`text-[var(--primary-500)] transition-transform ${activeForm === item.id ? 'rotate-90' : ''}`} />
                  </div>
                  
                  {/* EXPANDABLE FORMS */}
                  <AnimatePresence>
                    {activeForm === 'password' && item.id === 'password' && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-black/5 dark:bg-white/10 border-t border-[var(--border)]"
                      >
                        <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                          {status.message && (
                             <div className={`p-3 rounded-lg flex items-center gap-2 text-sm font-medium ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {status.message}
                             </div>
                          )}
                          <div>
                            <label className="text-xs font-semibold text-[var(--primary-500)] uppercase">Current Password</label>
                            <input 
                              type="password" required 
                              value={authData.current_password} 
                              onChange={e => setAuthData({...authData, current_password: e.target.value})}
                              className="w-full mt-1 bg-transparent border border-[var(--border)] rounded-lg p-3 outline-none text-[var(--foreground)]" 
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-[var(--primary-500)] uppercase">New Password</label>
                            <input 
                              type="password" required 
                              value={authData.new_password} 
                              onChange={e => setAuthData({...authData, new_password: e.target.value})}
                              className="w-full mt-1 bg-transparent border border-[var(--border)] rounded-lg p-3 outline-none text-[var(--foreground)]" 
                            />
                          </div>
                          <div className="flex gap-3 justify-end pt-2">
                             <button type="button" onClick={() => setActiveForm(null)} className="px-4 py-2 font-medium text-[var(--primary-500)] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors">Cancel</button>
                             <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 font-medium bg-[var(--foreground)] text-[var(--background)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                                <Lock size={16} /> Save Password
                             </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
