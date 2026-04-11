import React, { useState } from 'react';
import { Search, BrainCircuit, User, ArrowRight, AlertCircle, Bookmark, Filter, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function EmployerDashboard() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [errorMSG, setErrorMSG] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if(!query) return;
    setIsSearching(true);
    setErrorMSG('');
    
    const formData = new FormData();
    formData.append("query", query);
    
    try {
      const res = await api.post("/api/semantic-search", formData);
      const data = res.data;
      setHasSearched(true);
      if(data.status === "success") {
        setResults(data.matches || []);
      } else {
        setErrorMSG(data.message || "Search failed due to internal error.");
        setResults([]);
      }
    } catch(err) {
      if(err.code === 'ECONNABORTED') setErrorMSG("Security Timeout: Engine taking longer than max limits.");
      else setErrorMSG(err.response?.data?.detail || "Authentication Error: Failed to resolve secure cluster.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 max-w-full text-[var(--foreground)]">
      {/* Left Sidebar - LinkedIn Recruiter Tools */}
      <div className="space-y-4">
         <div className="glass-panel border border-[var(--border)] rounded-xl shadow-sm p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-sm"><Bookmark size={16} fill="currentColor"/> Saved Searches</h3>
            <div className="space-y-2">
                <div onClick={() => setQuery("Backend scalable Python developer")} className="text-xs text-[var(--primary-500)] font-semibold cursor-pointer hover:text-[var(--foreground)] transition-colors">"Backend scalable Python developer"</div>
                <div onClick={() => setQuery("Risk modelling for finance")} className="text-xs text-[var(--primary-500)] font-semibold cursor-pointer hover:text-[var(--foreground)] transition-colors">"Risk modelling for finance"</div>
            </div>
         </div>
         <div className="glass-panel border border-[var(--border)] rounded-xl shadow-sm p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-sm"><Filter size={16}/> Pipeline Filters</h3>
            <div className="text-xs text-[var(--primary-600)] mb-1">Status</div>
            <select className="w-full text-sm border border-[var(--border)] rounded-md p-2 mb-3 bg-[var(--background)] text-[var(--foreground)] outline-none">
               <option>All Candidates</option>
               <option>Contacted</option>
            </select>
         </div>
      </div>

      {/* Main Column - Search Engine & Results */}
      <div className="space-y-4">
        {/* Search Header */}
        <div className="glass-panel border border-[var(--border)] rounded-xl shadow-sm p-6 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
             <div className="bg-[var(--foreground)] text-[var(--background)] p-3 rounded-xl"><BrainCircuit size={24}/></div>
             <h2 className="text-xl font-bold">Semantic AI Recruiter</h2>
          </div>
          <p className="text-sm text-[var(--primary-500)] mb-6">Enter a natural language requirement to instantly parse through the MongoDB Atlas Vector pool of candidate resumes.</p>
          
          <form onSubmit={handleSearch} className="flex gap-3 relative">
             <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <Search size={18} className="text-[var(--primary-500)]"/>
                </div>
                <input 
                  type="text" 
                  value={query} 
                  onChange={(e)=>setQuery(e.target.value)} 
                  placeholder="e.g. Someone to build LLMs utilizing PyTorch..." 
                  className="w-full pl-11 pr-4 py-3 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl focus:border-[var(--foreground)] text-sm font-medium outline-none transition-colors"
                />
             </div>
             <button disabled={isSearching} className="bg-[var(--foreground)] text-[var(--background)] font-bold px-8 py-3 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50">
                {isSearching ? "Querying..." : "Search"}
             </button>
          </form>
          {errorMSG && <div className="mt-4 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20 font-semibold">{errorMSG}</div>}
        </div>

        {/* Results List */}
        {hasSearched && !isSearching && results.length === 0 && !errorMSG && (
           <div className="glass-panel border border-[var(--border)] p-8 text-center text-[var(--primary-500)] shadow-sm rounded-xl font-medium">
              No semantic matches found in the MongoDB candidates cluster.
           </div>
        )}

        {results.length > 0 && (
           <div className="glass-panel border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
              <div className="bg-black/5 dark:bg-white/5 px-6 py-4 border-b border-[var(--border)] flex justify-between items-center">
                 <h3 className="font-bold">{results.length} Candidates matched your AI query</h3>
                 <span className="text-xs text-[var(--primary-500)] font-medium">Sorted by match %</span>
              </div>
              <ul className="divide-y divide-[var(--border)]">
                 {results.map((candidate, i) => (
                    <li key={candidate.id} className="p-6 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex gap-5 items-start relative group">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--background)] flex items-center justify-center border border-[var(--border)] shadow-sm flex-shrink-0 text-xl font-bold">
                           {candidate.name.charAt(0)}
                           {i===0 && <div className="absolute top-4 left-4 w-4 h-4 bg-emerald-500 border-2 border-[var(--background)] rounded-full z-10"></div>}
                        </div>
                        <div className="flex-grow">
                           <div className="flex justify-between items-start mb-1">
                               <h4 className="font-bold text-lg group-hover:text-[var(--primary-500)] cursor-pointer transition-colors leading-tight">{candidate.name}</h4>
                               <div className="bg-emerald-500/10 text-emerald-500 font-bold text-xs px-3 py-1.5 rounded-lg border border-emerald-500/20">Match: {candidate.match}%</div>
                           </div>
                           <p className="text-sm font-semibold text-[var(--primary-600)]">{candidate.topSkill} Specialist</p>
                           <p className="text-xs text-[var(--primary-500)] mb-4">University of Bristol • Active candidate</p>
                           
                           <div className="bg-black/5 dark:bg-white/5 border-l-2 border-[var(--foreground)] p-4 text-sm leading-relaxed mb-5 rounded-r-xl">
                               <span className="font-bold block mb-1">Semantic Match Reason:</span>
                               <span className="text-[var(--primary-600)]">{candidate.reason}</span>
                           </div>
                           
                           <button onClick={() => navigate('/messaging')} className="text-sm border border-[var(--border)] font-semibold px-5 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center gap-2">
                               <MessageSquare size={16}/> Message Candidate
                           </button>
                        </div>
                    </li>
                 ))}
              </ul>
           </div>
        )}
      </div>
    </div>
  );
}
