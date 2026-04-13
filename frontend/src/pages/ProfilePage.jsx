import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User, Mail, Briefcase, Shield, Edit3, Check, X, Star } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', bio: '', skills: '', projects: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/users/me');
        const p = res.data.profile || {};
        setProfile(p);
        setFormData({
          name: p.name || user?.name || '',
          bio: p.bio || '',
          skills: (p.skills || p.expertise || []).join(', '),
          projects: (p.projects || []).join(', '),
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const payload = {
        name: formData.name,
        bio: formData.bio || undefined,
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
        projects: formData.projects.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const res = await api.put('/api/users/me', payload);
      if (res.data.status === 'success') {
        setProfile((prev) => ({ ...prev, ...payload }));
        setIsEditing(false);
        setSaveMsg('Profile updated successfully.');
        setTimeout(() => setSaveMsg(''), 4000);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setSaveMsg('Update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const roleColors = {
    student:  'from-blue-500/20 to-sky-400/20',
    alumni:   'from-purple-500/20 to-pink-400/20',
    employer: 'from-amber-500/20 to-orange-400/20',
    admin:    'from-rose-500/20 to-red-400/20',
  };
  const gradient = roleColors[user?.role] || 'from-emerald-500/20 to-teal-400/20';

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-[var(--border)] border-t-[#F97316] rounded-full animate-spin" />
    </div>
  );

  const skills = profile?.skills || profile?.expertise || [];
  const projects = profile?.projects || [];
  const experience = profile?.experience || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel border border-[var(--border)] rounded-2xl overflow-hidden"
      >
        {/* Banner */}
        <div className={`h-28 bg-gradient-to-r ${gradient} opacity-80`} />

        {/* Avatar + info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-10 mb-5">
            <div className="w-20 h-20 rounded-2xl bg-[var(--background)] border-4 border-[var(--background)] flex items-center justify-center shadow-xl z-10">
              <User size={40} className="text-[var(--primary-500)]" />
            </div>
            <div className="flex-1">
              {!isEditing ? (
                <>
                  <h1 className="text-2xl font-black text-[var(--foreground)]">
                    {profile?.name || user?.name || 'Your Profile'}
                  </h1>
                  <p className="text-[var(--primary-500)] text-sm flex items-center gap-2 mt-0.5">
                    <Shield size={13} className="text-[#F97316]" />
                    <span className="capitalize font-semibold">{user?.role}</span>
                    <span className="text-[var(--border)]">·</span>
                    {user?.email}
                  </p>
                </>
              ) : (
                <input
                  autoFocus
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xl font-black bg-transparent border-b border-[var(--border)] outline-none text-[var(--foreground)] w-full max-w-sm pb-1 focus:border-[#F97316]/50 transition-colors"
                />
              )}
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--primary-500)] hover:text-[var(--foreground)] hover:border-[var(--primary-500)]/40 text-sm font-semibold transition-all"
                >
                  <Edit3 size={14} /> Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--primary-500)] hover:text-[var(--foreground)] text-sm font-semibold transition-all"
                  >
                    <X size={14} /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#F97316] hover:bg-[#ea6c0a] text-white text-sm font-bold transition-all shadow-lg shadow-[#F97316]/20 disabled:opacity-50"
                  >
                    {saving
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                      : <><Check size={14} /> Save</>}
                  </button>
                </>
              )}
            </div>
          </div>

          {saveMsg && (
            <div className={`px-4 py-2.5 rounded-xl text-sm font-semibold mb-4 ${
              saveMsg.includes('failed') || saveMsg.includes('Error')
                ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            }`}>
              {saveMsg}
            </div>
          )}

          {/* Bio */}
          {isEditing ? (
            <textarea
              placeholder="Write a short bio…"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="w-full bg-black/5 dark:bg-white/[0.03] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--primary-500)] resize-none outline-none focus:border-[#F97316]/50 transition-colors"
            />
          ) : (
            profile?.bio && (
              <p className="text-[var(--primary-500)] text-sm leading-relaxed">{profile.bio}</p>
            )
          )}
        </div>
      </motion.div>

      {/* Skills */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel border border-[var(--border)] rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-[var(--foreground)] font-black flex items-center gap-2">
          <Star size={16} className="text-[#F97316]" /> Skills
        </h2>
        {isEditing ? (
          <div>
            <p className="text-xs text-[var(--primary-500)] mb-2">Comma-separated list of skills</p>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="Python, React, Machine Learning…"
              className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--primary-500)] outline-none focus:border-[#F97316]/50 transition-colors"
            />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.length === 0 ? (
              <p className="text-[var(--primary-500)] text-sm">No skills added yet. Upload your CV or edit your profile.</p>
            ) : skills.map((s) => (
              <span key={s} className="px-2.5 py-0.5 rounded-full text-xs border bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20 font-medium">
                {s}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Projects */}
      {(projects.length > 0 || isEditing) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-panel border border-[var(--border)] rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-[var(--foreground)] font-black flex items-center gap-2">
            <Briefcase size={16} className="text-[#14B8A6]" /> Projects
          </h2>
          {isEditing ? (
            <div>
              <p className="text-xs text-[var(--primary-500)] mb-2">Comma-separated list of projects</p>
              <input
                type="text"
                value={formData.projects}
                onChange={(e) => setFormData({ ...formData, projects: e.target.value })}
                placeholder="Built an LLM, Developed a web app…"
                className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--primary-500)] outline-none focus:border-[#F97316]/50 transition-colors"
              />
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((p, i) => (
                <div key={i} className="flex gap-3 text-sm text-[var(--primary-600)]">
                  <span className="text-[#14B8A6] shrink-0 mt-0.5">◆</span> {p}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Experience — read only from CV */}
      {experience.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel border border-[var(--border)] rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-[var(--foreground)] font-black flex items-center gap-2">
            <Briefcase size={16} className="text-purple-400" /> Experience
          </h2>
          <div className="space-y-2">
            {experience.map((ex, i) => (
              <div key={i} className="flex gap-3 text-sm text-[var(--primary-600)]">
                <span className="text-[#F97316] shrink-0 mt-0.5">●</span> {ex}
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--primary-500)]">Extracted from your CV · Re-upload to update</p>
        </motion.div>
      )}

      {/* Account info */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-panel border border-[var(--border)] rounded-2xl p-6 space-y-3"
      >
        <h2 className="text-[var(--foreground)] font-black flex items-center gap-2">
          <Mail size={16} className="text-[var(--primary-500)]" /> Account
        </h2>
                {[
          { label: 'Email', value: user?.email },
          { label: 'Role', value: user?.role, capitalize: true },
          { label: 'Hireability Score', value: profile?.hireability_score !== undefined ? `${profile.hireability_score}/100` : '—' },
          { label: 'Domain', value: profile?.domain_competency || '—' },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
            <span className="text-xs uppercase tracking-wider text-[var(--primary-500)] font-bold">{row.label}</span>
            <span className={`text-sm font-semibold text-[var(--foreground)] ${row.capitalize ? 'capitalize' : ''}`}>
              {row.value}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}