import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  UploadCloud, CheckCircle, Briefcase, Users, BrainCircuit,
  ChevronRight, AlertCircle, Zap, Target, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';


// ─── Score Ring ───────────────────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#14B8A6' : score >= 60 ? '#F97316' : '#ef4444';
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle
        cx="40" cy="40" r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="6"
      />
      <circle
        cx="40" cy="40" r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: '40px 40px',
          transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)',
        }}
      />
      <text
        x="40" y="45"
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontWeight="bold"
      >
        {score}
      </text>
    </svg>
  );
};


// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [tab, setTab] = useState('overview');
  const [analyzing, setAnalyzing] = useState(null);
  const [analysis, setAnalysis] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsRes, alumniRes, profileRes] = await Promise.all([
        api.get('/api/jobs/matches'),
        api.get('/api/alumni/matches'),
        api.get('/api/users/me'),
      ]);
      setJobs(jobsRes.data.data || []);
      setAlumni((alumniRes.data.data || []).slice(0, 6));
      if (profileRes.data.profile) setProfile(profileRes.data.profile);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const matchedJobs = useMemo(() => {
    if (!profile?.skills || profile.skills.length === 0) return jobs.slice(0, 4);
    const userSkills = profile.skills.map(s => s.toLowerCase());
    return [...jobs]
      .map(job => {
        const required = job.required_skills || [];
        const matchCount = required.filter(skill =>
          userSkills.some(
            us => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us)
          )
        ).length;
        const matchScore =
          required.length > 0
            ? Math.round((matchCount / required.length) * 100)
            : job.matchScore || 0;
        return { ...job, matchScore };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);
  }, [jobs, profile]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setMessage(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/api/upload-cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.status === 'parsed') {
        setProfile(res.data.data);
        setMessage({
          type: 'success',
          text: '✓ CV parsed — your profile is now live and being matched.',
        });
        setTimeout(() => setMessage(null), 6000);
        const [jobsRes, alumniRes] = await Promise.all([
          api.get('/api/jobs/matches'),
          api.get('/api/alumni/matches'),
        ]);
        setJobs(jobsRes.data.data || []);
        setAlumni((alumniRes.data.data || []).slice(0, 6));
      } else {
        setMessage({
          type: 'error',
          text: String(res.data.message || 'Could not analyse document.'),
        });
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail || err.message || 'Placement pipeline error.';
      setMessage({ type: 'error', text: String(errorMsg) });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleAnalyze = async (jobId) => {
    setAnalyzing(jobId);
    try {
      const res = await api.get(`/api/jobs/${jobId}/analyze`);
      setAnalysis(prev => ({ ...prev, [jobId]: res.data.analysis }));
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(null);
    }
  };

  const hasProfile = profile && profile.skills && profile.skills.length > 0;

  const tabs = [
    { id: 'overview', label: '👤 Profile' },
    { id: 'jobs',     label: '💼 Jobs'   },
    { id: 'alumni',   label: '🤝 Alumni' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-gray-700 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 px-4 md:px-8 max-w-6xl mx-auto">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6"
      >
        <div>
          <p className="text-xs uppercase tracking-widest text-orange-500 mb-1">
            Student Portal
          </p>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
        </div>

        <button
          onClick={() => fileRef.current.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all duration-200 disabled:opacity-50 whitespace-nowrap"
        >
          {isUploading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Parsing CV…
            </>
          ) : (
            <>
              <UploadCloud size={16} />
              Upload CV
            </>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleUpload}
        />
      </motion.div>

      {/* ── Upload Feedback ── */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {message.type === 'success'
              ? <CheckCircle size={16} />
              : <AlertCircle size={16} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats Strip ── */}
      {hasProfile && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Hireability',
              value: `${profile.hireability_score || 0}/100`,
              icon: <Target size={18} className="text-orange-500" />,
            },
            {
              label: 'Skills',
              value: profile.skills?.length || 0,
              icon: <Zap size={18} className="text-teal-400" />,
            },
            {
              label: 'Job Matches',
              value: matchedJobs.length,
              icon: <Briefcase size={18} className="text-purple-400" />,
            },
            {
              label: 'Alumni Nearby',
              value: alumni.length,
              icon: <Users size={18} className="text-sky-400" />,
            },
          ].map(stat => (
            <div
              key={stat.label}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-white/5">{stat.icon}</div>
              <div>
                <div className="text-xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              tab === t.id
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════
          OVERVIEW TAB
      ════════════════════════════════════════════════ */}
      {tab === 'overview' && (
        <AnimatePresence mode="wait">
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {!hasProfile ? (
              <div className="bg-gray-900 border border-dashed border-gray-700 rounded-2xl p-16 text-center">
                <UploadCloud size={48} className="mx-auto mb-4 text-gray-500" />
                <h3 className="text-white font-bold text-lg mb-2">No CV uploaded yet</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                  Upload your PDF and our AI will extract skills, projects, and
                  experience to build your searchable profile.
                </p>
                <button
                  onClick={() => fileRef.current.click()}
                  className="px-6 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                >
                  Upload CV
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* Score Ring */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center gap-3">
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    Hireability Score
                  </p>
                  <ScoreRing score={profile.hireability_score || 0} />
                  <p className="text-gray-400 text-xs text-center font-medium">
                    {profile.domain_competency || 'General'}
                  </p>
                  <div className="w-full h-px bg-gray-800" />
                  <p className="text-xs text-gray-400 text-center">
                    {profile.hireability_score >= 80
                      ? '🟢 Strong profile'
                      : profile.hireability_score >= 60
                      ? '🟡 Good — room to grow'
                      : '🔴 Needs improvement'}
                  </p>
                </div>

                {/* Skills */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    Extracted Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(profile.skills || []).length === 0 ? (
                      <span className="text-gray-400 text-sm">None extracted yet</span>
                    ) : (
                      (profile.skills || []).map(s => (
                        <span
                          key={s}
                          className="px-2.5 py-0.5 rounded-full text-xs border bg-orange-500/10 text-orange-400 border-orange-500/20 font-medium"
                        >
                          {s}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                                {/* AI Feedback */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
                  <p className="text-xs uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <BrainCircuit size={12} /> AI Feedback
                  </p>
                  <ul className="space-y-2">
                    {(profile.improvement_feedback || []).length === 0 ? (
                      <li>
                        Upload a CV to get AI feedback
                      </li>
                    ) : (
                      (profile.improvement_feedback || []).map((tip, i) => (
                        <li>
                          className="flex items-start gap-2 text-sm text-gray-300"
                        
                          <ArrowRight
                            size={14}
                            className="text-orange-500 mt-0.5 shrink-0"
                          />
                          {tip}
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Projects */}
                {(profile.projects || []).length > 0 && (
                  <div className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
                    <p className="text-xs uppercase tracking-widest text-gray-400">
                      Projects
                    </p>
                    <div className="space-y-2">
                      {profile.projects.map((p, i) => (
                        <div
                          key={i}
                          className="flex gap-3 text-sm text-gray-300"
                        >
                          <span className="text-teal-400 shrink-0 mt-0.5">◆</span>
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {(profile.experience || []).length > 0 && (
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
                    <p className="text-xs uppercase tracking-widest text-gray-400">
                      Experience
                    </p>
                    <div className="space-y-2">
                      {profile.experience.map((ex, i) => (
                        <div
                          key={i}
                          className="text-sm text-gray-300 flex gap-3"
                        >
                          <span className="text-orange-500 shrink-0 mt-0.5">●</span>
                          {ex}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ════════════════════════════════════════════════
          JOBS TAB
      ════════════════════════════════════════════════ */}
      {tab === 'jobs' && (
        <AnimatePresence mode="wait">
          <motion.div
            key="jobs"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {matchedJobs.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-gray-400">
                Upload your CV to see AI-ranked job matches.
              </div>
            ) : (
              matchedJobs.map(job => (
                <motion.div
                  key={job._id || job.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl p-6 transition-all duration-300 space-y-4 group"
                >
                  {/* Job Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-gray-700 flex items-center justify-center shrink-0">
                        <Briefcase size={20} className="text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold group-hover:text-orange-400 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {job.company} · {job.location}
                        </p>
                        {job.salary_range && (
                          <p className="text-gray-500 text-xs mt-0.5">
                            {job.salary_range}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {job.matchScore !== undefined && (
                        <div className="text-center">
                          <div
                            className={`text-2xl font-black ${
                              job.matchScore >= 80
                                ? 'text-emerald-400'
                                : job.matchScore >= 60
                                ? 'text-orange-400'
                                : 'text-gray-400'
                            }`}
                          >
                            {job.matchScore}%
                          </div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                            Match
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => handleAnalyze(job._id || job.id)}
                        disabled={analyzing === (job._id || job.id)}
                        className="px-4 py-2 text-xs font-bold rounded-xl border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 transition-all disabled:opacity-50"
                      >
                        {analyzing === (job._id || job.id) ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 border border-orange-500/30 border-t-orange-400 rounded-full animate-spin" />
                            Analysing…
                          </span>
                        ) : (
                          '🔍 Deep Analysis'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Required Skills */}
                  {(job.required_skills || []).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(job.required_skills || []).map(s => (
                        <span
                          key={s}
                          className="px-2.5 py-0.5 rounded-full text-xs border bg-white/5 text-gray-400 border-gray-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Deep Analysis Panel */}
                  <AnimatePresence>
                    {analysis[job._id || job.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-black/20 border border-gray-700 rounded-xl p-5 space-y-4 mt-2">
                          {/* Match Reason */}
                          {analysis[job._id || job.id].matchReason && (
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {analysis[job._id || job.id].matchReason}
                            </p>
                          )}

                          {/* Missing Skills */}
                          {(analysis[job._id || job.id].missingSkills || []).length > 0 && (
                            <div>
                              <p className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold">
                                Gaps to close
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {analysis[job._id || job.id].missingSkills.map(s => (
                                  <span
                                    key={s}
                                    className="px-2.5 py-0.5 rounded-full text-xs border bg-red-500/10 text-red-400 border-red-500/20"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recommended Courses */}
                          {(analysis[job._id || job.id].recommendedCourses || []).length > 0 && (
                            <div>
                              <p className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold">
                                Recommended courses
                              </p>
                              <ul className="space-y-1">
                                {analysis[job._id || job.id].recommendedCourses.map((c, i) => (
                                  <li>
                                    className="flex items-start gap-2 text-sm text-gray-300"
                                  
                                    <ChevronRight
                                      size={14}
                                      className="text-gray-500 shrink-0 mt-0.5"
                                    />
                                    {c}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* AI Career Tip */}
                          {analysis[job._id || job.id].hireabilityAdvice && (
                            <div className="bg-orange-500/5 border border-orange-500/15 rounded-lg px-4 py-3">
                              <p className="text-xs uppercase tracking-wider text-orange-400/70 mb-1 font-bold">
                                AI Career Tip
                              </p>
                              <p className="text-sm text-gray-300">
                                {analysis[job._id || job.id].hireabilityAdvice}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ════════════════════════════════════════════════
          ALUMNI TAB
      ════════════════════════════════════════════════ */}
      {tab === 'alumni' && (
        <AnimatePresence mode="wait">
          <motion.div
            key="alumni"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {alumni.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-gray-400">
                No alumni found in the network yet.
              </div>
            ) : (
              alumni.map((a, idx) => (
                <motion.div
                  key={a._id || a.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl p-6 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-teal-500/10 border border-gray-700 flex items-center justify-center text-lg font-black text-white">
                        {a.name?.[0] || a.full_name?.[0] || '?'}
                      </div>
                      <div>
                        <h3 className="text-white font-bold">
                          {a.name || a.full_name}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {a.role || a.current_role} · {a.company || a.current_company}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Class of {a.graduation_year}
                        </p>
                      </div>
                    </div>

                    {a.relevanceScore !== undefined && (
                      <div className="text-right shrink-0">
                        <div
                          className={`text-xl font-black ${
                            a.relevanceScore >= 60
                              ? 'text-teal-400'
                              : 'text-gray-400'
                          }`}
                        >
                          {a.relevanceScore}%
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                          Relevance
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expertise Tags */}
                  {(a.expertise || a.skills || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {(a.expertise || a.skills || []).map(e => (
                        <span
                          key={e}
                          className="px-2.5 py-0.5 rounded-full text-xs border bg-teal-500/10 text-teal-400 border-teal-500/20"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))
            )}

            {/* View Full Directory */}
            <button
              onClick={() => navigate('/alumni')}
              className="w-full py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              View full alumni directory <ChevronRight size={16} />
            </button>
          </motion.div>
        </AnimatePresence>
      )}

    </div>
  );
}