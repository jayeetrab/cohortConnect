
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { User, Mail, Briefcase, Award, Edit3, Shield, Star, Check, X } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/users/me');
        setProfile(res.data.profile || {});
        setFormData({
          name: res.data.profile?.name || user?.name || '',
          company: res.data.profile?.company || '',
          role: res.data.profile?.role || '',
          skills: (res.data.profile?.skills || res.data.profile?.expertise || []).join(', ')
        });
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        company: formData.company || undefined,
        role: formData.role || undefined,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      };

      const res = await axios.put('/users/me', payload);
      if (res.data.status === 'success') {
        setProfile(prev => ({ ...prev, ...payload }));
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Failed to update profile", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-slate-500/30 border-t-slate-500 rounded-full animate-spin" />
      </div>
    );
  }

  const roleColors = {
    student: 'from-blue-500/20 to-sky-400/20',
    alumni: 'from-purple-500/20 to-pink-400/20',
    employer: 'from-amber-500/20 to-orange-400/20',
    admin: 'from-rose-500/20 to-red-400/20'
  };

  const gradient = roleColors[user.role] || 'from-emerald-500/20 to-teal-400/20';

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl overflow-hidden relative"
      >
        <div className={`h-32 bg-gradient-to-r ${gradient} opacity-80`} />

        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-[var(--background)] border-4 border-[var(--background)] flex items-center justify-center shadow-xl z-10">
              <User size={48} className="text-[var(--primary-500)]" />
            </div>
            <div className="flex-1">
              {!isEditing ? (
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--foreground)] to-[var(--primary-600)]">
                  {profile?.name || user?.name || "User Profile"}
                </h1>
              ) : (
                <input
                  autoFocus
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="text-2xl font-bold bg-transparent border-b border-[var(--border)] outline-none text-[var(--foreground)] w-full max-w-sm pb-1 mb-1"
                />
              )}
              <p className="text-[var(--primary-500)] font-medium capitalize tracking-wide flex items-center gap-2 mt-1">
                <Shield size={16} /> {user?.role} Account
              </p>
            </div>

            <div className="flex gap-2">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all font-medium">
                  <Edit3 size={18} /> Edit Profile
                </button>
              ) : (
                <>
                  <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all font-medium text-[var(--primary-600)]">
                    <X size={18} /> Cancel
                  </button>
                  <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 rounded-xl transition-all font-medium">
                    <Check size={18} /> Save
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[var(--foreground)]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-[var(--primary-600)]">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs text-[var(--primary-500)] uppercase tracking-wider font-semibold">Email Address (Locked)</p>
                  <p className="font-medium text-sm mt-0.5">{user?.email}</p>
                </div>
              </div>

              {user.role === 'alumni' && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-[var(--primary-600)]">
                    <Briefcase size={20} />
                  </div>
                  {!isEditing ? (
                    <div>
                      <p className="text-xs text-[var(--primary-500)] uppercase tracking-wider font-semibold">Current Role</p>
                      <p className="font-medium text-sm mt-0.5">{profile?.role || "Not Set"} at {profile?.company || "Not Set"}</p>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                        placeholder="Role"
                        className="bg-transparent border-b border-[var(--border)] outline-none text-sm w-full"
                      />
                      <span className="text-[var(--primary-500)]">at</span>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Company"
                        className="bg-transparent border-b border-[var(--border)] outline-none text-sm w-full"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {user.role === 'student' && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Star size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--primary-500)] uppercase tracking-wider font-semibold">Hireability Score</p>
                    <p className="font-bold text-xl text-emerald-500 mt-0.5">{profile?.hireability_score || 0}<span className="text-sm font-normal">/100</span></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Skills & Expertise */}
      <AnimatePresence mode="popLayout">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="glass-panel p-8 rounded-3xl"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--foreground)]">
            <Award className="text-[var(--primary-600)]" /> Professional Capabilities
          </h3>

          {!isEditing ? (
            <div className="flex flex-wrap gap-2">
              {(profile?.skills || profile?.expertise || []).length > 0 ? (
                (profile?.skills || profile?.expertise).map((skill, idx) => (
                  <span key={idx} className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border)] text-sm font-medium cursor-default">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[var(--primary-500)] italic">No capabilities mapped yet.</span>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--primary-500)] uppercase tracking-wider">Comma Separated Skills</label>
              <textarea
                value={formData.skills}
                onChange={e => setFormData({ ...formData, skills: e.target.value })}
                className="w-full bg-transparent border border-[var(--border)] outline-none rounded-xl p-4 text-sm resize-none focus:border-[var(--foreground)] transition-colors h-24"
                placeholder="Python, React, Machine Learning, UI/UX..."
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
