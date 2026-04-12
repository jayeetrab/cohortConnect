import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import PitchDeck from './PitchDeck';
import { motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';

export default function PublicPitch() {
  const [loading, setLoading] = useState(true);
  const [pitchData, setPitchData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch strategic pitch data from the backend
    axios.get('/api/pitch')
      .then(res => {
        setPitchData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch pitch data", err);
        setError("Technical connectivity issue. Please try again.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="animate-spin text-red-500" size={48} />
        <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Syncing Bristol Vision</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center text-white p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 border border-red-500/20">
           <X size={40} />
        </div>
        <h2 className="text-3xl font-black tracking-tighter">{error}</h2>
        <button 
           onClick={() => window.location.reload()}
           className="px-8 py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest"
        >
           Retry Connection
        </button>
      </div>
    );
  }

  // Render the PitchDeck component. 
  // onClose is a no-op here as it's a standalone page.
  return (
    <div className="h-screen w-screen overflow-hidden">
      <PitchDeck onClose={() => {}} isPublic={true} data={pitchData} />
    </div>
  );
}
