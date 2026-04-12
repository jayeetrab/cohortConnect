import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, ChevronLeft, X, Sparkles, BrainCircuit, 
  Target, Zap, Globe, Shield, Users, Rocket, Search,
  TrendingUp, Award, BookOpen, MessageSquare, Check, CheckCircle, AlertCircle
} from 'lucide-react';

export default function PitchDeck({ onClose, isPublic = false, data = null }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Use data from backend if available for metrics and headers
  const metrics = data?.impact_metrics || {
    hireability_boost: "+45%",
    mentorship_count: "6.2k",
    placement_velocity: "2.4x",
    security: "Verified"
  };

  const slides = [
    {
      title: "The Bristol Talent Catalyst",
      subtitle: "Bridging the gap between world-class education and global industry leadership.",
      content: (
        <div className="flex flex-col items-center justify-center space-y-12 h-full py-20">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-48 h-48 bg-white/10 dark:bg-white/5 rounded-[3rem] flex items-center justify-center border border-white/20 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent blur-2xl"></div>
            <Rocket size={80} className="text-red-500 relative z-10" />
          </motion.div>
          <div className="text-center space-y-6 max-w-3xl">
             <h2 className="text-7xl font-black tracking-tighter text-white">Cohort Connect</h2>
             <p className="text-2xl font-medium text-slate-300 leading-relaxed">
               A proprietary AI talent ecosystem designed exclusively for the <span className="text-red-500 font-black">University of Bristol</span>.
             </p>
          </div>
        </div>
      )
    },
    {
      title: "The Fragmentation Crisis",
      subtitle: "The existing student-employer connection is broken and keyword-dependent.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full py-12">
          {[
            { icon: Users, label: "Disconnected Students", desc: "Top talents struggling to match with specialized roles." },
            { icon: Globe, label: "Passive Alumni", desc: "Untapped mentorship potential within the Bristol network." },
            { icon: Search, label: "Inefficient Hiring", desc: "Employers missing elite candidates due to weak search tools." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="glass-panel p-10 rounded-[3rem] border border-white/10 flex flex-col items-center text-center space-y-6 bg-white/5 backdrop-blur-3xl shadow-xl"
            >
              <div className="p-4 bg-red-500/10 rounded-2xl text-red-400">
                <item.icon size={48} />
              </div>
              <h3 className="text-2xl font-black text-white">{item.label}</h3>
              <p className="text-slate-400 font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      title: "Predictive Career Alignment",
      subtitle: "Moving beyond basic profiles to real-time Hireability Scoring.",
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-full py-12 items-center text-white">
          <div className="space-y-8">
            <h3 className="text-5xl font-black leading-tight tracking-tighter">Quantifiable <br/><span className="text-emerald-500">Industry Fitness.</span></h3>
            <div className="space-y-6">
              {[
                { icon: Zap, text: "Automated Hireability Scoring (0-100)" },
                { icon: Target, text: "Dynamic Skill Gap Tracking" },
                { icon: BookOpen, text: "Curated Skill Improvement Roadmaps" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-xl text-slate-300 font-medium">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><item.icon size={24} /></div>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel p-10 rounded-[3.5rem] bg-black/40 border border-white/10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6">
                <div className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.3em] bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">Active Analysis</div>
             </div>
             <div className="flex justify-between items-end mb-10 pt-4">
                <div className="space-y-1">
                   <p className="text-xs font-black uppercase text-white/40 tracking-widest">Hireability Score</p>
                   <h4 className="text-4xl font-black text-white tracking-tighter">Peak Performance</h4>
                </div>
                <div className="text-8xl font-black text-emerald-500 tracking-tighter">89<span className="text-sm font-bold text-white/40">/100</span></div>
             </div>
             <div className="space-y-8">
                <div className="space-y-3">
                   <div className="flex justify-between text-[10px] font-black text-white/60 uppercase tracking-widest">
                      <span>Data Engineering</span>
                      <span className="text-emerald-500">92%</span>
                   </div>
                   <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} transition={{ duration: 1 }} className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"></motion.div>
                   </div>
                </div>
                <div className="space-y-3">
                   <div className="flex justify-between text-[10px] font-black text-white/60 uppercase tracking-widest">
                      <span>Cloud Architecture</span>
                      <span className="text-amber-500">45%</span>
                   </div>
                   <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '45%' }} transition={{ duration: 1 }} className="h-full bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]"></motion.div>
                   </div>
                </div>
                <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex gap-4 items-center">
                   <Sparkles className="text-emerald-500 shrink-0" size={20} />
                   <p className="text-xs text-white/80 font-medium leading-relaxed">
                      <span className="font-black text-emerald-500">STRATEGY:</span> Complete the GCP Professional Architect course to boost score to <span className="font-bold">95+</span>.
                   </p>
                </div>
             </div>
          </div>
        </div>
      )
    },
    {
      title: "Smart CV Enhancement",
      subtitle: "Gemini-powered feedback to align every student with high-tier roles.",
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 h-full py-12 items-center text-white">
          <div className="glass-panel p-12 rounded-[4rem] bg-black/40 border border-white/10 space-y-10 relative overflow-hidden group shadow-2xl">
             <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
             <div className="flex items-center gap-6 relative z-10">
                <div className="p-4 bg-red-500/10 rounded-3xl text-red-500 shadow-inner border border-red-500/20"><BrainCircuit size={40} /></div>
                <div>
                   <h4 className="text-3xl font-black text-white tracking-tighter">AI Mentor Layer</h4>
                   <p className="text-[10px] font-black uppercase text-red-500 tracking-[0.2em] mt-1">Real-time Semantic Analysis</p>
                </div>
             </div>
             <div className="space-y-8 relative z-10">
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="p-8 bg-white/5 rounded-3xl border border-white/5 text-lg font-medium leading-tight italic"
                >
                  "Your research depth is exceptional. To capture the attention of **DeepMind Recruiters**, we recommend surfacing your LLM optimization work earlier in the 'Core Projects' section."
                </motion.div>
                <div className="flex gap-4">
                   <div className="w-1.5 h-auto bg-emerald-500 rounded-full"></div>
                   <div className="text-sm text-slate-400 font-medium space-y-2">
                      <p className="text-emerald-500 font-black uppercase tracking-widest text-[10px]">Optimization Result</p>
                      <p>Successfully re-indexed 4 CV parameters to favor **Algorithmic Complexity** over generic software skills.</p>
                   </div>
                </div>
             </div>
          </div>
          <div className="space-y-8">
             <h3 className="text-6xl font-black text-white tracking-tighter leading-tight">The Delta <br/><span className="text-red-500">Resolved.</span></h3>
             <p className="text-2xl text-slate-400 leading-relaxed font-medium max-w-lg">
               We don't just match; we mentor. Our engine analyzes the gap between a student's CV and a specific job description, providing precise language improvements.
             </p>
          </div>
        </div>
      )
    },
    {
      title: "Natural Language Talent Discovery",
      subtitle: "Empowering Bristol Employers with semantic search capabilities.",
      content: (
        <div className="flex flex-col space-y-12 h-full py-16 text-white text-center md:text-left">
          <div className="max-w-4xl mx-auto w-full glass-panel p-8 md:p-12 rounded-[3.5rem] border border-white/10 shadow-[0_32px_128px_rgba(0,0,0,0.5)] relative group bg-black/20 backdrop-blur-3xl overflow-hidden">
             <div className="absolute inset-0 bg-red-600/5 blur-[120px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
             <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <Search className="text-slate-500 hidden md:block" size={48} />
                <div className="flex-1 text-2xl md:text-4xl font-black text-white italic tracking-tighter leading-tight">
                  "Find me a researcher with expertise in Climate Risk and Python who has mentor approval."
                </div>
                <div className="px-8 py-4 bg-red-600 text-white text-[12px] font-black rounded-3xl shadow-xl hover:scale-105 transition-transform cursor-pointer tracking-widest uppercase">AI ANALYZE</div>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto w-full">
             <div className="glass-panel p-10 rounded-[3rem] border border-white/5 space-y-6 bg-white/2 hover:bg-white/5 transition-colors group">
                <TrendingUp className="text-red-500 group-hover:scale-110 transition-transform" size={32} />
                <h4 className="text-2xl font-black text-white tracking-tight">Semantic Intent</h4>
                <p className="text-slate-400 text-lg font-medium leading-relaxed">Unlike keyword filters, our engine understands the <span className="text-white">context</span> and latent skills of the Bristol ecosystem.</p>
             </div>
             <div className="glass-panel p-10 rounded-[3rem] border border-white/5 space-y-6 bg-white/2 hover:bg-white/5 transition-colors group">
                <Award className="text-emerald-500 group-hover:scale-110 transition-transform" size={32} />
                <h4 className="text-2xl font-black text-white tracking-tight">Verified Results</h4>
                <p className="text-slate-400 text-lg font-medium leading-relaxed">Only candidates with validated institutional data and alumni approvals appear in employer search results.</p>
             </div>
          </div>
        </div>
      )
    },
    {
      title: "The Vision for Bristol",
      subtitle: "Elevating the employment prestige of the University of Bristol globally.",
      content: (
        <div className="flex flex-col items-center justify-center space-y-16 h-full py-16 text-white">
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 w-full max-w-6xl">
              {[
                { label: "Hireability", value: metrics.hireability_boost, desc: "Direct Industry Alignment" },
                { label: "Mentorship", value: metrics.mentorship_count, desc: "Active Alumni Connections" },
                { label: "Placement", value: metrics.placement_velocity, desc: "Faster Role Matching" },
                { label: "Network", value: metrics.security, desc: "Institutional Security" }
              ].map((stat, i) => (
                <div key={i} className="text-center space-y-4">
                   <div className="text-7xl font-black text-white tracking-tighter mb-2">{stat.value}</div>
                   <div className="text-[12px] font-black text-red-500 uppercase tracking-[0.4em]">{stat.label}</div>
                   <p className="text-sm text-slate-500 font-bold uppercase tracking-tight">{stat.desc}</p>
                </div>
              ))}
           </div>
           <div className="max-w-4xl text-center space-y-10 pt-16 border-t border-white/10">
              <p className="text-5xl font-black text-white tracking-tighter leading-tight">
                "Cohort Connect isn't a job board. It's the <span className="text-red-500">AI-driven infrastructure</span> for Bristol's global talent dominance."
              </p>
              <button 
                onClick={onClose}
                className="px-16 py-6 bg-red-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-[0_20px_80px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95 transition-all"
              >
                Launch Ecosystem
              </button>
           </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col overflow-hidden select-none">
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-[60vw] h-[60vh] bg-red-600/10 blur-[180px] rounded-full"></div>
         <div className="absolute bottom-0 right-0 w-[60vw] h-[60vh] bg-red-900/15 blur-[180px] rounded-full"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-150"></div>
      </div>

      <header className="p-10 md:p-14 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-[0_0_40px_rgba(220,38,38,0.5)]">C</div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase leading-none">Cohort Connect</h1>
              <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.5em] mt-2">UoB Strategic Insight</p>
           </div>
        </div>
        <button 
          onClick={onClose}
          className="p-5 rounded-3xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-white hover:scale-110 active:scale-90"
        >
          <X size={28} />
        </button>
      </header>

      <main className="flex-1 flex flex-col relative z-10 px-10 md:px-24 overflow-hidden">
         <AnimatePresence mode="wait">
            <motion.div 
               key={currentSlide}
               initial={{ opacity: 0, y: 40 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -40 }}
               transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
               className="flex-1 flex flex-col pt-4"
            >
               <div className="space-y-6">
                  <div className="flex items-center gap-6">
                     <span className="w-20 h-1 bg-red-600"></span>
                     <span className="text-xl font-black text-red-500 uppercase tracking-[0.6em]">{`PHASE 0${currentSlide + 1}`}</span>
                  </div>
                  <div className="space-y-2">
                     <h2 className="text-7xl md:text-8xl font-black text-white tracking-tighter leading-none">{slides[currentSlide].title}</h2>
                     <p className="text-2xl font-bold text-slate-500 max-w-4xl tracking-tight">{slides[currentSlide].subtitle}</p>
                  </div>
               </div>

               <div className="flex-1 overflow-visible">
                  {slides[currentSlide].content}
               </div>
            </motion.div>
         </AnimatePresence>
      </main>

      <footer className="p-10 md:p-20 flex justify-between items-center relative z-10 bg-gradient-to-t from-slate-950 to-transparent">
         <div className="flex gap-6 items-center">
            {slides.map((_, i) => (
              <div 
                key={i} 
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full cursor-pointer transition-all duration-500 ${currentSlide === i ? 'w-12 bg-red-600' : 'w-4 bg-white/10 hover:bg-white/30'}`}
              />
            ))}
         </div>
         <div className="flex gap-6">
            <button 
               disabled={currentSlide === 0}
               onClick={() => setCurrentSlide(prev => prev - 1)}
               className="p-6 rounded-3xl bg-white/5 border border-white/10 text-white disabled:opacity-5 w-20 h-20 flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"
            >
               <ChevronLeft size={32} />
            </button>
            <button 
               disabled={currentSlide === slides.length - 1}
               onClick={() => setCurrentSlide(prev => prev + 1)}
               className="px-14 h-20 bg-white text-black rounded-3xl font-black text-sm uppercase tracking-[0.4em] flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-[0_20px_60px_rgba(255,255,255,0.2)]"
            >
               Next Insight <ChevronRight size={24} />
            </button>
         </div>
      </footer>
    </div>
  );
}
