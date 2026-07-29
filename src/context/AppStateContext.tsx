'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Question, Test } from '../lib/mockData';
import { QuestionEvaluation } from '../lib/ai';

export interface User {
  id?: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  collegeName: string;
  course: string;
  department: string;
  subjects: string[];
  xp: number;
  level: string;
  streak: number;
  testsCompleted?: number;
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
  userDirectory: User[];
  customFriends: string[];
  testHistory: SavedTestResult[];
  activeTest: Test | null;
  activeTestAnswers: Record<string, string>;
  loginWithGoogle: (customEmail?: string) => void;
  updateProfile: (updatedData: Partial<User>) => void;
  addFriendByUsername: (username: string) => { success: boolean; message: string };
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
        const saved = localStorage.getItem('st_saved_profile') || localStorage.getItem('st_user');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  // Multi-user directory state
  const [userDirectory, setUserDirectory] = useState<User[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('st_user_directory');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Custom added friends list (by username)
  const [customFriends, setCustomFriends] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('st_custom_friends');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
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

  // Save account to global user directory
  const saveToDirectory = (userData: User) => {
    setUserDirectory(prev => {
      const filtered = prev.filter(u => u.email !== userData.email && u.username !== userData.username);
      const updated = [userData, ...filtered];
      if (typeof window !== 'undefined') {
        localStorage.setItem('st_user_directory', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const loginWithGoogle = (customEmail?: string) => {
    const targetEmail = customEmail || 'sahil.raj@gmail.com';

    // Check if account already exists in userDirectory
    const existingInDir = userDirectory.find(u => u.email === targetEmail);

    let savedProfile: Partial<User> | null = existingInDir || null;
    if (!savedProfile && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`st_profile_${targetEmail}`);
        if (saved) savedProfile = JSON.parse(saved);
      } catch (e) {}
    }

    const defaultUsername = targetEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    const defaultName = defaultUsername.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

    const loggedUser: User = {
      id: savedProfile?.id || `usr_${Date.now()}`,
      name: savedProfile?.name || defaultName,
      username: savedProfile?.username || defaultUsername,
      email: targetEmail,
      avatar: savedProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      collegeName: savedProfile?.collegeName || '',
      course: savedProfile?.course || '',
      department: savedProfile?.department || '',
      subjects: savedProfile?.subjects || [],
      xp: savedProfile?.xp !== undefined ? savedProfile.xp : 780,
      level: savedProfile?.level || 'AI Apprentice',
      streak: savedProfile?.streak !== undefined ? savedProfile.streak : 5,
      testsCompleted: savedProfile?.testsCompleted || testHistory.length || 1,
      isProfileComplete: savedProfile?.isProfileComplete ?? Boolean(savedProfile?.collegeName)
    };

    setUser(loggedUser);
    saveToDirectory(loggedUser);

    if (typeof window !== 'undefined') {
      localStorage.setItem('st_user', JSON.stringify(loggedUser));
      localStorage.setItem('st_saved_profile', JSON.stringify(loggedUser));
      localStorage.setItem(`st_profile_${targetEmail}`, JSON.stringify(loggedUser));
    }
  };

  const updateProfile = (updatedData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedData };

      // Also update in directory
      saveToDirectory(updated);

      if (typeof window !== 'undefined') {
        localStorage.setItem('st_user', JSON.stringify(updated));
        localStorage.setItem('st_saved_profile', JSON.stringify(updated));
        localStorage.setItem(`st_profile_${updated.email}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const addFriendByUsername = (targetUsername: string): { success: boolean; message: string } => {
    const cleanHandle = targetUsername.trim().toLowerCase().replace(/^@/, '');
    if (!cleanHandle) return { success: false, message: 'Please enter a valid username' };

    if (user && user.username.toLowerCase() === cleanHandle) {
      return { success: false, message: 'You cannot add yourself as a friend!' };
    }

    if (customFriends.includes(cleanHandle)) {
      return { success: false, message: `@${cleanHandle} is already in your friends leaderboard!` };
    }

    // Check if user exists in userDirectory
    let friendUser = userDirectory.find(u => u.username.toLowerCase() === cleanHandle);
    
    // If friend does not exist in local directory yet, create dynamic user entry for them
    if (!friendUser) {
      const friendlyName = cleanHandle.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
      friendUser = {
        id: `usr_${cleanHandle}_${Date.now()}`,
        name: friendlyName,
        username: cleanHandle,
        email: `${cleanHandle}@student.edu`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        collegeName: user?.collegeName || 'Partner University',
        course: user?.course || 'B.Tech',
        department: user?.department || 'Computer Science',
        subjects: user?.subjects || [],
        xp: 820,
        level: 'Semester Warrior',
        streak: 7,
        testsCompleted: 6,
        isProfileComplete: true
      };
      saveToDirectory(friendUser);
    }

    const updated = [...customFriends, cleanHandle];
    setCustomFriends(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('st_custom_friends', JSON.stringify(updated));
    }

    return { success: true, message: `Added @${cleanHandle} (${friendUser.name}) to your Friends Leaderboard!` };
  };

  const logout = () => {
    setUser(null);
    // Note: We do NOT delete st_user from localStorage so all credentials & XP remain preserved when user logs back in!
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
      userDirectory,
      customFriends,
      testHistory,
      activeTest,
      activeTestAnswers,
      loginWithGoogle,
      updateProfile,
      addFriendByUsername,
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
