import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Brain, Users, Building, Target, Zap, TrendingUp, Presentation, ArrowRight } from 'lucide-react';

const slides = [
  {
    id: 'vision',
    title: 'Cohort Connect',
    subtitle: 'AI-Powered Placement Officer for University of Bristol',
    content: 'Revolutionizing how students, alumni, and employers connect through agentic AI and semantic intelligence.',
    image: '/assets/pitch/hero.png',
    accent: 'var(--bristol-red)'
  },
  {
    id: 'problem',
    title: 'The Placement Gap',
    subtitle: 'The Problem with Traditional Systems',
    points: [
      'Fragmented email chains & manual spreadsheet tracking.',
      'Employers operation in silos, missing top-tier talent.',
      'Students lack warm introductions & actionable feedback.',
      'UK universities lack modern AI-powered placement infrastructure.'
    ],
    icon: <Target className="w-12 h-12 text-white" />,
    accent: '#333'
  },
  {
    id: 'solution',
    title: 'The Intelligent Solution',
    subtitle: 'A Closed-Loop Talent Marketplace',
    content: 'A unified platform where agentic AI reads CVs, understands job requirements semantically, and proactively connects the right people.',
    image: '/assets/pitch/semantic.png',
    accent: 'var(--bristol-red)'
  },
  {
    id: 'how-it-works',
    title: 'How It Works',
    subtitle: 'The Agentic Ecosystem',
    steps: [
      { title: 'Student', desc: 'Uploads CV → AI reads & profiles instantly.', icon: <Users /> },
      { title: 'Employer', desc: 'Searches semantically (not just keywords).', icon: <Building /> },
      { title: 'Alumni', desc: 'Vouch with AI-drafted referrals.', icon: <Brain /> },
      { title: 'University', desc: 'Tracks outcomes & gains curriculum insights.', icon: <TrendingUp /> }
    ],
    accent: '#111'
  },
  {
    id: 'uniqueness',
    title: 'Strategic Differentiators',
    subtitle: 'Why Cohort Connect Wins',
    features: [
      { name: 'Semantic Search', value: '95% match accuracy using vector embeddings.' },
      { name: 'Blind Hiring', value: 'Built-in diversity mode for ESG compliance.' },
      { name: 'Alumni referrals', value: 'Auto-drafted emails for 30-second approvals.' },
      { name: 'Real-time Analytics', value: 'Live placement dashboards for faculty.' }
    ],
    accent: 'var(--bristol-red)'
  },
  {
    id: 'impact',
    title: 'Measurable Impact',
    subtitle: 'Success Metrics for UoB',
    stats: [
      { label: 'Expected Placement Rate', value: '80%+', color: 'var(--bristol-red)' },
      { label: 'Referral Conversion', value: '50%+', color: '#fff' },
      { label: 'Time to First Interview', value: '< 28 Days', color: 'var(--bristol-red)' },
      { label: 'Match Accuracy', value: '95%', color: '#fff' }
    ],
    accent: '#000'
  },
  {
    id: 'roadmap',
    title: 'Roadmap to Success',
    subtitle: 'Implementation Phases',
    phases: [
      { name: 'Phase 1: MVP', desc: 'UoB Business Analytics Cohort 2025.', status: 'In Progress' },
      { name: 'Phase 2: Network', desc: 'Alumni engagement & referral engine.', status: 'Upcoming' },
      { name: 'Phase 3: Scale', desc: 'Rollout to Engineering & Management.', status: '2026' },
      { name: 'Phase 4: Multi-U', desc: 'Expansion to Russell Group partners.', status: 'Future' }
    ],
    accent: 'var(--bristol-red)'
  },
  {
    id: 'cta',
    title: 'The Future starts here.',
    subtitle: 'Empowering Bristol Excellence.',
    content: 'Join us in building the most advanced talent marketplace in UK Higher Education.',
    action: 'Enter Platform',
    accent: '#000'
  }
];

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(prev => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 bg-[#050505] text-white overflow-hidden select-none">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--bristol-red)] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--bristol-red-dark)] blur-[120px] rounded-full" />
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          initial={{ opacity: 0, x: direction * 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -100 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full h-full flex items-center justify-center p-8 md:p-24"
        >
          {/* Hero Slide Layout */}
          {slide.id === 'vision' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl">
              <div className="space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <img src="/assets/pitch/hero.png" alt="UoB" className="w-20 h-20 object-contain mb-8 rounded-lg" style={{ border: '2px solid var(--bristol-red)' }} />
                  <h1 className="text-7xl md:text-8xl font-black tracking-tighter pitch-gradient-text leading-none">
                    {slide.title}
                  </h1>
                </motion.div>
                <div className="space-y-4">
                  <h2 className="text-2xl md:text-3xl font-light text-white/70">{slide.subtitle}</h2>
                  <p className="text-lg md:text-xl text-white/50 max-w-xl">{slide.content}</p>
                </div>
              </div>
              <div className="relative">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  className="rounded-3xl overflow-hidden shadow-2xl shadow-[var(--bristol-red)]/20"
                >
                  <img src={slide.image} alt="Hero" className="w-full aspect-video object-cover" />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
              </div>
            </div>
          )}

          {/* Feature List Slide Layout */}
          {slide.points && (
            <div className="max-w-4xl w-full">
              <h2 className="text-lg uppercase tracking-[0.2em] text-[var(--bristol-red)] font-bold mb-4">{slide.subtitle}</h2>
              <h1 className="text-5xl md:text-7xl font-bold mb-12">{slide.title}</h1>
              <div className="grid grid-cols-1 gap-6">
                {slide.points.map((pt, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: 0.1 * i }}
                    className="flex items-center gap-6 p-6 glass-card-pitch rounded-2xl group hover:bg-white/5 transition-all"
                  >
                    <div className="w-2 h-2 rounded-full bg-[var(--bristol-red)]" />
                    <p className="text-xl md:text-2xl font-medium text-white/80">{pt}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Image + Content Slide Layout (Solution) */}
          {slide.id === 'solution' && (
            <div className="flex flex-col items-center text-center max-w-5xl">
               <h1 className="text-5xl md:text-7xl font-bold mb-6">{slide.title}</h1>
               <p className="text-xl text-white/60 mb-12 max-w-2xl">{slide.content}</p>
               <motion.div 
                  initial={{ y: 50, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }} 
                  className="rounded-3xl overflow-hidden glass-card-pitch p-2"
                >
                  <img src={slide.image} alt="Solution" className="w-full max-h-[50vh] object-cover rounded-2xl shadow-inner" />
                </motion.div>
            </div>
          )}

          {/* Workflow/Steps Slide Layout */}
          {slide.steps && (
            <div className="max-w-6xl w-full">
               <h1 className="text-5xl md:text-7xl font-bold mb-16 text-center">{slide.title}</h1>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {slide.steps.map((step, i) => (
                    <motion.div 
                      key={i} 
                      className="p-8 glass-card-pitch rounded-3xl text-center space-y-6 flex flex-col items-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                    >
                      <div className="p-4 bg-[var(--bristol-red)]/10 rounded-2xl text-[var(--bristol-red)]">
                        {React.cloneElement(step.icon, { size: 32 })}
                      </div>
                      <h3 className="text-2xl font-bold">{step.title}</h3>
                      <p className="text-white/60">{step.desc}</p>
                    </motion.div>
                  ))}
               </div>
            </div>
          )}

          {/* Stats Slide Layout */}
          {slide.stats && (
            <div className="max-w-6xl w-full">
              <h1 className="text-5xl md:text-7xl font-bold mb-16 text-center">{slide.title}</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                {slide.stats.map((stat, i) => (
                  <motion.div key={i} className="text-center space-y-2">
                    <motion.h4 initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 + (i * 0.1) }} className="text-6xl md:text-8xl font-black" style={{ color: stat.color }}>{stat.value}</motion.h4>
                    <p className="text-lg text-white/50 uppercase tracking-widest">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Roadmap Slide Layout */}
          {slide.phases && (
            <div className="max-w-5xl w-full">
               <h1 className="text-5xl md:text-7xl font-bold mb-16 text-center">{slide.title}</h1>
               <div className="space-y-6">
                {slide.phases.map((phase, i) => (
                  <motion.div 
                    key={i} 
                    className="flex flex-col md:flex-row items-center gap-8 p-6 glass-card-pitch rounded-2xl relative"
                  >
                    <div className="text-4xl font-black text-white/10 shrink-0">0{i+1}</div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-bold">{phase.name}</h3>
                      <p className="text-white/60">{phase.desc}</p>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium">
                      {phase.status}
                    </div>
                  </motion.div>
                ))}
               </div>
            </div>
          )}

          {/* CTA Slide Layout */}
          {slide.id === 'cta' && (
            <div className="text-center space-y-12">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <h1 className="text-7xl md:text-9xl font-black leading-none mb-8">Empowering<br/><span className="text-[var(--bristol-red)]">Bristol</span> Excellence.</h1>
                <p className="text-2xl text-white/50 max-w-2xl mx-auto">{slide.content}</p>
              </motion.div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/auth'}
                className="px-12 py-6 bg-[var(--bristol-red)] rounded-full text-2xl font-bold flex items-center gap-4 mx-auto shadow-2xl shadow-[var(--bristol-red)]/40"
              >
                {slide.action} <ArrowRight />
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="fixed bottom-12 left-0 right-0 z-50 flex items-center justify-between px-12">
        <div className="flex gap-4">
          <button 
            onClick={prevSlide} 
            disabled={currentSlide === 0}
            className="p-4 rounded-full glass-card-pitch disabled:opacity-20 hover:bg-white/10 transition-all"
          >
            <ChevronLeft size={32} />
          </button>
          <button 
            onClick={nextSlide} 
            disabled={currentSlide === slides.length - 1}
            className="p-4 rounded-full glass-card-pitch disabled:opacity-20 hover:bg-white/10 transition-all"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        <div className="flex gap-3">
          {slides.map((_, i) => (
            <button 
              key={i} 
              onClick={() => { setDirection(i > currentSlide ? 1 : -1); setCurrentSlide(i); }}
              className={`nav-dot ${currentSlide === i ? 'active' : ''}`}
            />
          ))}
        </div>

        <div className="text-white/20 font-medium tracking-tighter text-xl">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>

      {/* Global University Branding */}
      <div className="fixed top-12 left-12 z-50 flex items-center gap-4">
        <div className="w-1.5 h-12 bg-[var(--bristol-red)]" />
        <div>
          <div className="text-sm font-black tracking-widest text-white/40 uppercase">University of Bristol</div>
          <div className="text-lg font-bold tracking-tight">Cohort Connect</div>
        </div>
      </div>
    </div>
  );
}
