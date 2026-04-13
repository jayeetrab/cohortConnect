import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Lightbulb, TrendingUp, Building, MapPin, Briefcase } from 'lucide-react';
import api from '../api/axios';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch Job Details and Analysis in parallel
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobRes, matchRes] = await Promise.all([
          api.get(`/api/jobs/${id}`), 
          api.get(`/api/jobs/${id}/analyze`).catch(err => {
            console.error("Analysis failed", err);
            return { data: { status: "error", message: err.response?.data?.detail || "Make sure you uploaded your CV to get an analysis." } };
          })
        ]);
        
        if (jobRes.data.status === "success") {
          setJob(jobRes.data.data);
        } else {
          setError("Job not found in database.");
          return;
        }
        
        if (matchRes.data.status === "success") {
          setAnalysis(matchRes.data.analysis);
        } else {
          setError(matchRes.data.message);
        }
      } catch (err) {
        setError("Failed to fetch detailed analysis.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="animate-spin text-[var(--primary-500)]" size={48} />
        <p className="text-[var(--foreground)] font-bold animate-pulse">Running Deep Semantic Analysis...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20 text-[var(--foreground)]">
        <h2 className="text-2xl font-bold mb-4">{error || "Job Not Found"}</h2>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--border)] font-semibold">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-[var(--primary-500)] hover:text-[var(--foreground)] transition-colors font-bold text-sm"
      >
        <ArrowLeft size={16} /> Back to Listings
      </button>

      {/* JOB HEADER */}
      <div className="glass-panel border border-[var(--border)] rounded-3xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
         <div className="w-24 h-24 bg-[var(--background)] border border-[var(--border)] rounded-2xl flex items-center justify-center shadow-inner shrink-0">
            <Building size={40} className="text-[var(--primary-500)]" />
         </div>
         <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight mb-2">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-[var(--primary-600)]">
                <span className="flex items-center gap-1.5"><Building size={16}/> {job.company}</span>
                <span className="flex items-center gap-1.5"><MapPin size={16}/> {job.location}</span>
                <span className="flex items-center gap-1.5"><Briefcase size={16}/> Action Required</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
               {job.required_skills?.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-black/5 dark:bg-white/5 border border-[var(--border)] text-[var(--foreground)] rounded-lg text-xs font-bold uppercase tracking-wider">{skill}</span>
               ))}
            </div>
         </div>
         <button className="w-full md:w-auto px-8 py-3 bg-[var(--foreground)] text-[var(--background)] font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shrink-0">
           Apply Now
         </button>
      </div>

      {/* AI ANALYSIS SECTION */}
      {analysis ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="glass-panel border border-[var(--border)] rounded-3xl p-8 space-y-6 md:col-span-2">
              <h3 className="text-xl font-bold flex items-center gap-2 text-[var(--foreground)]">
                 <CheckCircle size={24} className="text-emerald-500" /> Executive Match Summary
              </h3>
              <p className="text-[var(--primary-600)] font-medium leading-relaxed text-lg">
                {analysis.match_reason}
              </p>
           </div>

           <div className="glass-panel border border-rose-500/20 rounded-3xl p-8 space-y-6 relative overflow-hidden bg-rose-500/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
              <h3 className="text-xl font-bold flex items-center gap-2 text-rose-500">
                 <XCircle size={24} /> Skill Gaps Identified
              </h3>
              <ul className="space-y-3">
                 {analysis.missing_skills?.map((skill, i) => (
                   <li key={i} className="flex items-start gap-3 text-[var(--foreground)] font-medium">
                     <div className="mt-1 w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0"></div>
                     {skill}
                   </li>
                 ))}
                 {(!analysis.missing_skills || analysis.missing_skills.length === 0) && (
                   <li className="text-[var(--primary-600)] font-medium italic">No critical missing skills detected.</li>
                 )}
              </ul>
           </div>

           <div className="glass-panel border border-emerald-500/20 rounded-3xl p-8 space-y-6 relative overflow-hidden bg-emerald-500/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
              <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-500">
                 <TrendingUp size={24} /> Growth Recommendations
              </h3>
              <ul className="space-y-3">
                 {analysis.recommended_courses?.map((course, i) => (
                   <li key={i} className="flex items-start gap-3 text-[var(--foreground)] font-medium">
                     <div className="mt-1 w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></div>
                     {course}
                   </li>
                 ))}
              </ul>
              {analysis.hireability_advice && (
                <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold text-sm flex items-start gap-3">
                  <Lightbulb size={20} className="shrink-0" />
                  <p>{analysis.hireability_advice}</p>
                </div>
              )}
           </div>
        </div>
      ) : (
        <div className="glass-panel border border-amber-500/20 rounded-3xl p-8 text-center bg-amber-500/5 border-dashed">
            <h3 className="text-xl font-bold text-amber-500 mb-2">Analysis Unavailable</h3>
            <p className="text-[var(--primary-600)] font-medium">{error || "Upload your CV in the Dashboard to unlock customized semantic gap analysis for this role."}</p>
            <button onClick={() => navigate('/')} className="mt-6 px-6 py-2.5 bg-amber-500 text-white font-bold rounded-xl shadow-lg hover:bg-amber-600 transition-colors">
              Go to Dashboard
            </button>
        </div>
      )}
    </div>
  );
}
