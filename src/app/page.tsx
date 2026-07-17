'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '../context/AppStateContext';
import { AIHelper } from '../lib/ai';
import { Sparkles, Play, Cpu, Terminal, Layers } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { startNewTest } = useAppState();

  const handleStartDemo = () => {
    // Preset demo test for 2 questions
    const demoTest = {
      id: 'demo_test',
      subjectId: 'ai',
      title: 'AI Fundamentals (Demo Mission)',
      mode: 'Unit Test' as const,
      difficulty: 'Medium' as const,
      durationMinutes: 10,
      xpReward: 30,
      questions: [
        {
          id: 'ai_1',
          text: 'Explain the difference between Informed (Heuristic) Search and Uninformed Search algorithms with examples.',
          marks: 5,
          type: 'short' as const,
          expectedKeywords: ['heuristic', 'informed', 'pathfinding', 'A*', 'BFS', 'uninformed', 'blind search', 'nodes', 'domain knowledge'],
          expectedAnswer: 'Uninformed search has no info about goal distance. BFS/DFS are examples. Informed search uses heuristics (estimated distance to goal) to guide pathfinding, e.g., A* search and Greedy Best-First Search.',
          topperAnswer: 'Informed vs Uninformed search difference lies in heuristic function h(n). Uninformed searches (BFS, DFS) traverse without target estimate, taking O(b^d) time. Informed search uses heuristic functions (like A* with f(n)=g(n)+h(n)) to prune states, guaranteeing optimal traversal with O(b^d) worst-case limit.'
        },
        {
          id: 'ai_2',
          text: 'Define Turing Test in Artificial Intelligence. What are its limitations?',
          marks: 2,
          type: 'very-short' as const,
          expectedKeywords: ['Alan Turing', 'imitation game', 'intelligence', 'human-like', 'behavioral equivalence', 'Chinese Room'],
          expectedAnswer: 'Turing test evaluates if a machine can behave like a human in conversation. Interrogator cannot distinguish machine from human. Limitations: checks simulation not thinking, susceptible to conversational tricks.',
          topperAnswer: 'Proposed by Alan Turing (1950), it checks behavioral indistinguishability. Limitations: 1. Chinese Room Argument (syntax is not semantics). 2. Anthropocentric bias (excludes non-human intelligence). 3. Susceptible to conversational manipulation.'
        }
      ]
    };
    
    startNewTest(demoTest);
    router.push('/exam/demo_test');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] py-12 relative overflow-hidden">
      
      {/* Background Neon Grid Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-blue/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Cyberpunk Top Accent Bar */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-cyber-blue/30 bg-cyber-blue/5 mb-6 animate-pulse shadow-[0_0_15px_rgba(0,240,255,0.15)]">
        <Sparkles className="w-4 h-4 text-cyber-blue" />
        <span className="font-mono text-xs font-bold text-cyber-blue tracking-widest uppercase">
          AI MAINBOARD PROTOCOL ACTIVE
        </span>
      </div>

      {/* Main Grid Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full max-w-6xl mt-4">
        
        {/* Left Headline Column */}
        <div className="lg:col-span-7 flex flex-col text-left space-y-6">
          <h1 className="font-orbitron font-black text-4xl sm:text-5xl md:text-6xl tracking-tight text-white leading-tight">
            Subjective Test <br />
            Engineered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue via-cyber-teal to-cyber-purple neon-text-blue">AI Examiner</span>
          </h1>
          
          <p className="font-rajdhani text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
            Input any academic topic to generate university-standard subjective exam papers. Write your answers in our distraction-free portal and receive a deep evaluation compared with gold topper standards.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => router.push('/generator')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyber-blue to-cyber-teal hover:from-cyber-teal hover:to-cyber-blue text-slate-950 font-orbitron font-extrabold tracking-widest text-sm uppercase transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-pointer"
            >
              <Play className="w-4.5 h-4.5 fill-[#050816] text-[#050816]" />
              Launch Test Builder
            </button>
            
            <button
              onClick={handleStartDemo}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-cyber-pink/40 bg-cyber-pink/5 hover:bg-cyber-pink/15 hover:border-cyber-pink text-cyber-pink font-orbitron font-extrabold tracking-widest text-sm uppercase transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_15px_rgba(255,0,85,0.1)] cursor-pointer"
            >
              <Terminal className="w-4.5 h-4.5" />
              Try Demo Test
            </button>
          </div>
        </div>

        {/* Right 3D/SVG Neural Brain Animation Column */}
        <div className="lg:col-span-5 flex justify-center relative">
          <div className="w-72 h-72 md:w-96 md:h-96 relative flex items-center justify-center border border-cyan-500/10 rounded-3xl bg-slate-950/40 backdrop-blur-md shadow-2xl">
            
            {/* Ambient pulse shadow */}
            <div className="absolute inset-4 rounded-3xl bg-gradient-to-tr from-cyber-blue/10 to-cyber-purple/10 blur-xl animate-pulse" />
            
            {/* SVG Brain */}
            <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 text-cyber-blue drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]">
              {/* Grid Lines mapping inside the container */}
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" className="opacity-20" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5 5" className="opacity-30" />
              
              {/* Neural Nodes connection Lines */}
              <path d="M25 50 Q35 30 50 25 T75 50" fill="none" stroke="currentColor" strokeWidth="0.5" className="opacity-40 animate-pulse" />
              <path d="M25 50 Q35 70 50 75 T75 50" fill="none" stroke="currentColor" strokeWidth="0.5" className="opacity-40" />
              <path d="M50 25 L50 75" fill="none" stroke="currentColor" strokeWidth="0.5" className="opacity-30" />
              <path d="M25 50 L75 50" fill="none" stroke="currentColor" strokeWidth="0.5" className="opacity-30" />
              
              {/* Brain contours (Simulated SVG Paths) */}
              <path 
                d="M50 20 C35 20, 25 32, 25 45 C25 55, 32 60, 35 62 C38 64, 40 70, 50 78 C60 70, 62 64, 65 62 C68 60, 75 55, 75 45 C75 32, 65 20, 50 20 Z" 
                fill="none" 
                stroke="url(#brainGrad)" 
                strokeWidth="1.5" 
                className="animate-pulse"
              />
              
              {/* Glowing Junction Nodes */}
              <circle cx="50" cy="20" r="2.5" fill="#bd00ff" className="animate-ping" />
              <circle cx="50" cy="20" r="1.5" fill="#bd00ff" />
              
              <circle cx="25" cy="45" r="2" fill="#00f0ff" />
              <circle cx="75" cy="45" r="2" fill="#00f0ff" />
              
              <circle cx="35" cy="35" r="1.5" fill="#00ffd5" />
              <circle cx="65" cy="35" r="1.5" fill="#00ffd5" />
              
              <circle cx="38" cy="64" r="2" fill="#ff0055" />
              <circle cx="62" cy="64" r="2" fill="#ff0055" />
              
              <circle cx="50" cy="50" r="3" fill="#00f0ff" className="animate-pulse" />

              {/* Gradients */}
              <defs>
                <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="50%" stopColor="#bd00ff" />
                  <stop offset="100%" stopColor="#ff0055" />
                </linearGradient>
              </defs>
            </svg>

            {/* Glowing HUD Labels floating around */}
            <div className="absolute top-6 left-6 font-mono text-[9px] text-cyber-blue border border-cyber-blue/30 px-1.5 py-0.5 rounded bg-slate-900/60 uppercase">
              NODE_SYS: ACTV
            </div>
            <div className="absolute bottom-6 right-6 font-mono text-[9px] text-cyber-pink border border-cyber-pink/30 px-1.5 py-0.5 rounded bg-slate-900/60 uppercase">
              LLM_LINK: ENGAGED
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Platform Brief */}
      <div className="w-full max-w-5xl mt-24 text-center space-y-12">
        <div className="space-y-3">
          <h2 className="font-orbitron font-extrabold text-2xl md:text-3xl text-white tracking-wider">
            OPERATION EXAM PROTOCOL
          </h2>
          <div className="w-24 h-0.5 bg-cyber-blue mx-auto neon-text-blue" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="cyber-glass-glow p-6 rounded-2xl border border-cyber-blue/20 text-left space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-cyber-blue/10 border border-cyber-blue/30 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyber-blue" />
            </div>
            <h3 className="font-orbitron text-base font-bold text-slate-100 uppercase tracking-widest">
              1. Custom Test Build
            </h3>
            <p className="font-rajdhani text-sm text-slate-400 leading-relaxed">
              Input any topic name. Pick question count (2, 5, 10, 20), difficulty levels (Easy, Medium, Hard), and marks type. The AI builds a custom exam instantly.
            </p>
          </div>

          <div className="cyber-glass p-6 rounded-2xl border border-slate-800 text-left space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-cyber-pink/10 border border-cyber-pink/30 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-cyber-pink" />
            </div>
            <h3 className="font-orbitron text-base font-bold text-slate-100 uppercase tracking-widest">
              2. Exam Hall Combat
            </h3>
            <p className="font-rajdhani text-sm text-slate-400 leading-relaxed">
              Enter the distraction-free exam portal. Practice writing detailed subjective answers with countdown alerts and real-time autosaving drafts.
            </p>
          </div>

          <div className="cyber-glass p-6 rounded-2xl border border-slate-800 text-left space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-cyber-purple/10 border border-cyber-purple/30 flex items-center justify-center">
              <Layers className="w-5 h-5 text-cyber-purple" />
            </div>
            <h3 className="font-orbitron text-base font-bold text-slate-100 uppercase tracking-widest">
              3. Deep AI Diagnostic
            </h3>
            <p className="font-rajdhani text-sm text-slate-400 leading-relaxed">
              Receive structured grading sheets showing exact matching keywords, explanation quality, missing points, topper answer comparisons, and specific topper writing tips.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
