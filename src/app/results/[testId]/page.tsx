'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppState } from '../../../context/AppStateContext';
import { SavedTestResult } from '../../../context/AppStateContext';
import { Award, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, Star, Download, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { testHistory } = useAppState();

  const testId = params.testId as string;
  const [result, setResult] = useState<SavedTestResult | null>(null);
  const [activeQIdx, setActiveQIdx] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // Retrieve test from history
  useEffect(() => {
    const found = testHistory.find(h => h.id === testId);
    if (found) {
      setResult(found);
      
      // Trigger confetti if score is high (>= 75%)
      const scorePct = (found.totalScore / (found.maxScore || 1)) * 100;
      if (scorePct >= 75) {
        triggerSuccessConfetti();
      }
    }
  }, [testHistory, testId]);

  const triggerSuccessConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00f0ff', '#bd00ff', '#ff0055']
    });
  };

  const handleExportPDF = () => {
    if (!result) return;
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`[AI Report Downloader]:\nPDF transcript generated for "${result.title}". File saved to Downloads.`);
    }, 1500);
  };

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-cyber-blue animate-spin" />
        <span className="font-mono text-xs text-slate-500 uppercase">Scanning mainframe for evaluation data...</span>
      </div>
    );
  }

  const scorePct = Math.round((result.totalScore / (result.maxScore || 1)) * 100);
  const activeQ = result.questions[activeQIdx];
  const activeEval = result.evaluations.find(e => e.questionId === activeQ.id) || {
    score: 0,
    maxScore: activeQ.marks,
    expectedAnswer: activeQ.expectedAnswer,
    topperAnswer: activeQ.topperAnswer,
    missingPoints: ['No assessment logs found.'],
    feedback: 'Assessment unavailable.'
  };

  // Checklist criteria for the active question
  const criteria = [
    { name: 'Concept Accuracy', passed: activeEval.score / activeEval.maxScore >= 0.7 },
    { name: 'Keywords Presence', passed: activeEval.missingPoints.filter(m => m.includes('keyword')).length === 0 },
    { name: 'Explanation Quality', passed: activeEval.score / activeEval.maxScore >= 0.5 },
    { name: 'Structure & Layout', passed: !activeEval.missingPoints.some(m => m.toLowerCase().includes('structure')) },
    { name: 'Completeness', passed: activeEval.score / activeEval.maxScore >= 0.6 }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-4">
      
      {/* Header Back Link */}
      <div className="flex items-center justify-between gap-4 border-b border-cyan-500/10 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/history"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </Link>
          <div className="flex flex-col">
            <h1 className="font-orbitron font-black text-xl text-white uppercase tracking-wider">
              AI Evaluation Scorecard
            </h1>
            <span className="font-rajdhani text-xs text-slate-500 font-bold uppercase tracking-wider">
              {result.title} • {result.date}
            </span>
          </div>
        </div>

        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyber-teal/30 bg-cyber-teal/5 text-xs text-cyber-teal hover:bg-cyber-teal/15 hover:border-cyber-teal font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" /> {isExporting ? 'Downloading...' : 'Export PDF Report'}
        </button>
      </div>

      {/* 2. Score Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* Score Dial (5 columns) */}
        <div className="md:col-span-5 flex justify-center">
          <div className="w-52 h-52 rounded-full bg-slate-950/40 border border-cyan-500/10 flex flex-col items-center justify-center text-center relative shadow-2xl">
            {/* Pulsing glow circle */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-cyber-blue/5 to-cyber-purple/5 blur-lg" />
            
            <span className="font-mono text-[9px] text-slate-500 font-bold uppercase tracking-widest">
              Aggregate Score
            </span>
            <span className="font-orbitron font-black text-5xl text-white mt-1 neon-text-blue">
              {result.totalScore}
            </span>
            <span className="w-16 h-[1px] bg-slate-800 my-1.5" />
            <span className="font-mono text-xs text-cyber-blue font-bold uppercase tracking-wider">
              OUT OF {result.maxScore} MARKS
            </span>
            
            <div className="absolute -bottom-2 px-3 py-0.5 rounded bg-cyber-blue text-[#050816] font-orbitron font-extrabold text-[9px] tracking-widest uppercase shadow-md">
              GRADE: {scorePct}%
            </div>
          </div>
        </div>

        {/* Diagnosis overview card (7 columns) */}
        <div className="md:col-span-7 space-y-4">
          <div className="cyber-glass-glow rounded-3xl border border-cyber-blue/30 p-6 flex items-start gap-4 shadow-xl">
            <div className="p-3 bg-cyber-blue/10 rounded-2xl border border-cyber-blue/30 shrink-0">
              <Award className="w-8 h-8 text-cyber-blue" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-orbitron text-sm font-extrabold text-white tracking-widest uppercase">
                Assessment Decrypted
              </h3>
              <p className="font-rajdhani text-sm text-slate-400 leading-relaxed">
                You have received an aggregate grade of <span className="text-cyber-teal font-bold">{scorePct}%</span>. The AI Examiner has evaluated your answer transcripts against standard grading parameters: keywords presence, conceptual correctness, and logical layout structure.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Detailed Answers Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Question Selector Tabs (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <span className="font-orbitron text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
            Question breakdown
          </span>
          {result.questions.map((q, idx) => {
            const evalObj = result.evaluations.find(e => e.questionId === q.id) || { score: 0, maxScore: q.marks };
            const isActive = idx === activeQIdx;
            return (
              <button
                key={q.id}
                onClick={() => setActiveQIdx(idx)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isActive
                    ? 'border-cyber-blue/80 bg-cyber-blue/10 text-cyber-blue shadow-[0_0_8px_rgba(0,240,255,0.1)]'
                    : 'border-slate-800 bg-[#030614] hover:bg-[#070b22] text-slate-400'
                }`}
              >
                <span className="font-orbitron text-xs font-bold uppercase tracking-wider">
                  Question {idx + 1}
                </span>
                <span className="font-mono text-xs font-bold">
                  {evalObj.score}/{evalObj.maxScore} M
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Active Answer Diagnostic details (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Question specs box */}
          <div className="cyber-glass rounded-2xl border border-slate-800 p-5 space-y-3 shadow-lg">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider border-b border-slate-800 pb-2">
              <span className="text-cyber-purple">Question {activeQIdx + 1} Transcript</span>
              <span className="text-cyber-teal">Score: {activeEval.score} / {activeEval.maxScore} Marks</span>
            </div>
            
            <p className="font-rajdhani text-sm font-semibold text-slate-200 leading-relaxed">
              {activeQ.text}
            </p>

            {/* Critique checklist */}
            <div className="pt-2 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-800/50">
              {criteria.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <CheckCircle2 className={`w-4 h-4 ${c.passed ? 'text-cyber-green' : 'text-slate-700'}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${c.passed ? 'text-slate-300' : 'text-slate-500'}`}>
                    {c.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Answer comparisons cards (Student vs Model vs Topper) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Student Answer */}
            <div className="cyber-glass rounded-xl border border-slate-800 p-4 space-y-2">
              <div className="font-orbitron text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800/50 pb-1.5">
                Your Answer Submission
              </div>
              <p className="font-mono text-[11px] text-slate-300 leading-relaxed max-h-[160px] overflow-y-auto pr-1">
                {result.answers[activeQ.id] || 'Unanswered.'}
              </p>
            </div>

            {/* Missing points alerts */}
            <div className="cyber-glass border border-cyber-pink/20 rounded-xl p-4 space-y-2">
              <div className="font-orbitron text-[10px] font-bold text-cyber-pink uppercase tracking-widest border-b border-cyber-pink/20 pb-1.5">
                AI Scanned Missing Points
              </div>
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {activeEval.missingPoints.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-300 leading-relaxed font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 text-cyber-pink shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
                {activeEval.missingPoints.length === 0 && (
                  <div className="text-center py-4 text-xs text-slate-500">
                    Concept accuracy is 100%! No missing key terms found.
                  </div>
                )}
              </div>
            </div>

            {/* Expected Model Answer */}
            <div className="cyber-glass rounded-xl border border-slate-800 p-4 space-y-2">
              <div className="font-orbitron text-[10px] font-bold text-cyber-teal uppercase tracking-widest border-b border-slate-800/50 pb-1.5">
                Expected Model Answer
              </div>
              <p className="font-rajdhani text-xs font-semibold text-slate-400 leading-relaxed max-h-[160px] overflow-y-auto pr-1">
                {activeEval.expectedAnswer}
              </p>
            </div>

            {/* Topper Answer (Gold bordered) */}
            <div className="bg-[#0b0f22] border border-amber-500/20 rounded-xl p-4 space-y-2 shadow-[0_0_12px_rgba(245,158,11,0.03)]">
              <div className="font-orbitron text-[10px] font-extrabold text-amber-400 uppercase tracking-widest border-b border-amber-500/20 pb-1.5 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" /> Gold Standard Topper Answer
              </div>
              <p className="font-rajdhani text-xs font-semibold text-amber-200/90 leading-relaxed max-h-[160px] overflow-y-auto pr-1">
                {activeEval.topperAnswer}
              </p>
            </div>

          </div>

          {/* AI Feedback description box */}
          <div className="cyber-glass border border-cyber-blue/15 rounded-xl p-4.5 space-y-1.5 shadow-md">
            <span className="font-orbitron text-[10px] font-bold text-cyber-blue uppercase tracking-widest">
              AI Tutor Feedback
            </span>
            <p className="font-rajdhani text-sm font-semibold text-slate-200 leading-relaxed">
              {activeEval.feedback}
            </p>
          </div>

          {/* 🌟 NEW: Topper Answer Writing Tips (Premium SaaS Feature) 🌟 */}
          <div className="bg-gradient-to-br from-[#0c122b] to-[#04081c] border border-amber-500/30 rounded-2xl p-6 space-y-4 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
            <div className="flex items-center gap-2 border-b border-amber-500/20 pb-3">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <h3 className="font-orbitron text-sm font-black text-amber-400 uppercase tracking-wider">
                Tips to Write Answer Like a Topper
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-rajdhani">
              
              {/* Tip 1: Underlining/Bolding Keywords */}
              <div className="space-y-1">
                <h4 className="font-orbitron text-[10px] font-bold text-amber-200 uppercase tracking-widest">
                  1. Highlight Key Terminology
                </h4>
                <p className="text-slate-400 leading-relaxed font-semibold">
                  Always underline or **bold** crucial technical terms (e.g. {activeQ.expectedKeywords.slice(0, 3).map(k => `"${k}"`).join(', ')}). Examiners check copy in 2-3 minutes; highlighting ensures they spot the keywords instantly and award full marks.
                </p>
              </div>

              {/* Tip 2: Layout & Structure */}
              <div className="space-y-1">
                <h4 className="font-orbitron text-[10px] font-bold text-amber-200 uppercase tracking-widest">
                  2. Adopt a structured 3-part layout
                </h4>
                <p className="text-slate-400 leading-relaxed font-semibold">
                  Never write a single long paragraph. Break it down:
                  <br />• **Introduction**: 1-2 sentence formal definition.
                  <br />• **Core Body**: Use bullet points (not paragraphs) for characteristics/types.
                  <br />• **Application**: Conclude with a real-world scenario.
                </p>
              </div>

              {/* Tip 3: Formulas & Diagrams */}
              <div className="space-y-1">
                <h4 className="font-orbitron text-[10px] font-bold text-amber-200 uppercase tracking-widest">
                  3. Include visual proofs (Diagrams/Formulas)
                </h4>
                <p className="text-slate-400 leading-relaxed font-semibold">
                  For subjective papers, draw raw block diagrams, flowchart transitions, or write mathematical formulations. Visual diagrams occupy space neatly and act as immediate proof of your technical depth.
                </p>
              </div>

              {/* Tip 4: Practical Examples citation */}
              <div className="space-y-1">
                <h4 className="font-orbitron text-[10px] font-bold text-amber-200 uppercase tracking-widest">
                  4. Cite clear real-world examples
                </h4>
                <p className="text-slate-400 leading-relaxed font-semibold">
                  For every explanation, reserve a separate line: **"Example: ..."** (e.g. Dining Philosophers for deadlocks, or routing in maps for A*). Concrete examples demonstrate that you understand the practical application rather than just memorized theory.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
