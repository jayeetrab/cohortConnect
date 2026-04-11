import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, Briefcase, Users, Plus, BrainCircuit, Activity, Database, Radar, ChevronRight, Heart, MessageSquare } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [feed, setFeed] = useState([]);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/api/jobs'),
      api.get('/api/alumni'),
      api.get('/api/users/me')
    ]).then(([jobsRes, alumniRes, profileRes]) => {
      setJobs((jobsRes.data.data || []).slice(0, 4));
      setAlumni((alumniRes.data.data || []).slice(0, 5));
      const feedJobs = (jobsRes.data.data || []).map(j => ({ type: 'job', ...j }));
      const feedAlum = (alumniRes.data.data || []).map(a => ({ type: 'alumni', ...a, likes: 0, liked: false }));
      setFeed([...feedJobs, ...feedAlum].sort(() => 0.5 - Math.random()));
      if (profileRes.data.profile) setProfile(profileRes.data.profile);
    }).catch(err => console.error("Dashboard engine error:", err));
  }, []);

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
          setMessage("Intelligence extracted successfully. Vector pool updated.");
          setTimeout(() => setMessage(null), 4000);
      } else {
          setMessage(String(data.message || "Failed to parse document."));
      }
    } catch (err) {
      let errorMsg = err.message || "Network error loading pipeline.";
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
         errorMsg = detail;
      } else if (Array.isArray(detail)) {
         errorMsg = detail.map(e => e.msg || JSON.stringify(e)).join(", ");
      } else if (typeof detail === 'object') {
         errorMsg = JSON.stringify(detail);
      }
      
      if(err.code === 'ECONNABORTED') errorMsg = "Security Timeout: The Live Extracting Agent is offline or busy.";
      
      setMessage(String(errorMsg));
    } finally {
      setIsUploading(false);
    }
  };

  const toggleLike = async (id) => {
    const itemToToggle = feed.find(item => item._id === id);
    if (!itemToToggle) return;
    const isLiked = !itemToToggle.liked;
    setFeed(feed.map(item => (item._id === id && item.type === 'alumni') ? { ...item, liked: isLiked, likes: isLiked ? item.likes + 1 : item.likes - 1 } : item));
    try {
      await api.post('/api/interactions/like', { item_id: id, item_type: 'alumni', action: isLiked ? 'like' : 'unlike' });
    } catch (err) {
      setFeed(feed.map(item => (item._id === id && item.type === 'alumni') ? { ...item, liked: !isLiked, likes: !isLiked ? item.likes + 1 : item.likes - 1 } : item));
    }
  };

  return (
    <div className="space-y-6 text-[var(--foreground)] w-full max-w-7xl mx-auto">
      
      {/* ADVANCED HERO SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} 
        className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-black/5 dark:bg-white/5 p-8 md:p-12 mb-8 shadow-sm flex flex-col justify-end min-h-[300px]"
      >
         {/* Subtle background grid & gradient aura */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[400px] h-[400px] bg-gradient-to-bl from-emerald-500/20 to-[var(--primary-500)]/10 blur-[100px] rounded-full pointer-events-none"></div>

         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 w-full">
            <div className="max-w-2xl">
               <motion.span 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                 className="inline-block px-3 py-1 mb-4 rounded-full border border-[var(--border)] bg-[var(--background)] text-xs font-semibold text-[var(--primary-600)] tracking-widest uppercase shadow-sm"
               >
                 System Online • v2.0
               </motion.span>
               <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--foreground)] to-[var(--primary-500)]">
                 Welcome back, <br/> {user?.name?.split(' ')[0] || 'User'}.
               </h1>
               <p className="text-lg text-[var(--primary-600)] font-medium max-w-lg leading-relaxed">
                 Your semantic vector environment is primed. Upload your geometry, track active pipelines, and expand your domain authority.
               </p>
            </div>
            
            <div className="flex flex-col gap-3 shrink-0">
               <button onClick={() => navigate('/settings')} className="bg-[var(--foreground)] text-[var(--background)] px-8 py-3 rounded-2xl text-sm font-bold shadow-lg hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Configure Identity
               </button>
            </div>
         </div>
      </motion.div>

      {/* TOP METRICS ROW NOW FLOATING BELOW HERO */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 -mt-14 relative z-20 px-4 md:px-8"
      >
         <div className="glass-panel border-t-4 border-t-emerald-500 border border-[var(--border)] p-6 rounded-2xl shadow-xl flex flex-col justify-between bg-[var(--background)]/80 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-4">
               <span className="text-xs font-bold text-[var(--primary-500)] uppercase tracking-wider">Vector Readiness</span>
               <Radar size={16} className="text-emerald-500" />
            </div>
            <div className="text-3xl font-black">{profile?.hireability_score || "--"}<span className="text-sm font-medium text-[var(--primary-600)]">/100</span></div>
            <div className="text-xs text-[var(--primary-600)] mt-2">Rank matches {profile?.domain_competency || "Candidate Profile"}</div>
         </div>
         <div className="glass-panel border border-[var(--border)] p-5 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
               <span className="text-xs font-bold text-[var(--primary-500)] uppercase tracking-wider">Active Semantics</span>
               <Database size={16} className="text-[#0a66c2]" />
            </div>
            <div className="text-3xl font-black">{jobs.length}</div>
            <div className="text-xs text-[var(--primary-600)] mt-2">Roles heavily aligned to your stack.</div>
         </div>
         <div className="glass-panel border border-[var(--border)] p-5 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
               <span className="text-xs font-bold text-[var(--primary-500)] uppercase tracking-wider">Network Density</span>
               <Users size={16} className="text-purple-500" />
            </div>
            <div className="text-3xl font-black">{alumni.length}</div>
            <div className="text-xs text-[var(--primary-600)] mt-2">Alumni within your operational domain.</div>
         </div>
         <div className="glass-panel border border-[var(--border)] p-5 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
               <span className="text-xs font-bold text-[var(--primary-500)] uppercase tracking-wider">System Status</span>
               <Activity size={16} className="text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-emerald-500">Live</div>
            <div className="text-xs text-[var(--primary-600)] mt-2">All API and model clusters operational.</div>
         </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* MAIN COLUMN (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* AI INTELLIGENCE CORE WIDGET */}
              <div className="glass-panel border border-[var(--border)] rounded-xl shadow-sm overflow-hidden relative">
                 <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-black/5 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-[var(--foreground)] text-[var(--background)] rounded-lg"><BrainCircuit size={20}/></div>
                       <h2 className="font-bold text-lg">Intelligence Extractor</h2>
                    </div>
                 </div>
                 <div className="p-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                       <div className="w-24 h-24 flex-shrink-0 bg-black/5 dark:bg-white/5 border-2 border-dashed border-[var(--primary-500)] rounded-2xl flex flex-col justify-center items-center text-[var(--primary-500)] relative overflow-hidden group">
                           {isUploading && <div className="absolute inset-0 bg-emerald-500/20 animate-pulse transition-all"></div>}
                           <FileText size={32} className="group-hover:scale-110 transition-transform duration-300"/>
                       </div>
                       <div className="flex-1">
                          <h3 className="font-bold mb-2">Upload Profile Document (PDF)</h3>
                          <p className="text-sm text-[var(--primary-500)] mb-4">The NLP engine automatically parses and embeds your experience into MongoDB Atlas to power the Semantic Recruitment logic.</p>
                          <label className="inline-flex cursor-pointer">
                              <span className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-colors border ${isUploading ? 'bg-black/5 text-[var(--primary-500)] border-[var(--border)] cursor-not-allowed' : 'bg-[var(--foreground)] text-[var(--background)] border-transparent hover:opacity-90'}`}>
                                 {isUploading ? 'Executing Analysis...' : 'Select File'}
                              </span>
                              <input type="file" accept=".pdf" onChange={handleUpload} className="hidden" disabled={isUploading}/>
                          </label>
                       </div>
                    </div>
                    {message && (
                        <div className={`mt-5 p-4 rounded-xl text-sm font-medium border flex items-center gap-3 ${message.includes('success') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                            <AlertCircle size={18} className="shrink-0"/> {message}
                        </div>
                    )}
                 </div>
              </div>

              {/* RECOMMENDED JOBS GRID */}
              <div className="glass-panel border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
                 <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-black/5 dark:bg-white/5">
                    <h2 className="font-bold text-lg flex items-center gap-2"><Briefcase size={18} className="text-[#0a66c2]"/> Target Architecture Hits</h2>
                    <button onClick={() => navigate('/jobs')} className="text-xs font-bold text-[var(--primary-500)] hover:text-[var(--foreground)] transition-colors flex items-center">View All <ChevronRight size={14}/></button>
                 </div>
                 <div className="divide-y divide-[var(--border)]">
                    {jobs.map((job, idx) => (
                       <div key={idx} className="p-5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                           <div>
                              <h3 onClick={() => navigate('/jobs')} className="font-bold text-[var(--foreground)] hover:text-[#0a66c2] cursor-pointer transition-colors mb-1">{job.title}</h3>
                              <p className="text-xs font-semibold text-[var(--primary-600)]">{job.company} • {job.location}</p>
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="bg-emerald-500/10 text-emerald-500 font-bold text-[10px] uppercase px-2 py-1 rounded">High Match</div>
                              <button onClick={() => navigate('/jobs')} className="border border-[var(--border)] px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-black/10 dark:hover:bg-white/10 transition-colors">Analyze</button>
                           </div>
                       </div>
                    ))}
                    {jobs.length === 0 && <div className="p-8 text-center text-sm text-[var(--primary-500)] font-medium">No roles currently resolving.</div>}
                 </div>
              </div>

          </div>

          {/* RIGHT COLUMN (1/3 width) ALUMNI NETWORK */}
          <div className="lg:col-span-1 space-y-6">
              
              <div className="glass-panel border border-[var(--border)] rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100%-1rem)]">
                 <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-black/5 dark:bg-white/5">
                    <h2 className="font-bold text-lg flex items-center gap-2"><Users size={18} className="text-purple-500"/> Domain Experts</h2>
                    <button onClick={() => navigate('/network')} className="text-[var(--primary-500)] hover:text-[var(--foreground)] transition-colors"><ChevronRight size={16}/></button>
                 </div>
                 <div className="p-5 space-y-5 flex-1 overflow-auto">
                    {alumni.map((alum, idx) => (
                       <div key={idx} className="flex gap-4 items-center group">
                          <img onClick={() => navigate('/alumni')} src={`https://ui-avatars.com/api/?name=${alum.name.replace(' ', '+')}&background=random`} className="w-12 h-12 rounded-xl border border-[var(--border)] cursor-pointer group-hover:scale-105 transition-transform"/>
                          <div className="flex-1 min-w-0">
                             <h4 onClick={() => navigate('/alumni')} className="font-bold text-sm text-[var(--foreground)] truncate cursor-pointer group-hover:text-purple-500 transition-colors">{alum.name}</h4>
                             <p className="text-[11px] font-semibold text-[var(--primary-500)] truncate mt-0.5">{alum.role}</p>
                             <p className="text-[10px] text-[var(--primary-600)] truncate">{alum.company}</p>
                          </div>
                       </div>
                    ))}
                    {alumni.length === 0 && <div className="text-center text-sm text-[var(--primary-500)] font-medium">No experts resolving in your domain.</div>}
                 </div>
                 <div className="p-4 border-t border-[var(--border)]">
                    <button onClick={() => navigate('/network')} className="w-full py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-lg text-sm font-bold text-[var(--foreground)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                       Launch Directory Mapping
                    </button>
                 </div>
              </div>

          </div>

      </div>

    </div>
  );
}
