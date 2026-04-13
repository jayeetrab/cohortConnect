import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Briefcase, TrendingUp, Activity, Database,
  ShieldAlert, CheckCircle, AlertCircle, Server
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ label, value, sub, icon, color = 'orange', delay = 0 }) => {
  const colors = {
    orange: 'text-[#F97316] bg-[#F97316]/10 border-[#F97316]/20',
    teal:   'text-[#14B8A6] bg-[#14B8A6]/10 border-[#14B8A6]/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    emerald:'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-panel border border-[var(--border)] rounded-2xl p-5 space-y-3"
    >
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <div className="text-3xl font-black text-[var(--foreground)]">{value}</div>
        <div className="text-sm font-semibold text-[var(--foreground)] mt-0.5">{label}</div>
        {sub && <div className="text-xs text-[var(--primary-500)] mt-0.5">{sub}</div>}
      </div>
    </motion.div>
  );
};

const ProgressBar = ({ label, value, target, color = '#F97316' }) => {
  const pct = Math.min(100, Math.round((value / target) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-sm">
        <span className="text-[var(--foreground)] font-semibold">{label}</span>
        <span className="text-[var(--primary-500)] font-bold">{value} / {target}</span>
      </div>
      <div className="h-2 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <div className="text-xs text-[var(--primary-500)] text-right">{pct}% of pilot target</div>
    </div>
  );
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTable, setActiveTable] = useState(null);
  const [outcomeForm, setOutcomeForm] = useState({ student_id: '', outcome: 'placed', employer: '', job_title: '' });
  const [outcomeMsg, setOutcomeMsg] = useState('');

  useEffect(() => { 
    fetchAll(); 
    const interval = setInterval(fetchAll, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [analyticsRes, studentsRes] = await Promise.all([
        api.get('/api/admin/analytics'),
        api.get('/api/students'),
      ]);
      setAnalytics(analyticsRes.data.data);
      setStudents(studentsRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOutcome = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(outcomeForm).forEach(([k, v]) => fd.append(k, v));
      await api.post('/api/admin/outcome', fd);
      setOutcomeMsg('✓ Outcome recorded successfully.');
      setTimeout(() => setOutcomeMsg(''), 4000);
      fetchAll();
    } catch (err) {
      setOutcomeMsg('Error: ' + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-[var(--border)] border-t-[#F97316] rounded-full animate-spin" />
    </div>
  );

  const ov = analytics?.overview || {};
  const act = analytics?.activity || {};
  const out = analytics?.outcomes || {};
  const pilot = analytics?.pilot_targets || {};
  const topSkills = analytics?.top_skills_in_demand || [];
  const recent = analytics?.recent_activity || [];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <ShieldAlert size={20} className="text-[#F97316]" />
          <p className="text-xs uppercase tracking-widest text-[var(--primary-500)]">Admin Control Centre</p>
          <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Engine</span>
          </div>
        </div>
        <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">University Dashboard</h1>
        <p className="text-[var(--primary-500)] text-sm mt-1">Bristol pilot cohort · Live analytics and outcome tracking</p>
      </motion.div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Students" value={ov.total_students || 0} sub={`${ov.cv_completion_pct || 0}% have CVs`} icon={<Users size={18} />} color="orange" delay={0} />
        <StatCard label="Employers" value={ov.total_employers || 0} sub="Registered recruiters" icon={<Briefcase size={18} />} color="teal" delay={0.05} />
        <StatCard label="Alumni" value={ov.total_alumni || 0} sub="In the network" icon={<Users size={18} />} color="purple" delay={0.1} />
        <StatCard label="Placements" value={out.placed || 0} sub={`${out.placement_rate_pct || 0}% placement rate`} icon={<CheckCircle size={18} />} color="emerald" delay={0.15} />
      </div>

      {/* Activity stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Searches this week', value: act.searches_this_week || 0, color: 'text-[#F97316]' },
          { label: 'CV uploads this month', value: act.cv_uploads_this_month || 0, color: 'text-[#14B8A6]' },
          { label: 'Referrals drafted', value: act.referrals_drafted || 0, color: 'text-purple-400' },
          { label: 'Referrals approved', value: act.referrals_approved || 0, color: 'text-emerald-400' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel border border-[var(--border)] rounded-2xl p-4 text-center"
          >
            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-[var(--primary-500)] mt-1 font-medium">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Pilot targets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel border border-[var(--border)] rounded-2xl p-6 space-y-5"
      >
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={18} className="text-[#F97316]" />
          <h2 className="text-[var(--foreground)] font-black">Pilot Target Progress</h2>
          <span className="text-xs text-[var(--primary-500)] ml-auto">MSc Pilot Cohort · Bristol</span>
        </div>
        <ProgressBar label="Student enrolment" value={ov.total_students || 0} target={45} color="#F97316" />
        <ProgressBar label="Employer engagement" value={ov.total_employers || 0} target={5} color="#14B8A6" />
        <ProgressBar label="Referral conversion" value={out.referral_conversion_pct || 0} target={50} color="#a855f7" />
        <ProgressBar label="Placement outcome" value={out.placement_rate_pct || 0} target={80} color="#22c55e" />
      </motion.div>

      {/* Outcomes dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top skills in demand */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel border border-[var(--border)] rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-[var(--foreground)] font-black flex items-center gap-2">
            <Activity size={16} className="text-[#F97316]" /> Top Skills in Demand
          </h2>
          {topSkills.length === 0 ? (
            <p className="text-[var(--primary-500)] text-sm">No employer searches yet. Data will appear here after employers search the cohort.</p>
          ) : (
            <div className="space-y-3">
              {topSkills.map((s, i) => (
                <div key={s.skill} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[var(--primary-500)] w-4">{i + 1}</span>
                  <div className="flex-1 h-2 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (s.count / (topSkills[0]?.count || 1)) * 100)}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-[#F97316] to-[#14B8A6]"
                    />
                  </div>
                  <span className="text-sm font-semibold text-[var(--foreground)] capitalize w-24 truncate">{s.skill}</span>
                  <span className="text-xs text-[var(--primary-500)] w-6 text-right">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel border border-[var(--border)] rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-[var(--foreground)] font-black flex items-center gap-2">
            <Server size={16} className="text-[#14B8A6]" /> Live Activity Feed
          </h2>
          {recent.length === 0 ? (
            <p className="text-[var(--primary-500)] text-sm italic">Waiting for events...</p>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {recent.map((ev, i) => {
                const icons = {
                  cv_upload: { icon: '📄', color: 'text-[#14B8A6]' },
                  employer_search: { icon: '🔍', color: 'text-[#F97316]' },
                  referral_drafted: { icon: '✉', color: 'text-purple-400' },
                  referral_approved: { icon: '✓', color: 'text-emerald-400' },
                  outcome_recorded: { icon: '🏆', color: 'text-yellow-400' },
                };
                const evStyle = icons[ev.event_type] || { icon: '●', color: 'text-[var(--primary-500)]' };
                return (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-[var(--border)] last:border-0">
                    <span className={`text-sm shrink-0 ${evStyle.color}`}>{evStyle.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--foreground)] font-semibold capitalize">
                        {ev.event_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-[var(--primary-500)] truncate">
                        {ev.data?.student_email || ev.data?.employer || ev.data?.query || '—'}
                      </p>
                    </div>
                    <span className="text-xs text-[var(--primary-500)] shrink-0">
                      {ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Record outcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel border border-[var(--border)] rounded-2xl p-6 space-y-5"
      >
        <h2 className="text-[var(--foreground)] font-black flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" /> Record Placement Outcome
        </h2>
        <form onSubmit={handleOutcome} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-[var(--primary-500)] font-bold">Student</label>
            <select
              value={outcomeForm.student_id}
              onChange={(e) => setOutcomeForm({ ...outcomeForm, student_id: e.target.value })}
              required
              className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[#F97316]/50 transition-colors"
            >
              <option value="">Select student…</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>{s.name} · {s.email}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-[var(--primary-500)] font-bold">Outcome</label>
            <select
              value={outcomeForm.outcome}
              onChange={(e) => setOutcomeForm({ ...outcomeForm, outcome: e.target.value })}
              className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[#F97316]/50 transition-colors"
            >
              <option value="interview">Interview</option>
              <option value="offer">Offer Received</option>
              <option value="placed">Placed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-[var(--primary-500)] font-bold">Employer</label>
            <input
              type="text"
              placeholder="e.g. Goldman Sachs"
              value={outcomeForm.employer}
              onChange={(e) => setOutcomeForm({ ...outcomeForm, employer: e.target.value })}
              className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--primary-500)] outline-none focus:border-[#F97316]/50 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-[var(--primary-500)] font-bold">Job Title</label>
            <input
              type="text"
              placeholder="e.g. ML Engineer"
              value={outcomeForm.job_title}
              onChange={(e) => setOutcomeForm({ ...outcomeForm, job_title: e.target.value })}
              className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--primary-500)] outline-none focus:border-[#F97316]/50 transition-colors"
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-4">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#F97316] hover:bg-[#ea6c0a] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#F97316]/20 transition-all"
            >
              Record Outcome
            </button>
            {outcomeMsg && (
              <span className={`text-sm font-semibold ${outcomeMsg.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
                {outcomeMsg}
              </span>
            )}
          </div>
        </form>
      </motion.div>

      {/* Student table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel border border-[var(--border)] rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-[var(--foreground)] font-black flex items-center gap-2">
            <Database size={16} className="text-[var(--primary-500)]" /> Student Registry
          </h2>
          <span className="text-xs text-[var(--primary-500)]">{students.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-black/5 dark:bg-white/[0.02]">
                {['Name', 'Email', 'Domain', 'Score', 'Outcome'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs uppercase tracking-wider text-[var(--primary-500)] font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {students.map((s) => (
                <tr key={s._id} className="hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 font-semibold text-[var(--foreground)]">{s.name}</td>
                  <td className="px-5 py-3 text-[var(--primary-500)]">{s.email}</td>
                  <td className="px-5 py-3 text-[var(--primary-500)]">{s.domain_competency || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`font-bold ${(s.hireability_score || 0) >= 80 ? 'text-emerald-400' : (s.hireability_score || 0) >= 60 ? 'text-[#F97316]' : 'text-[var(--primary-500)]'}`}>
                      {s.hireability_score || 0}/100
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {s.outcome ? (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs border font-semibold capitalize ${
                        s.outcome === 'placed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        s.outcome === 'interview' ? 'bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/20' :
                        s.outcome === 'offer' ? 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {s.outcome}
                      </span>
                    ) : (
                      <span className="text-[var(--primary-500)] text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}