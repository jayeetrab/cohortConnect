import React, { useState, useEffect } from 'react';
import { Briefcase, Building, MapPin, Search, PlusCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState(new Set());
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/jobs/matches')
       .then(res => setJobs(res.data.data || []))
       .catch(err => console.error(err))
       .finally(() => setLoading(false));
  }, []);

  const toggleAlert = (id, e) => {
    e.stopPropagation();
    const newAlerts = new Set(alerts);
    if(newAlerts.has(id)) newAlerts.delete(id);
    else newAlerts.add(id);
    setAlerts(newAlerts);
  };

  const displayedJobs = showAll ? jobs : jobs.filter(j => (j.matchScore || 0) > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 max-w-full text-[var(--foreground)]">
      <div className="space-y-4">
        <div className="glass-panel border border-[var(--border)] shadow-sm p-5 rounded-xl">
           <h3 className="font-bold mb-2 flex items-center gap-2"><Briefcase size={16}/> Job Picks for You</h3>
           <p className="text-xs text-[var(--primary-500)] mb-4">Based on your semantic vector profile.</p>
           <button onClick={() => setShowAll(!showAll)} className="bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity text-sm font-bold py-2 w-full rounded-lg shadow-sm">
             {showAll ? "View Recommended Only" : "View All Listings"}
           </button>
        </div>
        <div className="glass-panel border border-[var(--border)] shadow-sm p-5 rounded-xl">
           <h3 className="font-bold mb-3 text-sm flex items-center gap-2"><Building size={16}/> Company Portals</h3>
           <div className="text-sm font-semibold text-[var(--primary-600)] cursor-pointer hover:text-[var(--foreground)] transition-colors mb-2">DeepMind</div>
           <div className="text-sm font-semibold text-[var(--primary-600)] cursor-pointer hover:text-[var(--foreground)] transition-colors">Stripe</div>
        </div>
      </div>

      <div className="glass-panel border border-[var(--border)] shadow-sm overflow-hidden min-h-[60vh] rounded-xl flex flex-col">
         <div className="bg-black/5 dark:bg-white/5 px-6 py-5 border-b border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4">
             <h2 className="text-xl font-bold">{showAll ? "Global Job Board" : "Recommended Jobs"}</h2>
             <div className="flex bg-[var(--background)] border border-[var(--border)] rounded-xl items-center px-4 py-2 focus-within:border-[var(--foreground)] transition-colors max-w-sm w-full shadow-inner">
                <Search size={18} className="text-[var(--primary-500)] mr-3"/>
                <input type="text" placeholder="Search title or company" className="bg-transparent border-none outline-none text-sm w-full text-[var(--foreground)] placeholder-[var(--primary-500)] font-medium"/>
             </div>
         </div>
         
         <div className="divide-y divide-[var(--border)] flex-1">
              {loading ? (
                 <div className="p-12 text-center text-[var(--primary-500)] font-semibold">Loading Live Job Board...</div>
              ) : displayedJobs.length > 0 ? (
                 displayedJobs.map((job, idx) => (
                    <div 
                       key={job._id || idx} 
                       onClick={() => {
                         const jobId = String(job._id || job.id);
                         console.log("Navigating to job details:", jobId);
                         navigate(`/jobs/${jobId}`);
                       }}
                       className="p-6 hover:bg-black/5 dark:hover:bg-white/5 transition-colors grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-5 items-start group cursor-pointer"
                    >
                         <div className="w-16 h-16 bg-[var(--background)] rounded-2xl flex items-center justify-center border border-[var(--border)] flex-shrink-0 shadow-sm">
                             <Building size={24} className="text-[var(--primary-500)]"/>
                         </div>
                         <div>
                             <h3 className="font-bold text-[var(--foreground)] group-hover:text-[var(--primary-500)] transition-colors text-lg leading-tight mb-1">
                               {job.title}
                               {job.matchScore > 0 && <span className="ml-3 px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded uppercase align-middle">{Math.round(job.matchScore)}% Match</span>}
                             </h3>
                             <p className="text-sm text-[var(--primary-600)] font-semibold">{job.company}</p>
                             <p className="text-xs text-[var(--primary-500)] flex items-center gap-1 mt-2 mb-4"><MapPin size={14}/> {job.location} • Actively Recruiting</p>
                             <p className="text-sm text-[var(--primary-600)] leading-relaxed max-w-3xl mb-4">{job.description}</p>
                             <div className="flex gap-2 flex-wrap">
                                 {job.required_skills?.slice(0,4).map((sk, idxs) => (
                                      <span key={idxs} className="bg-black/5 dark:bg-white/5 border border-[var(--border)] text-[var(--primary-600)] text-xs font-semibold px-3 py-1 rounded-lg">{sk}</span>
                                 ))}
                             </div>
                         </div>
                         <button 
                           onClick={() => toggleAlert(job._id || idx)}
                           className={`hidden md:flex border font-semibold px-5 py-2.5 rounded-xl transition-all items-center gap-2 text-sm whitespace-nowrap shadow-sm ${alerts.has(job._id || idx) ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-black/5 dark:bg-white/5 text-[var(--foreground)] border-[var(--border)] hover:bg-black/10 dark:hover:bg-white/10'}`}
                         >
                             {alerts.has(job._id || idx) ? <><CheckCircle size={16}/> Alert Active</> : <><PlusCircle size={16}/> Setup Alert</>}
                         </button>
                    </div>
                 ))
              ) : (
                 <div className="p-12 text-center text-[var(--primary-500)] font-medium">No matches found for your profile. Try viewing all listings.</div>
              )}
         </div>
      </div>
    </div>
  );
}
