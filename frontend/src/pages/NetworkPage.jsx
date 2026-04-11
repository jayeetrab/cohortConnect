import React, { useState, useEffect } from 'react';
import { Users, Filter, BookOpen, UserPlus, Check } from 'lucide-react';
import api from '../api/axios';

export default function NetworkPage() {
  const [alumni, setAlumni] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectedIds, setConnectedIds] = useState(new Set());
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    api.get('/api/alumni/matches')
       .then(res => setAlumni(res.data.data || []))
       .catch(err => console.error(err))
       .finally(() => setLoading(false));
  }, []);

  const handleConnect = (e, id) => {
    e.stopPropagation();
    const newSet = new Set(connectedIds);
    newSet.add(id);
    setConnectedIds(newSet);
  };

  const displayedAlumni = showAll ? alumni : alumni.filter(a => (a.matchScore || 0) > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 max-w-full text-[var(--foreground)]">
      <div className="space-y-4">
        <div className="glass-panel border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
           <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2 font-bold text-[var(--foreground)]"><Users size={18}/> Manage Network</div>
           <div className="px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex justify-between text-sm text-[var(--primary-600)] transition-colors">Connections <span>142</span></div>
           <div className="px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex justify-between text-sm text-[var(--primary-600)] transition-colors">Following <span>53</span></div>
           <div className="px-4 py-3 border-t border-[var(--border)] mt-2">
             <button onClick={() => setShowAll(!showAll)} className="bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity text-sm font-bold py-2 w-full rounded-lg shadow-sm">
               {showAll ? "View Matches Only" : "View All Mentors"}
             </button>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="glass-panel border border-[var(--border)] rounded-xl shadow-sm p-4 flex justify-between items-center">
            <h2 className="font-semibold flex items-center gap-2"><BookOpen size={18} className="text-[var(--primary-500)]"/> {showAll ? "University Mentors" : "Highly Compatible Mentors"}</h2>
            <button className="text-[var(--primary-500)] hover:text-[var(--foreground)] p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"><Filter size={18}/></button>
        </div>

        {loading ? (
             <div className="glass-panel p-8 text-center text-[var(--primary-500)] font-semibold rounded-xl border border-[var(--border)] shadow-sm">Connecting to Network...</div>
          ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
               {displayedAlumni.length > 0 ? (
                 displayedAlumni.map((alum, i) => (
                    <div key={alum._id || i} className="glass-panel border border-[var(--border)] rounded-xl shadow-sm overflow-hidden flex flex-col items-center p-4 relative text-center group hover:translate-y-[-2px] transition-transform">
                        <div className="absolute top-0 w-full h-16 bg-gradient-to-tr from-[var(--primary-500)] to-emerald-500 opacity-20"></div>
                        <div className="w-20 h-20 rounded-full border-4 border-[var(--background)] bg-[var(--background)] mb-3 mt-4 relative z-10 mx-auto shadow-sm flex items-center justify-center text-3xl font-bold text-[var(--primary-600)]">
                            {alum.name.charAt(0)}
                        </div>
                        <h3 className="font-bold text-[var(--foreground)] group-hover:text-[var(--primary-500)] transition-colors cursor-pointer leading-tight mb-1">
                          {alum.name}
                        </h3>
                        {alum.matchScore > 0 && <div className="text-[10px] font-black uppercase mb-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">{Math.round(alum.matchScore)}% Align</div>}
                        <p className="text-xs text-[var(--primary-600)] mb-4">{alum.role} at {alum.company}</p>
                        
                        <button 
                          onClick={(e) => handleConnect(e, alum._id || i)} 
                          disabled={connectedIds.has(alum._id || i)}
                          className={`w-full mt-auto py-2 rounded-xl transition-all font-medium flex justify-center items-center gap-2 text-sm shadow-sm ${connectedIds.has(alum._id || i) ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90'}`}
                        >
                           {connectedIds.has(alum._id || i) ? <><Check size={16}/> Pendng</> : <><UserPlus size={16}/> Connect</>}
                        </button>
                    </div>
                 ))
               ) : (
                  <div className="col-span-full p-8 text-center text-[var(--primary-500)] glass-panel shadow-sm rounded-xl border border-[var(--border)]">No matches found for your profile. Try viewing all mentors.</div>
               )}
            </div>
          )}
      </div>
    </div>
  );
}
