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
  loginWithFirebaseUser: (fbUser: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }) => { success: boolean; isNewUser?: boolean; message?: string };
  loginWithGoogle: (customEmail?: string, customName?: string, customAvatar?: string) => { success: boolean; message?: string };
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

  // Load account-scoped test history
  const [testHistory, setTestHistory] = useState<SavedTestResult[]>([]);

  // Sync test history when user changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user && user.email) {
        try {
          const userHistoryKey = `st_history_${user.email.toLowerCase()}`;
          const savedHistory = localStorage.getItem(userHistoryKey);
          if (savedHistory) {
            setTestHistory(JSON.parse(savedHistory));
          } else {
            // Check legacy st_history if migrating default user
            if (user.email.toLowerCase() === 'sahil.raj@gmail.com') {
              const legacy = localStorage.getItem('st_history');
              if (legacy) {
                const parsed = JSON.parse(legacy);
                setTestHistory(parsed);
                localStorage.setItem(userHistoryKey, legacy);
              } else {
                setTestHistory([]);
              }
            } else {
              setTestHistory([]);
            }
          }
        } catch (e) {
          setTestHistory([]);
        }
      } else {
        setTestHistory([]);
      }
    }
  }, [user]);

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
      const filtered = prev.filter(u => u.email.toLowerCase() !== userData.email.toLowerCase());
      const updated = [userData, ...filtered];
      if (typeof window !== 'undefined') {
        localStorage.setItem('st_user_directory', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const loginWithFirebaseUser = (fbUser: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }): { success: boolean; isNewUser?: boolean; message?: string } => {
    const email = fbUser.email ? fbUser.email.trim().toLowerCase() : `user_${fbUser.uid.slice(0, 8)}@gmail.com`;
    let isNewUser = false;
    let savedProfile: Partial<User> | null = null;

    if (typeof window !== 'undefined') {
      try {
        // Look up existing profile by email or uid
        const emailKey = `st_profile_${email}`;
        const savedAccount = localStorage.getItem(emailKey);
        if (savedAccount) {
          savedProfile = JSON.parse(savedAccount);
        } else {
          const dirFound = userDirectory.find(u => u.email.toLowerCase() === email);
          if (dirFound) {
            savedProfile = dirFound;
          } else {
            isNewUser = true;
          }
        }
      } catch (e) {}
    }

    const defaultUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    const defaultName = fbUser.displayName || defaultUsername.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

    const loggedUser: User = {
      id: fbUser.uid || savedProfile?.id || `usr_fb_${Date.now()}`,
      name: savedProfile?.name || defaultName,
      username: savedProfile?.username || defaultUsername,
      email: email,
      avatar: fbUser.photoURL || savedProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      collegeName: savedProfile?.collegeName || '',
      course: savedProfile?.course || '',
      department: savedProfile?.department || '',
      subjects: savedProfile?.subjects || ['Operating Systems', 'Database Management Systems (DBMS)', 'Data Structures & Algorithms (DSA)'],
      xp: savedProfile?.xp !== undefined ? savedProfile.xp : 500,
      level: savedProfile?.level || 'AI Scholar',
      streak: savedProfile?.streak !== undefined ? savedProfile.streak : 1,
      testsCompleted: savedProfile?.testsCompleted || 0,
      isProfileComplete: savedProfile?.isProfileComplete ?? Boolean(savedProfile?.collegeName)
    };

    setUser(loggedUser);
    saveToDirectory(loggedUser);

    if (typeof window !== 'undefined') {
      localStorage.setItem('st_user', JSON.stringify(loggedUser));
      localStorage.setItem('st_saved_profile', JSON.stringify(loggedUser));
      localStorage.setItem(`st_profile_${email}`, JSON.stringify(loggedUser));

      // Load user-scoped history
      const userHistoryKey = `st_history_${email}`;
      const savedHistory = localStorage.getItem(userHistoryKey);
      if (savedHistory) {
        try {
          setTestHistory(JSON.parse(savedHistory));
        } catch (e) {
          setTestHistory([]);
        }
      } else {
        setTestHistory([]);
      }
    }

    return { success: true, isNewUser };
  };

  const loginWithGoogle = (customEmail?: string, customName?: string, customAvatar?: string): { success: boolean; message?: string } => {
    const targetEmail = customEmail ? customEmail.trim().toLowerCase() : 'sahil.raj@gmail.com';

    // Strict Email Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      return { success: false, message: 'Please enter a valid Google email address (e.g. user@gmail.com).' };
    }

    let savedProfile: Partial<User> | null = null;

    if (typeof window !== 'undefined') {
      try {
        // 1. Try loading account-specific profile
        const emailKey = `st_profile_${targetEmail}`;
        const savedAccount = localStorage.getItem(emailKey);
        if (savedAccount) {
          savedProfile = JSON.parse(savedAccount);
        } else {
          // 2. Try searching in userDirectory
          const dirFound = userDirectory.find(u => u.email.toLowerCase() === targetEmail);
          if (dirFound) {
            savedProfile = dirFound;
          } else if (targetEmail === 'sahil.raj@gmail.com') {
            const rootSaved = localStorage.getItem('st_saved_profile') || localStorage.getItem('st_user');
            if (rootSaved) savedProfile = JSON.parse(rootSaved);
          }
        }
      } catch (e) {}
    }

    const defaultUsername = targetEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    const defaultName = customName || defaultUsername.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

    const loggedUser: User = {
      id: savedProfile?.id || `usr_g_${Date.now()}`,
      name: savedProfile?.name || defaultName,
      username: savedProfile?.username || defaultUsername,
      email: targetEmail,
      avatar: savedProfile?.avatar || customAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      collegeName: savedProfile?.collegeName || '',
      course: savedProfile?.course || '',
      department: savedProfile?.department || '',
      subjects: savedProfile?.subjects || ['Operating Systems', 'Database Management Systems (DBMS)', 'Data Structures & Algorithms (DSA)'],
      xp: savedProfile?.xp !== undefined ? savedProfile.xp : 500,
      level: savedProfile?.level || 'AI Scholar',
      streak: savedProfile?.streak !== undefined ? savedProfile.streak : 1,
      testsCompleted: savedProfile?.testsCompleted || 0,
      isProfileComplete: savedProfile?.isProfileComplete ?? Boolean(savedProfile?.collegeName)
    };

    setUser(loggedUser);
    saveToDirectory(loggedUser);

    if (typeof window !== 'undefined') {
      localStorage.setItem('st_user', JSON.stringify(loggedUser));
      localStorage.setItem('st_saved_profile', JSON.stringify(loggedUser));
      localStorage.setItem(`st_profile_${targetEmail}`, JSON.stringify(loggedUser));

      // Load user-scoped history
      const userHistoryKey = `st_history_${targetEmail}`;
      const savedHistory = localStorage.getItem(userHistoryKey);
      if (savedHistory) {
        try {
          setTestHistory(JSON.parse(savedHistory));
        } catch (e) {
          setTestHistory([]);
        }
      } else {
        setTestHistory([]);
      }
    }

    return { success: true };
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
        localStorage.setItem(`st_profile_${updated.email.toLowerCase()}`, JSON.stringify(updated));
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

    // Validate if friend exists in real userDirectory
    const friendUser = userDirectory.find(u => u.username.toLowerCase() === cleanHandle);
    
    if (!friendUser) {
      return {
        success: false,
        message: `No real registered scholar found with username @${cleanHandle}. (Only registered users can be added!)`
      };
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
    setTestHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('st_user');
    }
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

  // Submit active test (Account-scoped)
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

    // Save history scoped to current user email
    const updatedHistory = [result, ...testHistory];
    setTestHistory(updatedHistory);

    if (typeof window !== 'undefined') {
      const emailKey = user?.email ? user.email.toLowerCase() : 'sahil.raj@gmail.com';
      localStorage.setItem(`st_history_${emailKey}`, JSON.stringify(updatedHistory));
      localStorage.setItem('st_history', JSON.stringify(updatedHistory)); // Fallback
    }

    // Award XP and increment tests completed for active user
    if (user) {
      const addedXP = Math.round((totalScore / (maxScore || 1)) * 100);
      updateProfile({
        xp: (user.xp || 0) + addedXP,
        testsCompleted: (user.testsCompleted || 0) + 1
      });
    }

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
      loginWithFirebaseUser,
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
