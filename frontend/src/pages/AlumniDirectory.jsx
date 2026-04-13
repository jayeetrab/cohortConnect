import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Star } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AlumniDirectory() {
  const { user } = useAuth();
  const [alumni, setAlumni] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('directory');
  const [actioning, setActioning] = useState(null);
  const [editEmails, setEditEmails] = useState({});
  const [actionedIds, setActionedIds] = useState(new Set());

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const alumniRes = await api.get('/api/alumni');
      setAlumni(alumniRes.data.data || []);
      if (user?.role === 'alumni') {
        const refRes = await api.get('/api/referrals/my');
        const refs = refRes.data.data || [];
        setReferrals(refs);
        const emails = {};
        refs.forEach((r) => { emails[r._id] = r.drafted_email || ''; });
        setEditEmails(emails);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (referralId, action) => {
    setActioning(referralId);
    try {
      await api.post('/api/referrals/approve', {
        referral_id: referralId,
        approved_email: editEmails[referralId] || '',
        action,
      });
      setActionedIds((prev) => new Set([...prev, referralId]));
      setReferrals((prev) =>
        prev.map((r) => r._id === referralId ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r)
      );
    } catch (e) {
      console.error(e);
    } finally {
      setActioning(null);
    }
  };

  const filtered = alumni.filter((a) =>
    `${a.name} ${a.company} ${a.role} ${(a.expertise || []).join(' ')}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const StatusBadge = ({ status }) => {
    const styles = {
      pending: 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20',
      approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return (
      <span className={`text-xs px-2.5 py-0.5 rounded-full border capitalize font-semibold ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-[var(--border)] border-t-[#F97316] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs uppercase tracking-widest text-[var(--primary-500)] mb-1">Alumni Network</p>
        <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">
          {user?.role === 'alumni' ? `Welcome, ${user.name?.split(' ')[0]}` : 'Alumni Directory'}
        </h1>
        <p className="text-[var(--primary-500)] text-sm mt-1">
          {user?.role === 'alumni'
            ? 'Review referral requests drafted by the platform on your behalf.'
            : `${alumni.length} Bristol alumni in the network`}
        </p>
      </motion.div>

      {/* Tabs for alumni role */}
      {user?.role === 'alumni' && (
        <div className="flex gap-1 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl p-1 w-fit">
          {[
            { id: 'referrals', label: `📨 Referral Requests (${referrals.length})` },
            { id: 'directory', label: '👥 Directory' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id
                  ? 'bg-[#F97316] text-white shadow-lg shadow-[#F97316]/20'
                  : 'text-[var(--primary-500)] hover:text-[var(--foreground)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Referral requests tab */}
      {tab === 'referrals' && user?.role === 'alumni' && (
        <div className="space-y-5">
          {referrals.length === 0 ? (
            <div className="glass-panel border border-[var(--border)] rounded-2xl p-12 text-center text-[var(--primary-500)]">
              No referral requests yet. The platform will notify you when a student is matched to your profile.
            </div>
          ) : referrals.map((ref) => (
            <motion.div
              key={ref._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel border border-[var(--border)] rounded-2xl p-6 space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[var(--foreground)] font-black">{ref.student_name}</h3>
                    <StatusBadge status={ref.status} />
                  </div>
                  <p className="text-[var(--primary-500)] text-sm">
                    Applying for <span className="text-[#F97316] font-semibold">{ref.job_title}</span> at <span className="font-semibold text-[var(--foreground)]">{ref.company}</span>
                  </p>
                  <p className="text-[var(--primary-500)] text-xs mt-0.5">
                    Requested {new Date(ref.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {ref.status === 'pending' && !actionedIds.has(ref._id) ? (
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-wider text-[var(--primary-500)] font-bold">Review & edit the drafted email</p>
                  <textarea
                    value={editEmails[ref._id] || ''}
                    onChange={(e) => setEditEmails((prev) => ({ ...prev, [ref._id]: e.target.value }))}
                    rows={8}
                    className="w-full bg-black/5 dark:bg-white/[0.03] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] font-mono resize-none outline-none focus:border-[#F97316]/50 transition-colors leading-relaxed"
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => handleAction(ref._id, 'reject')}
                      disabled={actioning === ref._id}
                      className="px-5 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-semibold transition-all disabled:opacity-50"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAction(ref._id, 'approve')}
                      disabled={actioning === ref._id}
                      className="px-6 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#ea6c0a] text-white text-sm font-bold transition-all shadow-lg shadow-[#F97316]/20 disabled:opacity-50 flex items-center gap-2"
                    >
                      {actioning === ref._id
                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                        : '✓ Approve Referral'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`px-4 py-3 rounded-xl border text-sm font-semibold ${
                  ref.status === 'approved'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {ref.status === 'approved' ? '✓ You approved this referral.' : '✗ You declined this referral.'}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Directory tab */}
      {tab === 'directory' && (
        <div className="space-y-5">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary-500)]" />
            <input
              type="text"
              placeholder="Search by name, company, skill…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--primary-500)] outline-none focus:border-[#F97316]/50 transition-colors"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="glass-panel border border-[var(--border)] rounded-2xl p-12 text-center text-[var(--primary-500)]">
              No alumni match your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((a, idx) => (
                <motion.div
                  key={a._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="glass-panel border border-[var(--border)] hover:border-[var(--primary-500)]/30 rounded-2xl p-5 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F97316]/20 to-[#14B8A6]/10 border border-[var(--border)] flex items-center justify-center text-lg font-black text-[var(--foreground)] shrink-0">
                      {a.name?.[0] || '?'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[var(--foreground)] font-bold truncate">{a.name}</h3>
                      <p className="text-[var(--primary-500)] text-sm truncate">{a.role} · {a.company}</p>
                      <p className="text-[var(--primary-500)] text-xs">Class of {a.graduation_year}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(a.expertise || []).map((e) => (
                      <span key={e} className="px-2 py-0.5 rounded-full text-xs bg-[#14B8A6]/10 text-[#14B8A6] border border-[#14B8A6]/20 font-medium">
                        {e}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}