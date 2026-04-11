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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [connectedIds, setConnectedIds] = useState(new Set());
  const [selectedAlum, setSelectedAlum] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const res = await axios.get('/api/alumni');
        setAlumni(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlumni();
  }, []);

  const handleConnect = (e, id) => {
    if(e) e.stopPropagation();
    const newSet = new Set(connectedIds);
    newSet.add(id);
    setConnectedIds(newSet);
  };

  const filteredAlumni = alumni.filter(a => 
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
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-96">
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
            <div key={i} className="glass-panel h-80 rounded-[2rem] animate-pulse bg-black/5 dark:bg-white/5" />
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[var(--background)] border border-[var(--border)] rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setSelectedAlum(null)}
                className="absolute top-8 right-8 p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors z-10"
              >
                <X size={24} className="text-[var(--primary-500)]" />
              </button>

              <div className="p-8 md:p-12 space-y-10">
                <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-8">
                  <div className="w-24 h-24 rounded-3xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-4xl font-black text-emerald-500 shadow-inner border border-[var(--border)]">
                    {selectedAlum.name.charAt(0)}
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black tracking-tighter text-[var(--foreground)]">{selectedAlum.name}</h2>
                    <p className="text-xl font-bold text-emerald-500">{selectedAlum.role} @ {selectedAlum.company}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                       <span className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[var(--primary-500)]"><Calendar size={14} /> Alumni Class of {selectedAlum.graduation_year}</span>
                       <span className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[var(--primary-500)]"><MapPin size={14} /> Available Mentor</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--primary-600)]">Expertise & Mentorship</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAlum.expertise.map((exp, i) => (
                      <span key={i} className="px-5 py-2 bg-black/3 dark:bg-white/3 border border-[var(--border)] rounded-2xl text-sm font-bold text-[var(--foreground)] shadow-sm">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-black/5 dark:bg-white/5 rounded-[2rem] border border-[var(--border)]">
                   <p className="text-[var(--primary-500)] text-sm leading-relaxed font-medium">
                     "I am passionate about helping UoB graduates find high-impact roles through the Cohort Connect initiative. Feel free to start a consultation if you want career advice or job referrals."
                   </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button 
                    onClick={() => navigate('/messaging')}
                    className="flex-1 flex items-center justify-center gap-3 py-4 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-bold text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <MessageSquare size={18}/> Start Consultation
                  </button>
                  <button 
                    onClick={() => handleConnect(null, selectedAlum._id)} 
                    disabled={connectedIds.has(selectedAlum._id)}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-sm transition-all border ${connectedIds.has(selectedAlum._id) ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-transparent border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5'}`}
                  >
                    {connectedIds.has(selectedAlum._id) ? <><Check size={18}/> Request Pending</> : <><UserPlus size={18}/> Contact Alumni</>}
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
