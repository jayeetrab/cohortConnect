import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { 
  Search, MapPin, Briefcase, Filter, MessageSquare, 
  UserPlus, Check, X, Shield, Star, Award, ExternalLink,
  ChevronRight, Calendar
} from 'lucide-react';

export default function AlumniDirectory() {
  const [alumni, setAlumni] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [connectedIds, setConnectedIds] = useState(new Set());
  const [selectedAlum, setSelectedAlum] = useState(null);
  const [showMatches, setShowMatches] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/alumni/matches')
       .then(res => setAlumni(res.data.data || []))
       .catch(err => console.error(err))
       .finally(() => setLoading(false));
  }, []);

  const handleConnect = (e, id) => {
    if(e) e.stopPropagation();
    const newSet = new Set(connectedIds);
    newSet.add(id);
    setConnectedIds(newSet);
  };

  const displayedAlumni = showMatches 
    ? alumni.filter(a => (a.matchScore || 0) > 0)
    : alumni;

  const filteredAlumni = displayedAlumni.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    (a.company && a.company.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-12 pb-20 max-w-6xl mx-auto">
      
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-6"
      >
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-[var(--foreground)] tracking-tighter">Alumni Network</h1>
          <p className="text-[var(--primary-500)] text-lg font-medium">Connect with verified graduates and mentors across the Cohort Connect ecosystem.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {profile && profile.skills && profile.skills.length > 0 && (
            <button 
               onClick={() => setShowMatches(!showMatches)} 
               className={`px-6 py-3.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap shadow-sm border ${showMatches ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 border-transparent'}`}
            >
               {showMatches ? "Viewing Exact Matches" : "View Smart Matches"}
            </button>
          )}
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary-500)]" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or company..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-2xl py-3.5 pl-12 pr-4 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary-500)] transition-all shadow-sm"
            />
          </div>
        </div>
      </motion.div>

      {/* GRID SECTION */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="glass-panel h-80 rounded-[2rem] bg-black/5 dark:bg-white/5" />
          ))}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredAlumni.map((alum) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                onClick={() => setSelectedAlum(alum)}
                key={alum._id}
                className="glass-panel rounded-[2rem] p-8 group hover:border-[var(--primary-500)] hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col cursor-pointer bg-[var(--background)]"
              >
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-[var(--primary-600)] shadow-inner border border-[var(--border)] text-2xl font-black">
                    {alum.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[var(--foreground)] group-hover:text-emerald-500 transition-colors tracking-tight">{alum.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary-500)] uppercase tracking-widest mt-1">
                      <Star size={12} className="text-emerald-500" /> Class of {alum.graduation_year}
                      {alum.matchScore > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[9px] font-black">{Math.round(alum.matchScore)}% Align</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-center gap-3 text-[var(--primary-600)]">
                    <Briefcase size={18} className="text-[var(--primary-500)] shrink-0" />
                    <span className="font-bold text-sm tracking-tight truncate">{alum.role}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[var(--primary-600)]">
                    <Shield size={18} className="text-[var(--primary-500)] shrink-0" />
                    <span className="font-bold text-sm tracking-tight truncate">{alum.company}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8 h-10 overflow-hidden">
                  {(alum.expertise || []).slice(0, 3).map((exp, i) => (
                    <span key={i} className="text-[10px] font-bold px-3 py-1 bg-black/5 dark:bg-white/5 rounded-lg border border-[var(--border)] text-[var(--primary-500)] uppercase tracking-wider">
                      {exp}
                    </span>
                  ))}
                </div>

                <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between group-hover:px-2 transition-all">
                  <span className="text-xs font-bold text-[var(--primary-600)] uppercase tracking-widest">Connect with Alumni</span>
                  <ChevronRight size={16} className="text-[var(--primary-500)] group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* DETAILED PROFILE MODAL */}
      <AnimatePresence>
        {selectedAlum && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAlum(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-2xl bg-[var(--background)]/80 backdrop-blur-3xl border border-[var(--border)] rounded-[3rem] shadow-[0_32px_128px_rgba(0,0,0,0.3)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-purple-500 opacity-50"></div>
              
              <button 
                onClick={() => setSelectedAlum(null)}
                className="absolute top-8 right-8 p-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors z-10"
              >
                <X size={20} className="text-[var(--primary-500)]" />
              </button>

              <div className="p-10 md:p-16 space-y-12">
                <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-10">
                  <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-emerald-500/10 to-sky-500/10 flex items-center justify-center text-5xl font-black text-emerald-500 shadow-inner border border-[var(--border)] relative">
                    {selectedAlum.name.charAt(0)}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white border-4 border-[var(--background)]">
                       <Check size={16} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-5xl font-black tracking-tighter text-[var(--foreground)]">{selectedAlum.name}</h2>
                    <p className="text-xl font-bold text-sky-500 tracking-tight">{selectedAlum.role} <span className="text-[var(--primary-600)] font-medium px-2">@</span> {selectedAlum.company}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-5 pt-3">
                       <span className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-[var(--primary-500)]"><Calendar size={14} className="text-purple-500" /> Class of {selectedAlum.graduation_year}</span>
                       <span className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-[var(--primary-500)]"><MapPin size={14} className="text-emerald-500" /> Verified Mentor</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary-600)] opacity-60">Domain Expertise</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedAlum.expertise.map((exp, i) => (
                      <span key={i} className="px-6 py-3 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[1.2rem] text-sm font-black text-[var(--foreground)] shadow-sm hover:border-emerald-500/30 transition-colors">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary-600)] opacity-60">Professional Biography</h4>
                  <div className="p-10 bg-black/5 dark:bg-white/5 rounded-[2.5rem] border border-[var(--border)] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-[var(--foreground)] text-lg leading-relaxed font-medium italic">
                      "I specialize in high-growth ecosystem development and technical leadership. My mission with Cohort Connect is to bridge the gap between academic excellence and industry dominance for Bristol graduates."
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-5 pt-6">
                  <button 
                    onClick={() => navigate('/messaging')}
                    className="flex-1 flex items-center justify-center gap-4 py-5 bg-[var(--foreground)] text-[var(--background)] rounded-[1.5rem] font-black text-sm shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <MessageSquare size={20}/> Open Consultation
                  </button>
                  <button 
                    onClick={() => handleConnect(null, selectedAlum._id)} 
                    disabled={connectedIds.has(selectedAlum._id)}
                    className={`flex-1 flex items-center justify-center gap-4 py-5 rounded-[1.5rem] font-black text-sm transition-all border ${connectedIds.has(selectedAlum._id) ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-transparent border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5'}`}
                  >
                    {connectedIds.has(selectedAlum._id) ? <><Check size={20}/> Connection Sent</> : <><UserPlus size={20}/> Contact Alumni</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
