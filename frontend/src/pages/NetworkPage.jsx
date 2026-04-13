import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Briefcase } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function NetworkPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('alumni');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const alumniRes = await api.get('/api/alumni');
        setAlumni(alumniRes.data.data || []);
        if (user?.role === 'employer' || user?.role === 'admin') {
          const studentsRes = await api.get('/api/students');
          setStudents(studentsRes.data.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const filteredAlumni = alumni.filter((a) =>
    `${a.name} ${a.company} ${a.role} ${(a.expertise || []).join(' ')}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const filteredStudents = students.filter((s) =>
    `${s.name} ${s.email} ${s.domain_competency} ${(s.skills || []).join(' ')}`
      .toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-[var(--border)] border-t-[#F97316] rounded-full animate-spin" />
    </div>
  );

  const tabs = [
    { id: 'alumni', label: `🤝 Alumni (${alumni.length})` },
    ...(user?.role === 'employer' || user?.role === 'admin'
      ? [{ id: 'students', label: `🎓 Students (${students.length})` }]
      : []),
  ];

  return (
    <div className="space-y-8 pb-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs uppercase tracking-widest text-[var(--primary-500)] mb-1">Network</p>
        <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Bristol Talent Network</h1>
        <p className="text-[var(--primary-500)] text-sm mt-1">
          {alumni.length} alumni · {students.length} students in the cohort
        </p>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary-500)]" />
        <input
          type="text"
          placeholder="Search by name, skill, company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--primary-500)] outline-none focus:border-[#F97316]/50 transition-colors"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl p-1 w-fit">
        {tabs.map((t) => (
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

      {/* Alumni grid */}
      {tab === 'alumni' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlumni.length === 0 ? (
            <div className="col-span-2 glass-panel border border-[var(--border)] rounded-2xl p-12 text-center text-[var(--primary-500)]">
              No alumni match your search.
            </div>
          ) : filteredAlumni.map((a, idx) => (
            <motion.div
              key={a._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="glass-panel border border-[var(--border)] hover:border-[var(--primary-500)]/30 rounded-2xl p-5 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-3">
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

      {/* Students grid (employer/admin only) */}
      {tab === 'students' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStudents.length === 0 ? (
            <div className="col-span-2 glass-panel border border-[var(--border)] rounded-2xl p-12 text-center text-[var(--primary-500)]">
              No students match your search.
            </div>
          ) : filteredStudents.map((s, idx) => (
            <motion.div
              key={s._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="glass-panel border border-[var(--border)] hover:border-[var(--primary-500)]/30 rounded-2xl p-5 transition-all duration-300"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border)] flex items-center justify-center font-black text-[var(--foreground)]">
                    {s.name?.[0] || '?'}
                  </div>
                  <div>
                    <h3 className="text-[var(--foreground)] font-bold text-sm">{s.name}</h3>
                    <p className="text-[var(--primary-500)] text-xs">{s.domain_competency || 'Unverified'}</p>
                  </div>
                </div>
                <div className={`text-lg font-black shrink-0 ${
                  (s.hireability_score || 0) >= 80 ? 'text-emerald-400' :
                  (s.hireability_score || 0) >= 60 ? 'text-[#F97316]' : 'text-[var(--primary-500)]'
                }`}>
                  {s.hireability_score || 0}
                  <span className="text-xs text-[var(--primary-500)] font-normal">/100</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(s.skills || []).slice(0, 5).map((sk) => (
                                    <span key={sk} className="px-2 py-0.5 rounded-full text-xs bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 font-medium">
                    {sk}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}