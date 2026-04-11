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

      {/* 2. PLACEMENT PERFORMANCE BAR (REFINED) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-4"
      >
        <div className="glass-panel p-8 rounded-[2rem] border border-[var(--border)] flex flex-col gap-1 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
          <span className="text-[10px] font-black text-[var(--primary-500)] uppercase tracking-widest flex items-center gap-2">
            <Zap size={14} className="text-emerald-500" /> Hireability
          </span>
          <div className="text-4xl font-black text-[var(--foreground)] mt-3 tracking-tighter">
            {profile?.hireability_score || "--"}<span className="text-sm font-bold text-[var(--primary-600)] ml-1">/100</span>
          </div>
        </div>
        <div className="glass-panel p-8 rounded-[2rem] border border-[var(--border)] flex flex-col gap-1 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
          <span className="text-[10px] font-black text-[var(--primary-500)] uppercase tracking-widest flex items-center gap-2">
            <Target size={14} className="text-sky-500" /> Precision
          </span>
          <div className="text-4xl font-black text-[var(--foreground)] mt-3 tracking-tighter">
             {matchedJobs.filter(j => (j.matchScore || 0) > 0).length || matchedJobs.length}
             <span className="text-sm font-bold text-[var(--primary-600)] ml-1">Roles</span>
          </div>
        </div>
        <div className="glass-panel p-8 rounded-[2rem] border border-[var(--border)] flex flex-col gap-1 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
          <span className="text-[10px] font-black text-[var(--primary-500)] uppercase tracking-widest flex items-center gap-2">
            <Users size={14} className="text-purple-500" /> Alumni
          </span>
          <div className="text-4xl font-black text-[var(--foreground)] mt-3 tracking-tighter">
            {alumni.length}
            <span className="text-sm font-bold text-[var(--primary-600)] ml-1">Connects</span>
          </div>
        </div>
        <div className="glass-panel p-8 rounded-[2rem] border border-[var(--border)] flex flex-col gap-1 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
          <span className="text-[10px] font-black text-[var(--primary-500)] uppercase tracking-widest flex items-center gap-2">
            <Shield size={14} className="text-emerald-500" /> Trust
          </span>
          <div className="text-4xl font-black text-emerald-500 mt-3 tracking-tighter">
            Active
          </div>
        </div>
      </motion.div>

      <div className="relative pt-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent opacity-50"></div>
        <motion.div 
          className="relative glass-panel border border-[var(--border)] rounded-[3rem] overflow-hidden bg-[var(--background)]/30 backdrop-blur-3xl group shadow-sm hover:shadow-2xl transition-all duration-700"
          layout
        >
          <div className="px-10 py-16 md:px-20 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
            <div className="w-32 h-32 bg-[var(--background)] rounded-[2.5rem] flex items-center justify-center border border-[var(--border)] shadow-inner relative group-hover:scale-105 group-hover:rotate-3 transition-all duration-700">
              <div className="absolute inset-2 bg-emerald-500/5 rounded-[2rem] blur-xl"></div>
              <BrainCircuit className={`text-emerald-500 relative z-10 ${isUploading ? 'animate-pulse' : ''}`} size={48} />
              {isUploading && (
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="absolute inset-0 border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent rounded-[2.5rem]"
                />
              )}
            </div>
            
            <div className="flex-1 space-y-4">
               <h3 className="text-3xl font-black text-[var(--foreground)] tracking-tighter leading-none">Intelligence Hub</h3>
               <p className="text-lg text-[var(--primary-500)] font-medium leading-relaxed max-w-xl">
                 Our proprietary semantic engine maps your CV against verified alumni profiles and active global job openings.
               </p>
               <AnimatePresence>
                 {message && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0 }}
                     className={`flex items-center gap-3 px-6 py-3 rounded-xl border text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}
                   >
                     {message.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>} {message.text}
                   </motion.div>
                 )}
               </AnimatePresence>
               <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                  <label className="group relative bg-[var(--foreground)] text-[var(--background)] px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl">
                    {isUploading ? "Reading CV..." : "Sync Credentials"}
                    <input type="file" onChange={handleUpload} className="hidden" accept=".pdf" disabled={isUploading}/>
                  </label>
                  <button onClick={() => navigate('/jobs')} className="px-10 py-4 glass-panel border border-[var(--border)] rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all">
                    Explorer All
                  </button>
               </div>
            </div>
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
                    <div className="flex flex-wrap gap-2 text-[var(--foreground)]">
                      {(profile.skills || []).slice(0, 15).map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-[var(--background)] border border-[var(--border)] rounded-lg text-xs font-semibold shadow-sm">
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
                      "{profile.domain_competency || "Ready for professional matching"}"
                    </p>
                    <div className="pt-4 border-t border-[var(--border)] opacity-50 text-[10px] uppercase font-bold tracking-widest text-[var(--primary-600)]">
                       Match Engine Resolved
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 4. SMART JOBS AND ALUMNI (REFINED) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xl font-black flex items-center gap-3 text-[var(--foreground)] tracking-tight">
              <Briefcase size={22} className="text-sky-500" /> Matches
            </h3>
            <button onClick={() => navigate('/jobs')} className="text-xs font-black text-[var(--primary-500)] hover:text-[var(--foreground)] uppercase tracking-widest transition-colors">Explorer All</button>
          </div>
          <div className="space-y-4">
            {(profile && profile.skills ? matchedJobs : jobs.slice(0, 4)).map((job, idx) => (
              <motion.div 
                whileHover={{ x: 8 }}
                key={job._id || idx} 
                className="glass-panel border border-[var(--border)] rounded-[2rem] p-8 cursor-pointer shadow-sm hover:shadow-xl hover:border-sky-500/30 transition-all duration-300"
                onClick={() => {
                  const jobId = String(job._id || job.id);
                  navigate(`/jobs/${jobId}`);
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-black text-lg text-[var(--foreground)] tracking-tight">{job.title}</h4>
                    <p className="text-xs font-bold text-[var(--primary-600)] uppercase tracking-wide">{job.company} • {job.location}</p>
                  </div>
                  <div className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest ${job.matchScore > 70 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-sky-500/10 text-sky-500'}`}>
                    {job.matchScore > 0 ? `${Math.round(job.matchScore)}% Match` : 'Promoted'}
                  </div>
                </div>
              </motion.div>
            ))}
            {profile && profile.skills && matchedJobs.length === 0 && (
              <div className="glass-panel border border-[var(--border)] rounded-[2rem] p-10 text-center bg-black/5 dark:bg-white/5 border-dashed">
                <p className="text-sm font-bold text-[var(--primary-600)]">No direct semantic matches found.</p>
                <p className="text-xs font-medium text-[var(--primary-500)] mt-2 italic">Try refining your CV for better results.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xl font-black flex items-center gap-3 text-[var(--foreground)] tracking-tight">
              <Users size={22} className="text-purple-500" /> Network
            </h3>
            <button onClick={() => navigate('/network')} className="text-xs font-black text-[var(--primary-500)] hover:text-[var(--foreground)] uppercase tracking-widest transition-colors">Directory</button>
          </div>
          <div className="glass-panel border border-[var(--border)] rounded-[2.5rem] overflow-hidden divide-y divide-[var(--border)] bg-[var(--background)]/30 backdrop-blur-3xl shadow-sm">
            {(profile && profile.skills ? matchedAlumni : alumni.slice(0, 5)).map((alum, idx) => (
              <motion.div 
                whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                key={idx} 
                className="p-6 flex items-center gap-5 cursor-pointer transition-colors"
                onClick={() => navigate('/alumni')}
              >
                <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)] flex items-center justify-center font-black text-sm text-[var(--primary-600)] shadow-inner">
                  {alum.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-black text-[var(--foreground)] tracking-tight">{alum.name}</h5>
                  <p className="text-[11px] font-bold text-[var(--primary-500)] truncate uppercase tracking-wide">{alum.role} • {alum.company}</p>
                </div>
                {alum.matchScore > 0 && (
                  <div className="px-2 py-1 text-[10px] font-black rounded bg-purple-500/10 text-purple-500 uppercase tracking-tighter">
                    {Math.round(alum.matchScore)}% Align
                  </div>
                )}
                <ChevronRight size={18} className="text-[var(--border)]" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
}
