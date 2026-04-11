import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, ShieldAlert, Settings, CheckCircle, Database, Server, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../api/axios';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [activeTable, setActiveTable] = useState(null); // 'students' | 'alumni' | null
  const [purging, setPurging] = useState(false);

  useEffect(() => {
    api.get('/api/students').then(res => setStudents(res.data.data)).catch(console.error);
    api.get('/api/alumni').then(res => setAlumni(res.data.data)).catch(console.error);
  }, []);

  const handlePurge = () => {
    setPurging(true);
    setTimeout(() => setPurging(false), 2000); // Simulate purge
  };

  const currentDataset = activeTable === 'students' ? students : alumni;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-[var(--foreground)]">
      {/* Left Column */}
      <div className="md:col-span-1 space-y-4">
        <div className="glass-panel border border-[var(--border)] p-6 text-center shadow-sm relative overflow-hidden rounded-xl">
            <div className="absolute top-0 left-0 right-0 h-10 bg-red-600/20"></div>
            <div className="w-16 h-16 bg-[var(--background)] border-2 border-red-500 rounded-full mx-auto mb-3 mt-4 flex items-center justify-center text-red-500 shadow-sm relative z-10"><ShieldAlert size={28}/></div>
            <h2 className="font-extrabold text-[var(--foreground)]">{user?.name || "System Admin"}</h2>
            <p className="text-xs font-bold text-red-500 uppercase tracking-widest mt-1">Super User Root</p>
        </div>
        
        <div className="glass-panel border border-[var(--border)] shadow-sm rounded-xl">
           <div className="p-4 border-b border-[var(--border)] font-bold flex gap-2 items-center text-[var(--foreground)]"><Server size={18}/> Cluster Nodes</div>
           <div className="p-4 text-sm text-[var(--primary-600)] space-y-2">
              <div className="flex justify-between"><span>FastAPI Auth</span> <span className="text-emerald-500 font-bold">● OK</span></div>
              <div className="flex justify-between"><span>Gemini LLM Agent</span> <span className="text-emerald-500 font-bold">● OK</span></div>
              <div className="flex justify-between"><span>MongoDB Cluster</span> <span className="text-emerald-500 font-bold">● OK</span></div>
           </div>
        </div>
      </div>

      {/* Main / Center Column */}
      <div className="md:col-span-3 space-y-4">
        <div className="glass-panel border border-[var(--border)] p-8 flex flex-col shadow-sm rounded-xl">
           <div className="flex items-center gap-4 mb-6">
              <Settings size={42} className="text-[var(--primary-500)] animate-spin-slow"/>
              <div>
                <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight">Platform Global Settings</h3>
                <p className="text-[var(--primary-500)] text-sm max-w-lg mt-1">
                   Manage semantic backend logic endpoints. API requests to these views enforce strict JWT Bearer token roles.
                </p>
              </div>
           </div>
           
           <div className="flex gap-4 mb-8">
              <button onClick={() => navigate('/settings')} className="bg-[var(--foreground)] text-[var(--background)] font-bold px-6 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity flex-1 text-center">Configure Models</button>
              <button onClick={handlePurge} disabled={purging} className={`font-bold px-6 py-2.5 rounded-lg shadow-sm transition-colors flex-1 text-center border ${purging ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'}`}>
                {purging ? 'Cache Purged!' : 'Purge System Cache'}
              </button>
           </div>

           <hr className="mb-8 border-[var(--border)]"/>

           <h4 className="font-bold text-[var(--foreground)] mb-4 flex items-center gap-2"><Database size={18} className="text-[var(--primary-600)]"/> MongoDB Entities</h4>
           
           <div className="grid grid-cols-2 gap-6">
               <div className="border border-[var(--border)] rounded-xl p-4 bg-black/5 dark:bg-white/5">
                  <h5 className="font-bold text-[var(--primary-600)] mb-1">Student Endpoints</h5>
                  <div className="text-3xl font-black text-[var(--foreground)] mb-3">{students.length} <span className="text-xs text-[var(--primary-500)] font-medium tracking-widest uppercase">Records</span></div>
                  <button onClick={() => setActiveTable('students')} className="text-sm font-semibold text-[var(--foreground)] bg-black/5 dark:bg-white/5 border border-[var(--border)] px-4 py-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors w-full text-left flex justify-between items-center">
                    View Table <ChevronRight size={16}/>
                  </button>
               </div>
               <div className="border border-[var(--border)] rounded-xl p-4 bg-black/5 dark:bg-white/5">
                  <h5 className="font-bold text-[var(--primary-600)] mb-1">Alumni Network</h5>
                  <div className="text-3xl font-black text-[var(--foreground)] mb-3">{alumni.length} <span className="text-xs text-[var(--primary-500)] font-medium tracking-widest uppercase">Records</span></div>
                  <button onClick={() => setActiveTable('alumni')} className="text-sm font-semibold text-[var(--foreground)] bg-black/5 dark:bg-white/5 border border-[var(--border)] px-4 py-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors w-full text-left flex justify-between items-center">
                    View Table <ChevronRight size={16}/>
                  </button>
               </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {activeTable && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveTable(null)}
          >
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
               onClick={e => e.stopPropagation()}
               className="bg-[var(--background)] border border-[var(--border)] rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl relative overflow-hidden"
             >
                <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-black/5 dark:bg-white/5">
                   <h3 className="text-xl font-bold capitalize">{activeTable} Data Explorer</h3>
                   <button onClick={() => setActiveTable(null)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"><X size={20}/></button>
                </div>
                <div className="p-0 overflow-auto flex-1">
                   <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-black/5 dark:bg-white/5 text-[var(--primary-600)] sticky top-0 backdrop-blur-md">
                         <tr>
                           <th className="px-6 py-4 font-semibold">ID</th>
                           <th className="px-6 py-4 font-semibold">Name</th>
                           <th className="px-6 py-4 font-semibold">Role/Email</th>
                           <th className="px-6 py-4 font-semibold">Metadata</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                         {currentDataset.map((item, i) => (
                           <tr key={item._id || i} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-mono text-xs text-[var(--primary-500)]">{item._id || `id_${i}`}</td>
                              <td className="px-6 py-4 font-semibold">{item.name}</td>
                              <td className="px-6 py-4 text-[var(--primary-600)]">{item.email || item.role}</td>
                              <td className="px-6 py-4 text-[var(--primary-500)] text-xs truncate max-w-[200px]">{JSON.stringify(item)}</td>
                           </tr>
                         ))}
                         {currentDataset.length === 0 && (
                           <tr><td colSpan="4" className="text-center py-8 text-[var(--primary-500)]">No records found.</td></tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
const ChevronRight = ({size}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
