'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppState } from '../../context/AppStateContext';
import { AIHelper } from '../../lib/ai';
import { Cpu, Settings2, Sparkles, Terminal } from 'lucide-react';

function GeneratorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startNewTest } = useAppState();

  // URL query pre-population
  const queryTopic = searchParams.get('topic') || '';

  // Form states
  const [topic, setTopic] = useState(queryTopic);
  const [questionCount, setQuestionCount] = useState<number>(2);
  const [questionType, setQuestionType] = useState<'very-short' | 'short' | 'long' | 'mixed'>('mixed');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [examMode, setExamMode] = useState<'Unit Test' | 'Mid Semester' | 'End Semester' | 'Viva Practice'>('Unit Test');
  
  // AI Generation animation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);

  const generationSteps = [
    'Initializing AI Professor engine...',
    'Analyzing target exam topic specifications...',
    'Locating matching concept nodes in the knowledge database...',
    'Applying university exam formatting protocols...',
    'Structuring subjective questions and compiling grading criteria...',
    'Finalizing exam room environment...'
  ];

  // If query changes, update states
  useEffect(() => {
    if (queryTopic) setTopic(queryTopic);
  }, [queryTopic]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert('Please enter a subject or topic name.');
      return;
    }

    setIsGenerating(true);
    setGenStep(0);

    // Run steps animation
    const stepInterval = setInterval(() => {
      setGenStep(prev => {
        if (prev >= generationSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    try {
      // Call AI Helper
      const generatedQuestions = await AIHelper.generateQuestions(
        'general',
        topic,
        questionCount,
        questionType,
        difficulty,
        examMode
      );

      // Create test package
      const testId = `test_${Date.now()}`;
      const newTest = {
        id: testId,
        subjectId: 'general',
        title: `${examMode} - ${topic} Module`,
        mode: examMode,
        difficulty: difficulty,
        durationMinutes: questionCount * (questionType === 'very-short' ? 3 : questionType === 'short' ? 6 : 12),
        xpReward: questionCount * 15,
        questions: generatedQuestions
      };

      clearInterval(stepInterval);
      
      // Save test into AppState context and redirect
      startNewTest(newTest);
      router.push(`/exam/${testId}`);
      
    } catch (error) {
      console.error(error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 py-4">
      
      {/* Header Title */}
      <div className="flex items-center gap-3 border-b border-cyan-500/10 pb-4">
        <Cpu className="w-7 h-7 text-cyber-blue animate-pulse" />
        <div className="flex flex-col">
          <h1 className="font-orbitron font-black text-2xl text-white tracking-widest uppercase">
            AI Test Builder
          </h1>
          <span className="font-rajdhani text-xs text-slate-500 font-bold uppercase tracking-wider">
            Configure topic and deploy subjective exam paper
          </span>
        </div>
      </div>

      {/* Generation Scan Overlay Screen */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 bg-[#050816]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 scanlines">
          <div className="w-full max-w-lg p-6 rounded-3xl border border-cyber-blue/30 bg-[#060a22]/70 shadow-[0_0_40px_rgba(0,240,255,0.2)] flex flex-col space-y-6">
            <div className="flex items-center justify-between border-b border-cyber-blue/20 pb-3">
              <span className="font-mono text-xs text-cyber-blue flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyber-blue animate-pulse" /> AI PROCESSOR TERMINAL
              </span>
              <span className="font-mono text-[10px] text-slate-500 font-bold">STATUS: RUNNING</span>
            </div>

            {/* Scanning graphic */}
            <div className="relative h-20 w-20 mx-auto bg-cyber-blue/5 rounded-full border border-cyber-blue/20 flex items-center justify-center animate-pulse">
              <Cpu className="w-10 h-10 text-cyber-blue animate-spin" style={{ animationDuration: '6s' }} />
              <div className="absolute inset-0 rounded-full border border-cyber-blue/40 animate-ping opacity-30" />
            </div>

            {/* Steps text */}
            <div className="space-y-2">
              <div className="font-orbitron text-xs text-slate-400 text-center uppercase tracking-widest">
                Compiling Exam Paper
              </div>
              <div className="font-mono text-sm text-cyber-teal text-center h-12 flex items-center justify-center leading-relaxed">
                {generationSteps[genStep]}
              </div>
            </div>

            {/* Progress lines */}
            <div className="w-full h-1 bg-[#02040c] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyber-blue via-cyber-teal to-cyber-purple shadow-[0_0_8px_#00f0ff]"
                style={{ width: `${((genStep + 1) / generationSteps.length) * 100}%`, transition: 'width 1.2s ease-in-out' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Build Form */}
      <form onSubmit={handleGenerate} className="space-y-6">
        
        <div className="cyber-glass rounded-2xl border border-slate-800 p-6 space-y-5">
          <h2 className="font-orbitron text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Settings2 className="w-4 h-4 text-cyber-blue" /> Config Exam Engine
          </h2>

          {/* Custom Topic Input */}
          <div className="flex flex-col space-y-1.5">
            <label className="font-rajdhani text-xs font-bold text-slate-400 uppercase tracking-widest">
              Exam Subject or Topic Name
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Operating Systems, DFS Traversals, Normalization..."
              className="bg-[#090f2b] border border-slate-800 focus:border-cyber-blue/50 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none placeholder:text-slate-650 font-mono"
            />
            <span className="font-rajdhani text-[11px] text-slate-500 leading-normal">
              Type the subject or specific chapter topic you want the AI to base questions on.
            </span>
          </div>

          {/* Settings parameters Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Question Count */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-rajdhani text-xs font-bold text-slate-400 uppercase tracking-widest">
                Question Count
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="bg-[#090f2b] border border-slate-800 focus:border-cyber-blue/50 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none font-bold cursor-pointer"
              >
                <option value={2}>2 Questions (Quick Mock)</option>
                <option value={5}>5 Questions (Standard)</option>
                <option value={10}>10 Questions (Mid-Sem)</option>
                <option value={20}>20 Questions (Final Prep)</option>
              </select>
            </div>

            {/* Question Type */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-rajdhani text-xs font-bold text-slate-400 uppercase tracking-widest">
                Question Type
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as any)}
                className="bg-[#090f2b] border border-slate-800 focus:border-cyber-blue/50 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none font-bold cursor-pointer"
              >
                <option value="very-short">Very Short (2 Marks)</option>
                <option value="short">Short (5 Marks)</option>
                <option value="long">Long (10 Marks)</option>
                <option value="mixed">Mixed Types</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-rajdhani text-xs font-bold text-slate-400 uppercase tracking-widest">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="bg-[#090f2b] border border-slate-800 focus:border-cyber-blue/50 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none font-bold cursor-pointer"
              >
                <option value="Easy">Easy (Conceptual)</option>
                <option value="Medium">Medium (Balanced)</option>
                <option value="Hard">Hard (Expert Proofs)</option>
              </select>
            </div>

            {/* Exam Mode */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-rajdhani text-xs font-bold text-slate-400 uppercase tracking-widest">
                Exam Mode Context
              </label>
              <select
                value={examMode}
                onChange={(e) => setExamMode(e.target.value as any)}
                className="bg-[#090f2b] border border-slate-800 focus:border-cyber-blue/50 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none font-bold cursor-pointer"
              >
                <option value="Unit Test">Unit Test (Classroom)</option>
                <option value="Mid Semester">Mid Semester (30%)</option>
                <option value="End Semester">End Semester (70%)</option>
                <option value="Viva Practice">Viva Practice (Oral Quiz)</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] font-bold text-cyber-blue/80 uppercase tracking-widest bg-cyber-blue/5 border border-cyber-blue/25 rounded-lg p-2.5">
            <Sparkles className="w-3.5 h-3.5 text-cyber-blue shrink-0 animate-pulse" /> AI will compose dynamic academic questions matching topic guidelines
          </div>

          {/* Generate Trigger Button */}
          <button
            type="submit"
            className="w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-cyber-blue to-cyber-teal hover:from-cyber-teal hover:to-cyber-blue text-[#050816] font-orbitron font-extrabold tracking-widest text-xs uppercase transition-all duration-300 transform hover:scale-[1.01] shadow-[0_0_20px_rgba(0,240,255,0.25)] cursor-pointer"
          >
            Generate Subjective Test Paper
          </button>
        </div>

      </form>
    </div>
  );
}

export default function Generator() {
  return (
    <Suspense fallback={<div className="text-center py-20 font-mono text-xs text-slate-500 uppercase tracking-widest animate-pulse">Loading Generator mainframe...</div>}>
      <GeneratorForm />
    </Suspense>
  );
}
