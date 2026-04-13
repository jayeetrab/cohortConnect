import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Search, Bell, BellOff } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [alerts, setAlerts] = useState(new Set());

  useEffect(() => {
    api.get('/api/jobs')
      .then((res) => setJobs(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleAlert = (id) => {
    setAlerts((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = jobs.filter((j) =>
    `${j.title} ${j.company} ${j.location} ${(j.required_skills || []).join(' ')}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-[var(--border)] border-t-[#F97316] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs uppercase tracking-widest text-[var(--primary-500)] mb-1">Job Board</p>
        <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Live Opportunities</h1>
        <p className="text-[var(--primary-500)] text-sm mt-1">{jobs.length} roles available · Updated daily</p>
            </motion.div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary-500)]" />
        <input
          type="text"
          placeholder="Search by title, company, skill, location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--primary-500)] outline-none focus:border-[#F97316]/50 transition-colors"
        />
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--primary-500)]">
          Showing <span className="font-bold text-[var(--foreground)]">{filtered.length}</span> roles
        </p>
      </div>

      {/* Job cards */}
      {filtered.length === 0 ? (
        <div className="glass-panel border border-[var(--border)] rounded-2xl p-12 text-center text-[var(--primary-500)]">
          No jobs match your search.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((job, idx) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="glass-panel border border-[var(--border)] hover:border-[var(--primary-500)]/30 rounded-2xl p-6 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border)] flex items-center justify-center shrink-0">
                    <Briefcase size={20} className="text-[var(--primary-500)]" />
                  </div>
                  <div>
                    <h3 className="text-[var(--foreground)] font-bold group-hover:text-[#F97316] transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-[var(--primary-500)] text-sm font-medium">{job.company}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-[var(--primary-500)] text-xs">
                      <MapPin size={11} /> {job.location}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleAlert(job._id)}
                  className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                    alerts.has(job._id)
                      ? 'bg-[#F97316]/10 border-[#F97316]/30 text-[#F97316]'
                      : 'border-[var(--border)] text-[var(--primary-500)] hover:text-[var(--foreground)] hover:border-[var(--primary-500)]/40'
                  }`}
                  title={alerts.has(job._id) ? 'Remove alert' : 'Set alert'}
                >
                  {alerts.has(job._id) ? <Bell size={15} /> : <BellOff size={15} />}
                </button>
              </div>

              <p className="text-[var(--primary-500)] text-sm mt-4 leading-relaxed">{job.description}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                {(job.required_skills || []).map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-0.5 rounded-full text-xs border bg-white/5 text-[var(--primary-500)] border-[var(--border)] font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {job.matchScore !== undefined && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${job.matchScore}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full bg-gradient-to-r from-[#F97316] to-[#14B8A6]"
                    />
                  </div>
                  <span className={`text-xs font-bold shrink-0 ${
                    job.matchScore >= 80 ? 'text-emerald-400' :
                    job.matchScore >= 60 ? 'text-[#F97316]' : 'text-[var(--primary-500)]'
                  }`}>
                    {job.matchScore}% match
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}