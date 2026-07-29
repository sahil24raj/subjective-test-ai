'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Question, Test } from '../lib/mockData';
import { QuestionEvaluation } from '../lib/ai';

export interface SavedTestResult {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  mode: string;
  difficulty: string;
  date: string;
  questions: Question[];
  answers: Record<string, string>;
  evaluations: QuestionEvaluation[];
  totalScore: number;
  maxScore: number;
}

export interface AppState {
  testHistory: SavedTestResult[];
  activeTest: Test | null;
  activeTestAnswers: Record<string, string>;
  startNewTest: (test: Test) => void;
  saveAnswerDraft: (questionId: string, answerText: string) => void;
  submitActiveTest: (answers: Record<string, string>, evaluations: QuestionEvaluation[]) => SavedTestResult;
  clearActiveTest: () => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [testHistory, setTestHistory] = useState<SavedTestResult[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('st_history');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [activeTest, setActiveTest] = useState<Test | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('st_active_test');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  const [activeTestAnswers, setActiveTestAnswers] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('st_active_answers');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  // Start a new test session
  const startNewTest = (test: Test) => {
    setActiveTest(test);
    setActiveTestAnswers({});
    localStorage.setItem('st_active_test', JSON.stringify(test));
    localStorage.setItem('st_active_answers', JSON.stringify({}));
  };

  // Save answer draft during exam
  const saveAnswerDraft = (questionId: string, answerText: string) => {
    const updated = {
      ...activeTestAnswers,
      [questionId]: answerText
    };
    setActiveTestAnswers(updated);
    localStorage.setItem('st_active_answers', JSON.stringify(updated));
  };

  // Submit active test
  const submitActiveTest = (answers: Record<string, string>, evaluations: QuestionEvaluation[]): SavedTestResult => {
    if (!activeTest) throw new Error('No active test session to submit');

    let totalScore = 0;
    let maxScore = 0;
    evaluations.forEach(e => {
      totalScore += e.score;
      maxScore += e.maxScore;
    });

    const result: SavedTestResult = {
      id: activeTest.id,
      subjectId: activeTest.subjectId,
      subjectName: activeTest.subjectId.toUpperCase(),
      title: activeTest.title,
      mode: activeTest.mode,
      difficulty: activeTest.difficulty,
      date: new Date().toLocaleString(),
      questions: activeTest.questions,
      answers,
      evaluations,
      totalScore,
      maxScore
    };

    // Save history
    const updatedHistory = [result, ...testHistory];
    setTestHistory(updatedHistory);
    localStorage.setItem('st_history', JSON.stringify(updatedHistory));

    return result;
  };

  // Clear active test session draft
  const clearActiveTest = () => {
    setActiveTest(null);
    setActiveTestAnswers({});
    localStorage.removeItem('st_active_test');
    localStorage.removeItem('st_active_answers');
  };

  return (
    <AppStateContext.Provider value={{
      testHistory,
      activeTest,
      activeTestAnswers,
      startNewTest,
      saveAnswerDraft,
      submitActiveTest,
      clearActiveTest
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
