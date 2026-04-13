import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Briefcase, X, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const ReferralModal = ({ data, onClose }) => {
  const [email, setEmail] = useState(data.drafted_email || '');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await api.post('/api/referrals/approve', {
        referral_id: data.referral_id,
        approved_email: email,
        action: 'approve',
      });
      setDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl glass-panel border border-[var(--border)] rounded-2xl p-6 shadow-2xl space-y-5"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[var(--foreground)] font-black text-xl">AI-Drafted Referral</h2>
            <p className="text-[var(--primary-500)] text-sm mt-0.5">
              To: <span className="text-[#14B8A6] font-semibold">{data.alumni?.name}</span>
              {' · '}{data.alumni?.role} at {data.alumni?.company}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-[var(--primary-500)] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="bg-[#14B8A6]/10 border border-[#14B8A6]/20 text-[#14B8A6] px-3 py-1 rounded-lg font-semibold">
            Student: {data.student?.name}
          </span>
          <span className="bg-[#F97316]/10 border border-[#F97316]/20 text-[#F97316] px-3 py-1 rounded-lg font-semibold">
            Role: {data.job?.title}
          </span>
          <span className="bg-white/5 border border-[var(--border)] text-[var(--primary-500)] px-3 py-1 rounded-lg">
            Alumni relevance: {data.alumni?.relevance_score}%
          </span>
        </div>

        {done ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-8 text-center">
            <CheckCircle size={36} className="mx-auto mb-3 text-emerald-400" />
            <p className="text-emerald-400 font-bold text-lg">Referral approved and saved.</p>
            <button
              onClick={onClose}
              className="mt-5 px-6 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm font-bold hover:bg-emerald-500/30 transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--primary-500)] mb-2 font-bold">
                Review and edit before approving
              </p>
              <textarea
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                rows={10}
                className="w-full bg-black/5 dark:bg-white/[0.03] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] font-mono resize-none outline-none focus:border-[#F97316]/50 transition-colors leading-relaxed"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-[var(--primary-500)] hover:text-[var(--foreground)] text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#ea6c0a] text-white text-sm font-bold transition-all shadow-lg shadow-[#F97316]/20 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                  : '✓ Approve & Save'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

const CandidateCard = ({ candidate, rank, onDraftReferral, drafting, blindMode }) => {
  const [expanded, setExpanded] = useState(false);
  const score = candidate.match || 0;
  const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-[#F97316]' : 'text-[var(--primary-500)]';
  const scoreBg = score >= 80 ? 'bg-emerald-500/10 border-emerald-500/20' : score >= 60 ? 'bg-[#F97316]/10 border-[#F97316]/20' : 'bg-white/5 border-[var(--border)]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.06 }}
      className="glass-panel border border-[var(--border)] hover:border-[var(--primary-500)]/30 rounded-2xl overflow-hidden transition-all duration-300 group"
    >
      <div className="p-6 flex gap-5 items-start">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)] flex items-center justify-center text-xl font-black text-[var(--foreground)]">
            {blindMode ? (
              <Shield size={24} className="text-[var(--primary-500)]" />
            ) : (
              candidate.name?.charAt(0) || '?'
            )}
          </div>
          <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[10px] font-black text-[var(--primary-500)]">
            {rank}
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[var(--background)] rounded-full" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
            <div>
              <h4 className="font-black text-lg text-[var(--foreground)] group-hover:text-[#F97316] transition-colors leading-tight">
                {blindMode ? `Candidate #${candidate.id?.slice(-4) || 'XXXX'}` : candidate.name}
              </h4>
              <p className="text-sm font-semibold text-[var(--primary-500)]">
                {candidate.topSkill || 'Specialist'} · University of Bristol
              </p>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-black shrink-0 ${scoreBg} ${scoreColor}`}>
              {score}% match
            </div>
          </div>

          {/* Strengths */}
          {candidate.strengths?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {candidate.strengths.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-[#14B8A6]/10 text-[#14B8A6] border border-[#14B8A6]/20 font-medium">
                  ✓ {s}
                </span>
              ))}
            </div>
          )}

          {/* Gaps */}
          {candidate.gaps?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {candidate.gaps.map((g) => (
                <span key={g} className="px-2 py-0.5 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                  ✗ {g}
                </span>
              ))}
            </div>
          )}

          {/* Reason toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-[var(--primary-500)] hover:text-[var(--foreground)] flex items-center gap-1 transition-colors font-medium"
          >
            {expanded ? '▲ Hide reasoning' : '▼ Show AI reasoning'}
          </button>

          <AnimatePresence>
            {expanded && candidate.reason && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 bg-black/5 dark:bg-white/[0.02] border-l-2 border-[#F97316]/40 pl-4 py-2 rounded-r-xl"
              >
                <p className="text-sm text-[var(--primary-600)] leading-relaxed">{candidate.reason}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action bar */}
      <div className="border-t border-[var(--border)] px-6 py-3 flex items-center justify-between bg-black/5 dark:bg-white/[0.01]">
        <span className="text-xs text-[var(--primary-500)]">
          Hireability: <span className="font-bold text-[var(--foreground)]">{candidate.hireability_score || '—'}/100</span>
        </span>
        <button
          onClick={onDraftReferral}
          disabled={drafting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F97316]/10 hover:bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/30 text-xs font-bold transition-all disabled:opacity-50"
        >
          {drafting
            ? <><span className="w-3 h-3 border border-[#F97316]/30 border-t-[#F97316] rounded-full animate-spin" /> Drafting…</>
            : '✉ Draft Alumni Referral'}
        </button>
      </div>
    </motion.div>
  );
};

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [referralData, setReferralData] = useState(null);
  const [draftingFor, setDraftingFor] = useState(null);
  const [selectedJob, setSelectedJob] = useState('');
  const [blindMode, setBlindMode] = useState(false);

  useEffect(() => {
    api.get('/api/jobs').then((r) => {
      const j = r.data.data || [];
      setJobs(j);
      if (j.length > 0) setSelectedJob(j[0]._id);
    }).catch(() => {});
  }, []);

  const suggestions = [
    'Python developer with machine learning and NLP experience',
    'Full stack engineer with React and Node.js',
    'Data analyst with SQL and financial modelling',
    'Backend engineer with AWS and distributed systems',
    'Quantitative analyst with Python and statistics',
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setErrorMsg('');
    setResults([]);
    setHasSearched(false);
    try {
      const fd = new FormData();
      fd.append('query', query);
      const res = await api.post('/api/semantic-search', fd);
      if (res.data.status === 'success') {
        setResults(res.data.matches || []);
        setHasSearched(true);
      } else {
        setErrorMsg(res.data.message || 'Search failed.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Search error. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleDraftReferral = async (candidate) => {
    if (!selectedJob) { setErrorMsg('No jobs in database to match against.'); return; }
    setDraftingFor(candidate.id);
    setErrorMsg('');
    try {
      const res = await api.post('/api/referrals/draft', {
        student_id: candidate.id,
        job_id: selectedJob,
      });
      if (res.data.status === 'success') {
        setReferralData(res.data);
      } else {
        setErrorMsg(res.data.detail || 'Referral draft failed.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Could not draft referral. Ensure alumni exist in the database.');
    }
         finally {
      setDraftingFor(null);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs uppercase tracking-widest text-[var(--primary-500)] mb-1">Employer Portal</p>
        <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Search the Bristol Cohort</h1>
        <p className="text-[var(--primary-500)] text-sm mt-1">
          Describe your ideal candidate in plain English — no keyword filters needed.
        </p>
      </motion.div>

      {/* Tool bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        {/* Job selector for referral */}
        {jobs.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-[var(--primary-500)] font-bold shrink-0">Context:</span>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[#F97316]/50 transition-colors"
            >
              <option value="">Select job…</option>
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>{j.title} · {j.company}</option>
              ))}
            </select>
          </div>
        )}

        {/* Blind mode toggle */}
        <button
          onClick={() => setBlindMode(!blindMode)}
          className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${
            blindMode 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' 
              : 'bg-black/5 border-[var(--border)] text-[var(--primary-500)]'
          }`}
        >
          <Shield size={16} className={blindMode ? 'text-emerald-400' : 'text-[var(--primary-500)]'} />
          <span className="text-xs uppercase tracking-widest">
            Blind Hiring: {blindMode ? 'ON' : 'OFF'}
          </span>
          <div className={`w-8 h-4 rounded-full relative transition-colors ${blindMode ? 'bg-emerald-500' : 'bg-gray-600'}`}>
            <motion.div 
              animate={{ x: blindMode ? 16 : 2 }}
              className="absolute top-1 w-2 h-2 bg-white rounded-full shadow-sm"
            />
          </div>
        </button>
      </div>

      {/* Search box */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-4 text-[var(--primary-500)]" />
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(e); } }}
            placeholder="e.g. I need a Python developer with machine learning experience who can work with large datasets and has exposure to financial modelling…"
            rows={3}
            className="w-full bg-black/5 dark:bg-white/[0.03] border border-[var(--border)] focus:border-[#F97316]/50 rounded-2xl pl-10 pr-5 py-4 text-[var(--foreground)] placeholder-[var(--primary-500)] text-sm resize-none outline-none transition-colors"
          />
        </div>

        {/* Suggestion chips */}
        {!hasSearched && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--primary-500)] hover:text-[var(--foreground)] hover:border-[var(--primary-500)]/40 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-[#F97316] hover:bg-[#ea6c0a] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#F97316]/20 transition-all disabled:opacity-50"
        >
          {searching
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Searching cohort…</>
            : <><Search size={15} /> Search Cohort</>}
        </button>
      </form>

      {/* Error */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm"
          >
            <AlertCircle size={16} /> {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {hasSearched && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[var(--foreground)] font-black text-lg">
                {results.length} candidate{results.length !== 1 ? 's' : ''} ranked
              </h2>
              <span className="text-[var(--primary-500)] text-xs">Sorted by semantic fit</span>
            </div>

            {results.length === 0 ? (
              <div className="glass-panel border border-[var(--border)] rounded-2xl p-12 text-center text-[var(--primary-500)]">
                No candidates found. Ensure students have uploaded their CVs via the student portal.
              </div>
            ) : (
              results.map((candidate, idx) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  rank={idx + 1}
                  blindMode={blindMode}
                  onDraftReferral={() => handleDraftReferral(candidate)}
                  drafting={draftingFor === candidate.id}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Referral modal */}
      <AnimatePresence>
        {referralData && (
          <ReferralModal
            data={referralData}
            onClose={() => setReferralData(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}