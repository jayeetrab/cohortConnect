import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { Search, MapPin, Briefcase, Filter, MessageSquare, UserPlus, Check } from 'lucide-react';

export default function AlumniDirectory() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [connectedIds, setConnectedIds] = useState(new Set());
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
    e.stopPropagation();
    const newSet = new Set(connectedIds);
    newSet.add(id);
    setConnectedIds(newSet);
  };

  const filteredAlumni = alumni.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    (a.company && a.company.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-3 text-[var(--foreground)] tracking-tight">Alumni Directory</h1>
          <p className="text-[var(--primary-500)] text-lg">Connect with graduates and explore their career trajectories.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary-500)]" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or company..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-2xl py-3 pl-12 pr-4 text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors placeholder:text-[var(--primary-500)]"
            />
          </div>
          <button className="px-4 py-3 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-[var(--foreground)] flex items-center gap-2">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="glass-panel h-64 rounded-3xl animate-pulse bg-black/5 dark:bg-white/5" />
          ))}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredAlumni.map((alum) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={alum._id}
                className="glass-panel rounded-3xl p-6 group hover:border-[var(--primary-500)] transition-colors flex flex-col"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--background)] flex items-center justify-center text-[var(--primary-600)] shadow-sm border border-[var(--border)] text-2xl font-bold">
                    {alum.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--foreground)] group-hover:text-[var(--primary-600)] transition-colors">{alum.name}</h3>
                    <p className="text-sm text-[var(--primary-500)] flex items-center gap-1 mt-1">
                      Class of {alum.graduation_year}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center gap-3 text-[var(--primary-600)]">
                    <Briefcase size={18} className="text-[var(--primary-500)]" />
                    <span className="font-medium">{alum.role} at {alum.company}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {(alum.expertise || []).slice(0, 3).map((exp, i) => (
                    <span key={i} className="text-xs px-3 py-1 bg-black/5 dark:bg-white/5 rounded-lg border border-[var(--border)] text-[var(--primary-600)]">
                      {exp}
                    </span>
                  ))}
                  {(alum.expertise?.length > 3) && (
                    <span className="text-xs px-3 py-1 bg-black/5 dark:bg-white/5 rounded-lg border border-[var(--border)] text-[var(--primary-600)]">
                      +{alum.expertise.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
                  <button onClick={() => navigate('/messaging')} className="flex-1 flex justify-center items-center gap-2 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-colors font-medium text-[var(--foreground)]">
                    <MessageSquare size={18}/> Message
                  </button>
                  <button 
                    onClick={(e) => handleConnect(e, alum._id)} 
                    disabled={connectedIds.has(alum._id)}
                    className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-xl transition-colors font-medium border ${connectedIds.has(alum._id) ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 border-transparent'}`}
                  >
                    {connectedIds.has(alum._id) ? <><Check size={18}/> Pending</> : <><UserPlus size={18}/> Connect</>}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
