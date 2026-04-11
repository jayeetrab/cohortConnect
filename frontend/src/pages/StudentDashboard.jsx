import React, { useState, useEffect, useMemo } from 'react';
import { 
  UploadCloud, FileText, CheckCircle, Briefcase, Users, Plus, 
  BrainCircuit, Activity, Database, Radar, ChevronRight, Heart, 
  MessageSquare, AlertCircle, Shield, Zap, Sparkles, TrendingUp, Target, Search, ArrowRight,
  Info
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [jobsRes, alumniRes, profileRes] = await Promise.all([
        api.get('/api/jobs/matches'),
        api.get('/api/alumni/matches'),
        api.get('/api/users/me').catch(() => ({ data: { profile: null } }))
      ]);
      setJobs(jobsRes.data.data || []);
      setAlumni(alumniRes.data.data || []);
      if (profileRes.data?.profile) setProfile(profileRes.data.profile);
    } catch (err) {
      console.error("Dashboard engine error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const matchedJobs = profile?.skills?.length > 0 ? jobs.filter(j => (j.matchScore || 0) > 0).slice(0, 4) : [];
  const matchedAlumni = profile?.skills?.length > 0 ? alumni.filter(a => (a.matchScore || 0) > 0).slice(0, 5) : [];

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    setIsUploading(true);
    setMessage(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/api/upload-cv", formData);
      const data = res.data;
      if(data.status === "parsed") {
          setProfile(data.data);
          setMessage({ type: 'success', text: "Profile matching finalized. Your career dashboard is now active." });
          setTimeout(() => setMessage(null), 5000);
      } else {
          setMessage({ type: 'error', text: String(data.message || "Could not analyze document.") });
      }
    } catch (err) {
      let errorMsg = err.response?.data?.detail || err.message || "Placement pipeline error.";
      if (Array.isArray(errorMsg)) errorMsg = errorMsg[0]?.msg || JSON.stringify(errorMsg);
      setMessage({ type: 'error', text: String(errorMsg) });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-20">
      
      {/* 1. MENTOR HERO SECTION */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center space-y-6 pt-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-widest">
          <Activity size={12} /> Placement Assistant Online
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-[var(--foreground)] leading-tight">
          Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-sky-500">{user?.name || 'Jay'}</span>.
        </h1>
        <p className="text-xl text-[var(--primary-500)] max-w-2xl mx-auto font-medium leading-relaxed">
          Your personal career coach is ready. Upload your latest CV to synchronize your skills with active industry requirements.
        </p>
      </motion.section>

      {/* 2. PLACEMENT PERFORMANCE BAR */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--border)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl glass-panel"
      >
        <div className="bg-[var(--background)] p-8 flex flex-col gap-1 items-center md:items-start">
          <span className="text-[10px] font-bold text-[var(--primary-500)] uppercase tracking-widest flex items-center gap-2">
            <Zap size={12} className="text-emerald-500" /> Hireability Score
          </span>
          <div className="text-4xl font-black text-[var(--foreground)] mt-2">
            {profile?.hireability_score || "--"}<span className="text-sm font-medium text-[var(--primary-600)]">/100</span>
          </div>
        </div>
        <div className="bg-[var(--background)] p-8 flex flex-col gap-1 items-center md:items-start">
          <span className="text-[10px] font-bold text-[var(--primary-500)] uppercase tracking-widest flex items-center gap-2">
            <Target size={12} className="text-sky-500" /> Matched Roles
          </span>
          <div className="text-4xl font-black text-[var(--foreground)] mt-2">
             {matchedJobs.filter(j => (j.matchScore || 0) > 0).length || matchedJobs.length}
          </div>
        </div>
        <div className="bg-[var(--background)] p-8 flex flex-col gap-1 items-center md:items-start">
          <span className="text-[10px] font-bold text-[var(--primary-500)] uppercase tracking-widest flex items-center gap-2">
            <Users size={12} className="text-purple-500" /> Alumni Network
          </span>
          <div className="text-4xl font-black text-[var(--foreground)] mt-2">
            {alumni.length}
          </div>
        </div>
        <div className="bg-[var(--background)] p-8 flex flex-col gap-1 items-center md:items-start">
          <span className="text-[10px] font-bold text-[var(--primary-500)] uppercase tracking-widest flex items-center gap-2">
            <Shield size={12} className="text-emerald-500" /> Verification
          </span>
          <div className="text-4xl font-black text-emerald-500 mt-2 lowercase">
            Active
          </div>
        </div>
      </motion.div>

      {/* 3. CAREER HUB: PLACEMENT ASSISTANT */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-sky-500/30 rounded-[2.5rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <motion.div 
          className="relative bg-[var(--background)] border border-[var(--border)] rounded-[2rem] overflow-hidden"
          layout
        >
          <div className="px-8 py-12 md:px-16 flex flex-col items-center text-center space-y-8">
            <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-3xl flex items-center justify-center border border-[var(--border)] shadow-inner relative group-hover:scale-105 transition-transform duration-500">
              <BrainCircuit className={`text-[var(--primary-500)] ${isUploading ? 'animate-spin' : ''}`} size={36} />
              {isUploading && (
                <motion.div 
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                />
              )}
            </div>
            
            <div className="max-w-md space-y-3">
              <h2 className="text-2xl font-black text-[var(--foreground)]">Career Matching Portal</h2>
              <p className="text-[var(--primary-500)] text-sm leading-relaxed">
                Upload your CV to let the Cohort Connect assistant map your expertise to global placement opportunities.
              </p>
            </div>

            <label className="relative cursor-pointer group/btn">
              <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl opacity-0 group-hover/btn:opacity-100 transition duration-500"></div>
              <span className={`relative flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-sm transition-all border shadow-lg ${isUploading ? 'bg-black/5 text-[var(--primary-500)] border-[var(--border)] cursor-not-allowed' : 'bg-[var(--foreground)] text-[var(--background)] border-transparent hover:px-12 active:scale-95'}`}>
                {isUploading ? (
                  <>Analyzing Career Path...</>
                ) : (
                  <>Update Placement Profile <ArrowRight size={16} /></>
                )}
              </span>
              <input type="file" accept=".pdf" onChange={handleUpload} className="hidden" disabled={isUploading}/>
            </label>

            <AnimatePresence>
              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl border text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}
                >
                  {message.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>} {message.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* DYNAMIC PROFILE REVEAL */}
          <AnimatePresence>
            {profile && profile.skills && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="border-t border-[var(--border)] bg-black/5 dark:bg-white/5 p-8 md:p-12 space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-[var(--primary-500)] uppercase tracking-[0.2em] flex items-center gap-2">
                       <TrendingUp size={12} className="text-emerald-500" /> Validated Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.slice(0, 15).map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-[var(--background)] border border-[var(--border)] rounded-lg text-xs font-semibold text-[var(--foreground)] shadow-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-[var(--primary-500)] uppercase tracking-[0.2em] flex items-center gap-2">
                       <Sparkles size={12} className="text-sky-500" /> Career Alignment
                    </h4>
                    <p className="text-lg font-bold text-[var(--foreground)] leading-tight italic">
                      "{profile.domain_competency}"
                    </p>
                    <div className="pt-4 border-t border-[var(--border)] opacity-50 text-[10px] uppercase font-bold tracking-widest">
                       Match Engine Resolved
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 4. SMART JOBS AND ALUMNI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold flex items-center gap-2 text-[var(--foreground)]">
              <Briefcase size={20} className="text-sky-500" /> Matched Opportunities
            </h3>
            <button onClick={() => navigate('/jobs')} className="text-xs font-bold text-[var(--primary-500)] hover:text-[var(--foreground)] transition-colors">Explorer All</button>
          </div>
          <div className="space-y-4">
            {profile && profile.skills ? (
              matchedJobs.length > 0 ? (
                matchedJobs.map((job, idx) => (
                  <div key={idx} className="glass-panel border border-[var(--border)] rounded-2xl p-6 hover:translate-x-1 transition-transform cursor-pointer" onClick={() => navigate('/jobs')}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-[var(--foreground)]">{job.title}</h4>
                        <p className="text-xs text-[var(--primary-600)] mt-1">{job.company} • {job.location}</p>
                      </div>
                      <div className={`px-2 py-1 text-[10px] font-black rounded uppercase ${job.matchScore > 70 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-sky-500/10 text-sky-500'}`}>
                        {job.matchScore > 0 ? `${Math.round(job.matchScore)}% Match` : 'New Opening'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-panel border border-[var(--border)] rounded-2xl p-8 text-center bg-black/5 dark:bg-white/5">
                  <p className="text-sm font-bold text-[var(--primary-600)]">No exact matches found for your current skills.</p>
                  <p className="text-xs font-medium text-[var(--primary-500)] mt-2">Upload a broader CV or browse the global board.</p>
                </div>
              )
            ) : (
              jobs.slice(0, 4).map((job, idx) => (
                <div key={idx} className="glass-panel border border-[var(--border)] rounded-2xl p-6 hover:translate-x-1 transition-transform cursor-pointer" onClick={() => navigate('/jobs')}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-[var(--foreground)]">{job.title}</h4>
                      <p className="text-xs text-[var(--primary-600)] mt-1">{job.company} • {job.location}</p>
                    </div>
                    <div className="px-2 py-1 text-[10px] font-black rounded uppercase bg-black/5 dark:bg-white/5 text-[var(--primary-600)]">
                      Pending Profile
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold flex items-center gap-2 text-[var(--foreground)]">
              <Users size={20} className="text-purple-500" /> Highly Compatible Mentors
            </h3>
            <button onClick={() => navigate('/network')} className="text-xs font-bold text-[var(--primary-500)] hover:text-[var(--foreground)] transition-colors">Directory</button>
          </div>
          <div className="glass-panel border border-[var(--border)] rounded-2xl overflow-hidden divide-y divide-[var(--border)]">
            {profile && profile.skills ? (
              matchedAlumni.length > 0 ? (
                matchedAlumni.map((alum, idx) => (
                  <div key={idx} 
                       className="p-4 flex items-center gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                       onClick={() => navigate('/alumni')}>
                    <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border)] flex items-center justify-center font-bold text-xs">
                      {alum.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-sm text-[var(--foreground)] truncate">{alum.name}</h5>
                      <p className="text-[10px] font-medium text-[var(--primary-500)] truncate">{alum.role} • {alum.company}</p>
                    </div>
                    <div className={`px-2 py-1 text-[10px] font-black rounded uppercase ${alum.matchScore > 50 ? 'text-emerald-500' : 'text-sky-500'}`}>
                      {Math.round(alum.matchScore)}% Align
                    </div>
                    <ChevronRight size={14} className="text-[var(--primary-600)]" />
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-[var(--primary-600)] text-sm font-bold bg-black/5 dark:bg-white/5">
                  No mentors align exactly with your parsed skills yet.
                </div>
              )
            ) : (
               matchedAlumni.slice(0,5).map((alum, idx) => (
                  <div key={idx} 
                       className="p-4 flex items-center gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                       onClick={() => navigate('/alumni')}>
                    <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border)] flex items-center justify-center font-bold text-xs">
                      {alum.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-sm text-[var(--foreground)] truncate">{alum.name}</h5>
                      <p className="text-[10px] font-medium text-[var(--primary-500)] truncate">{alum.role} • {alum.company}</p>
                    </div>
                    <ChevronRight size={14} className="text-[var(--primary-600)]" />
                  </div>
               ))
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
