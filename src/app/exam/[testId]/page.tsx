'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppState } from '../../../context/AppStateContext';
import { AIHelper } from '../../../lib/ai';
import { Clock, ShieldAlert, Sparkles, Terminal, FileText, ChevronLeft, ChevronRight, CheckSquare, Eye } from 'lucide-react';

export default function ExamHall() {
  const params = useParams();
  const router = useRouter();
  const { activeTest, activeTestAnswers, saveAnswerDraft, submitActiveTest } = useAppState();

  const testId = params.testId as string;

  // Active question state
  const [activeQIndex, setActiveQIndex] = useState(0);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Autosave notification state
  const [autosaveText, setAutosaveText] = useState('Draft Synced');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generationSteps = [
    'Initializing AI Professor engine...',
    'Analyzing uploaded syllabus PDF / custom concept topic...',
    'Locating matching concept nodes in the knowledge database...',
    'Applying university exam formatting protocols...',
    'Structuring subjective questions and compiling grading criteria...',
    'Finalizing exam room environment...'
  ];

  // If no active test is found in context, redirect back to generator
  useEffect(() => {
    if (isSubmitting) return;
    if (!activeTest || activeTest.id !== testId) {
      router.push('/generator');
      return;
    }
    setTimeLeft(activeTest.durationMinutes * 60);
  }, [activeTest, testId, router, isSubmitting]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  if (isSubmitting) {
    return (
      <div className="fixed inset-0 z-50 bg-[#050816]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 scanlines">
        <div className="w-full max-w-md p-6 rounded-3xl border border-cyber-blue/30 bg-[#060a22]/70 shadow-[0_0_40px_rgba(0,240,255,0.2)] flex flex-col space-y-6">
          <div className="flex items-center justify-between border-b border-cyber-blue/20 pb-3">
            <span className="font-mono text-xs text-cyber-blue flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyber-blue animate-pulse" /> EXAM EVALUATOR mainframe
            </span>
            <span className="font-mono text-[10px] text-slate-500 font-black">ACTIVE EVALUATION</span>
          </div>

          <div className="relative h-20 w-20 mx-auto bg-cyber-pink/5 rounded-full border border-cyber-pink/20 flex items-center justify-center animate-pulse">
            <ShieldAlert className="w-10 h-10 text-cyber-pink animate-ping" />
          </div>

          <div className="space-y-2 text-center">
            <div className="font-orbitron text-xs text-slate-400 uppercase tracking-widest">
              AI Grading Protocol
            </div>
            <div className="font-mono text-sm text-cyber-pink h-12 flex items-center justify-center px-4">
              Scanning answer transcripts for keyword accuracy and explanations quality...
            </div>
          </div>

          <div className="w-full h-1 bg-[#02040c] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyber-pink via-cyber-purple to-cyber-blue animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!activeTest) return null;

  const currentQuestion = activeTest.questions[activeQIndex];
  const currentAnswer = activeTestAnswers[currentQuestion.id] || '';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAutosaveText('Autosaving...');
    saveAnswerDraft(currentQuestion.id, e.target.value);
    
    // Simulate autosave response delay
    setTimeout(() => {
      setAutosaveText('Draft Synced Offline');
    }, 800);
  };

  const handleAutoSubmit = async () => {
    console.log('Timer expired! Triggering auto-submit protocol.');
    await executeSubmission();
  };

  const executeSubmission = async () => {
    setIsSubmitting(true);
    try {
      // Evaluate answers using AIHelper
      const evaluationResults = await AIHelper.evaluateAnswers(
        activeTest.questions,
        activeTestAnswers
      );
      
      // Submit in global state (this clears active test, returns result payload)
      const result = submitActiveTest(activeTestAnswers, evaluationResults);
      
      // Redirect to results
      router.push(`/results/${result.id}`);
    } catch (e) {
      console.error('Submission failed', e);
      setIsSubmitting(false);
    }
  };

  const handleSubmitClick = () => {
    if (confirm('Are you sure you want to submit your test paper for AI evaluation? Once submitted, you cannot change your answers.')) {
      executeSubmission();
    }
  };

  // Local AI Hint logic
  const handleRequestHint = () => {
    const hints: Record<string, string> = {
      ai_1: 'Contrast heuristic function h(n) inside A* with blind node queue mapping in BFS/DFS. Mention goal distance estimates.',
      ai_2: 'Focus on Alan Turing\'s Imitation Game definition. Cite John Searle\'s Chinese Room syntactic limitations.',
      ai_3: 'State alpha as MAX\'s guaranteed floor, beta as MIN\'s ceiling. Write the condition: alpha >= beta triggers cut-off.',
      os_1: 'Coffman Conditions: 1. Mutual Exclusion, 2. Hold & Wait, 3. No Preemption, 4. Circular Wait.',
      os_2: 'Continuous page-fault frequency due to aggregate working set size exceeding physical frame limits.'
    };
    const hint = hints[currentQuestion.id] || 'Explain the conceptual definition, list 2 key components, and give a short real-world scenario example.';
    alert(`[AI Mentor Hint]:\n${hint}`);
  };

  // Fullscreen styling override if checked
  const mainStyleClass = fullscreenMode 
    ? 'fixed inset-0 z-50 bg-[#050816] p-6 flex flex-col justify-between scanlines'
    : 'w-full max-w-6xl mx-auto space-y-6';

  return (
    <div className={mainStyleClass}>
      


      {/* Header Info row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/10 pb-4">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-cyber-blue" />
          <div className="flex flex-col">
            <h1 className="font-orbitron font-extrabold text-lg text-white uppercase tracking-wider">
              {activeTest.title}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-[10px] text-slate-500 font-bold uppercase">
                Difficulty: {activeTest.difficulty}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span className="font-mono text-[10px] text-slate-500 font-bold uppercase">
                Mode: {activeTest.mode}
              </span>
            </div>
          </div>
        </div>

        {/* Timers & Fullscreen hud */}
        <div className="flex items-center gap-4">
          
          {/* Draft indicator */}
          <span className="font-mono text-[10px] text-slate-500 font-bold uppercase border border-slate-800 bg-[#02040c] px-2.5 py-1 rounded-lg">
            {autosaveText}
          </span>

          {/* Countdown timer */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
            timeLeft < 60 
              ? 'bg-cyber-pink/15 border-cyber-pink/40 animate-pulse text-cyber-pink shadow-[0_0_10px_rgba(255,0,85,0.2)]'
              : 'bg-cyber-blue/15 border-cyber-blue/40 text-cyber-blue'
          }`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono text-sm font-black tracking-widest">{formatTime(timeLeft)}</span>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={() => setFullscreenMode(!fullscreenMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/40 text-xs text-slate-300 hover:text-white hover:border-slate-700 font-bold uppercase tracking-wider cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> {fullscreenMode ? 'Minimize HUD' : 'Fullscreen'}
          </button>
        </div>
      </div>

      {/* Main Grid: Question Board & Writing Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch min-h-[400px]">
        
        {/* Left Column: Questions tracker & navigation (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="cyber-glass rounded-2xl border border-slate-800 p-5 flex flex-col justify-between flex-1">
            <div className="space-y-4">
              <span className="font-orbitron text-xs font-bold text-slate-400 uppercase tracking-widest">
                Mission Questions
              </span>
              
              {/* Grid buttons list */}
              <div className="grid grid-cols-4 gap-2.5">
                {activeTest.questions.map((q, idx) => {
                  const hasAnswer = (activeTestAnswers[q.id]?.trim()?.length || 0) > 0;
                  const isActive = idx === activeQIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setActiveQIndex(idx)}
                      className={`h-11 rounded-xl font-orbitron font-extrabold text-xs transition-all cursor-pointer border ${
                        isActive
                          ? 'border-cyber-blue/80 bg-cyber-blue/10 text-cyber-blue neon-text-blue shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                          : hasAnswer
                          ? 'border-cyber-teal/30 bg-[#090f2b] text-cyber-teal'
                          : 'border-slate-800 bg-[#030614] text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Q{idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Active question specs */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 space-y-3 mt-4">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-cyber-purple">Question {activeQIndex + 1} of {activeTest.questions.length}</span>
                  <span className="text-cyber-teal">{currentQuestion.marks} Marks</span>
                </div>
                <div className="font-rajdhani text-sm font-semibold text-slate-200 leading-relaxed">
                  {currentQuestion.text}
                </div>
              </div>
            </div>

            {/* Test submission footer */}
            <div className="pt-4 border-t border-slate-800/50">
              <button
                onClick={handleSubmitClick}
                className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-gradient-to-r from-cyber-pink to-cyber-purple hover:from-cyber-purple hover:to-cyber-pink text-white font-orbitron font-black tracking-widest text-[11px] uppercase transition-all duration-300 transform hover:scale-[1.01] shadow-[0_0_15px_rgba(255,0,85,0.15)] cursor-pointer"
              >
                <CheckSquare className="w-4 h-4" /> Submit Exam Paper
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Writing Editor Panel (8 cols) */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="cyber-glass rounded-2xl border border-slate-800 flex-1 flex flex-col overflow-hidden">
            
            {/* Editor Header panel */}
            <div className="px-4 py-2.5 bg-[#02040d] border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-500 font-bold uppercase">CYBERPUNK EDITOR CORE</span>
              
              <div className="flex items-center gap-3">
                {/* AI Hint button */}
                <button
                  type="button"
                  onClick={handleRequestHint}
                  className="font-mono text-[9px] font-bold text-cyber-blue bg-cyber-blue/5 border border-cyber-blue/20 px-2 py-0.5 rounded hover:bg-cyber-blue hover:text-[#050816] transition-colors cursor-pointer"
                >
                  REQUEST AI HINT
                </button>
                <span className="font-mono text-slate-500 font-bold uppercase">{currentAnswer.split(' ').filter(Boolean).length} WORDS</span>
              </div>
            </div>

            {/* Main Textarea */}
            <textarea
              value={currentAnswer}
              onChange={handleTextChange}
              placeholder="Transmit your subjective academic explanation here. Use formal terminology, list concepts clearly, and provide examples where necessary..."
              className="flex-1 w-full bg-[#030614]/25 p-5 focus:outline-none text-slate-300 font-mono text-sm leading-relaxed resize-none placeholder:text-slate-700"
            />

            {/* Slider Navigation footer */}
            <div className="px-4 py-3 bg-[#02040d] border-t border-slate-800 flex items-center justify-between">
              <button
                disabled={activeQIndex === 0}
                onClick={() => setActiveQIndex(prev => prev - 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-[#050816] text-xs font-bold uppercase text-slate-400 disabled:opacity-30 disabled:pointer-events-none hover:text-white hover:border-slate-700 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <span className="font-orbitron text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Q{activeQIndex + 1} EDITING
              </span>

              <button
                disabled={activeQIndex === activeTest.questions.length - 1}
                onClick={() => setActiveQIndex(prev => prev + 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-[#050816] text-xs font-bold uppercase text-slate-400 disabled:opacity-30 disabled:pointer-events-none hover:text-white hover:border-slate-700 cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
