'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Question, Test } from '../lib/mockData';
import { QuestionEvaluation } from '../lib/ai';

export interface User {
  name: string;
  username: string;
  email: string;
  avatar: string;
  collegeName: string;
  course: string;
  department: string;
  xp: number;
  level: string;
  streak: number;
  isProfileComplete?: boolean;
}

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
  user: User | null;
  testHistory: SavedTestResult[];
  activeTest: Test | null;
  activeTestAnswers: Record<string, string>;
  loginWithGoogle: () => void;
  updateProfile: (updatedData: Partial<User>) => void;
  logout: () => void;
  startNewTest: (test: Test) => void;
  saveAnswerDraft: (questionId: string, answerText: string) => void;
  submitActiveTest: (answers: Record<string, string>, evaluations: QuestionEvaluation[]) => SavedTestResult;
  clearActiveTest: () => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('st_user');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

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

  const loginWithGoogle = () => {
    // Read saved college info if user previously filled it on generator page
    const savedCollege = (typeof window !== 'undefined' && localStorage.getItem('study_buddy_collegeName')) || 'IIT Delhi';
    const savedCourse = (typeof window !== 'undefined' && localStorage.getItem('study_buddy_course')) || 'B.Tech CSE';
    const savedDept = (typeof window !== 'undefined' && localStorage.getItem('study_buddy_subject')) || 'Computer Science';

    const mockUser: User = {
      name: 'Sahil Raj',
      username: 'sahil_raj24',
      email: 'sahil.raj@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      collegeName: savedCollege,
      course: savedCourse,
      department: savedDept,
      xp: 780,
      level: 'AI Apprentice',
      streak: 5,
      isProfileComplete: false
    };
    setUser(mockUser);
    localStorage.setItem('st_user', JSON.stringify(mockUser));
  };

  const updateProfile = (updatedData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedData };
      localStorage.setItem('st_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('st_user');
  };

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
      user,
      testHistory,
      activeTest,
      activeTestAnswers,
      loginWithGoogle,
      updateProfile,
      logout,
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
