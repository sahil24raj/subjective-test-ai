'use client';

import React from 'react';
import Link from 'next/link';
import { useAppState } from '../../context/AppStateContext';
import { Clock, ChevronRight, FileText } from 'lucide-react';

export default function HistoryPage() {
  const { testHistory } = useAppState();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-4">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-cyan-500/10 pb-4">
        <Clock className="w-7 h-7 text-cyber-blue animate-pulse" />
        <div className="flex flex-col">
          <h1 className="font-orbitron font-black text-2xl text-white tracking-widest uppercase">
            Test History Log
          </h1>
          <span className="font-rajdhani text-xs text-slate-500 font-bold uppercase tracking-wider">
            Review your past mock tests and diagnostic evaluations
          </span>
        </div>
      </div>

      {/* History List */}
      {testHistory.length > 0 ? (
        <div className="cyber-glass rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-850 shadow-2xl">
          {testHistory.map((test) => {
            const scorePct = Math.round((test.totalScore / (test.maxScore || 1)) * 100);
            return (
              <div
                key={test.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-slate-900/30 transition-colors"
              >
                <div className="flex flex-col space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] font-bold text-cyber-purple bg-cyber-purple/5 border border-cyber-purple/20 px-1.5 py-0.2 rounded uppercase">
                      {test.mode}
                    </span>
                    <span className="font-rajdhani text-xs text-slate-500 font-semibold">{test.date}</span>
                  </div>
                  <span className="font-orbitron text-sm font-bold text-slate-200 tracking-wide uppercase line-clamp-1">
                    {test.title}
                  </span>
                </div>

                {/* Right scores details */}
                <div className="flex items-center justify-between sm:justify-end gap-6 mt-3 sm:mt-0">
                  
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-sm font-black text-cyber-blue neon-text-blue">
                      {test.totalScore} / {test.maxScore} M
                    </span>
                    <span className="font-rajdhani text-[10px] font-bold text-slate-500 uppercase">Grade: {scorePct}%</span>
                  </div>

                  <Link
                    href={`/results/${test.id}`}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-slate-800 hover:border-cyber-blue/30 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-cyber-blue transition-colors cursor-pointer"
                  >
                    View Scorecard <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full text-center py-16 rounded-2xl border border-slate-800 bg-slate-950/20 shadow-inner flex flex-col items-center justify-center space-y-3">
          <FileText className="w-10 h-10 text-slate-700 animate-pulse" />
          <h3 className="font-orbitron text-xs font-bold text-slate-500 uppercase tracking-widest">
            No evaluations scanned
          </h3>
          <p className="font-rajdhani text-sm text-slate-500 max-w-sm">
            You haven\'t completed any Subjective AI tests yet. Launch the builder to generate your first paper.
          </p>
          <Link
            href="/generator"
            className="mt-2 inline-block px-4 py-2 rounded-xl bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue font-orbitron text-[10px] font-extrabold uppercase tracking-widest hover:bg-cyber-blue hover:text-slate-950 transition-colors"
          >
            Launch Builder
          </Link>
        </div>
      )}

    </div>
  );
}
