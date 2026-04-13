import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Briefcase, Target, Zap, ChevronRight, 
  AlertCircle, BookOpen, BrainCircuit, Star, ArrowRight, Activity
} from 'lucide-react';
import api from '../api/client';

export default function JobDetailModal({ jobId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!jobId || jobId === 'undefined') {
        setError('Invalid Job ID. Please try another opportunity.');
        setLoading(false);
        return;
    }
    const fetchAnalysis = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/api/jobs/${jobId}/analyze`);
        setData(res.data);
      } catch (err) {
        console.error("Analysis error:", err);
        setError(err.response?.data?.detail || 'This job is currently being indexed for analysis. Please check back in a few minutes.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [jobId]);

  if (!jobId) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel border border-[var(--border)] rounded-[2rem] p-8 shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/5 text-[var(--primary-500)] transition-colors"
        >
          <X size={20} />
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-[var(--border)] border-t-emerald-500 rounded-full" />
            <p className="text-sm font-bold text-[var(--primary-500)]">Running AI Career Analysis...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center space-y-4">
            <AlertCircle size={48} className="mx-auto text-red-500/50" />
            <p className="text-[var(--foreground)] font-bold px-6">{error}</p>
            <button 
                onClick={onClose} 
                className="px-8 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-2xl text-sm font-bold hover:opacity-90 transition-all"
            >
                Close Engine
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest w-fit mb-4">
                <BrainCircuit size={12} /> Personalized Roadmap
              </div>
              <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight">
                {data.job?.title}
              </h2>
              <p className="text-[var(--primary-500)] font-semibold mt-1">
                {data.job?.company} · {data.job?.location}
              </p>
            </div>

            {/* Match Reason */}
            {data.analysis?.match_reason && (
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Star size={64} className="text-emerald-500" />
                </div>
                <h3 className="text-xs uppercase tracking-widest text-emerald-500 font-black mb-3 flex items-center gap-2">
                  <Activity size={12} /> Why you're a fit
                </h3>
                <p className="text-[var(--foreground)] text-sm leading-relaxed relative z-10">
                  {data.analysis.match_reason}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gaps to Close */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-red-400 font-black flex items-center gap-2">
                  <Target size={12} /> Gaps to Close
                </h3>
                <div className="space-y-2">
                  {(data.analysis?.missing_skills || []).length === 0 ? (
                    <p className="text-xs text-[var(--primary-500)] italic">No significant skill gaps identified.</p>
                  ) : (
                    data.analysis.missing_skills.map((skill) => (
                      <div key={skill} className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-sm font-medium text-[var(--foreground)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                        {skill}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Learning Path */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-sky-500 font-black flex items-center gap-2">
                  <BookOpen size={12} /> Recommended Path
                </h3>
                <div className="space-y-2">
                  {(data.analysis?.recommended_courses || []).length === 0 ? (
                    <p className="text-xs text-[var(--primary-500)] italic">Your current profile is highly competitive.</p>
                  ) : (
                    data.analysis.recommended_courses.map((course, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-sky-500/5 border border-sky-500/10 text-sm group cursor-pointer hover:bg-sky-500/10 transition-colors">
                        <ChevronRight size={14} className="text-sky-500 mt-0.5 shrink-0 group-hover:translate-x-1 transition-transform" />
                        <span className="text-[var(--foreground)] font-medium">{course}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* AI Career Advice */}
            {data.analysis?.hireability_advice && (
              <div className="pt-6 border-t border-[var(--border)]">
                <h3 className="text-xs uppercase tracking-widest text-[var(--primary-500)] font-black mb-4 flex items-center gap-2">
                  <Zap size={14} className="text-orange-500" /> Career Coach Insight
                </h3>
                <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)]">
                  <p className="text-sm text-[var(--primary-600)] leading-relaxed italic">
                    "{data.analysis.hireability_advice}"
                  </p>
                </div>
              </div>
            )}

            {/* Footer Action */}
            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl bg-[var(--foreground)] text-[var(--background)] font-black text-sm hover:opacity-90 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2"
              >
                Apply Now <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
