'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Question, Test, getLevelFromXp } from '../lib/mockData';
import { QuestionEvaluation } from '../lib/ai';
import { 
  getFirebaseAuth, 
  logoutFirebase, 
  checkRedirectResult, 
  saveUserProfileToFirestore, 
  subscribeToAllUsersFromFirestore,
  saveTestResultToFirestore,
  subscribeToUserTestHistoryFromFirestore
} from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

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
  testsCompleted: number;
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

interface AppStateContextType {
  user: User | null;
  userDirectory: User[];
  customFriends: string[];
  testHistory: SavedTestResult[];
  activeTest: Test | null;
  activeTestAnswers: Record<string, string>;
  
  loginWithGoogle: (email?: string, name?: string, avatar?: string) => { success: boolean; message?: string };
  loginWithFirebaseUser: (fbUser: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }) => { success: boolean; isNewUser?: boolean; message?: string };
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  addFriendByUsername: (username: string) => { success: boolean; message: string };
  
  startNewTest: (test: Test) => void;
  saveAnswerDraft: (questionId: string, answerText: string) => void;
  submitActiveTest: (answers: Record<string, string>, evaluations: QuestionEvaluation[]) => SavedTestResult;
  getTestById: (testId: string) => SavedTestResult | undefined;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current active logged in user state
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('st_saved_profile') || localStorage.getItem('st_user');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  // Multi-user directory state — Populated 100% dynamically from Cloud Firestore (NO MOCK DATA)
  const [userDirectory, setUserDirectory] = useState<User[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('st_user_directory');
        if (saved) {
          const parsed: User[] = JSON.parse(saved);
          return parsed.filter(u => u && u.email && !u.id?.startsWith('sch_') && !u.email.includes('mock'));
        }
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

  // User-scoped test history
  const [testHistory, setTestHistory] = useState<SavedTestResult[]>([]);

  // Sync test history from LocalStorage & Cloud Firestore when user changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user && user.email) {
      const cleanEmail = user.email.toLowerCase().trim();
      const userHistoryKey = `st_history_${cleanEmail}`;
      const savedHistory = localStorage.getItem(userHistoryKey);
      if (savedHistory) {
        try {
          setTestHistory(JSON.parse(savedHistory));
        } catch (e) {
          setTestHistory([]);
        }
      }

      // Realtime listener for Firestore Test History
      const unsubscribe = subscribeToUserTestHistoryFromFirestore(cleanEmail, (cloudTests) => {
        if (cloudTests && cloudTests.length > 0) {
          setTestHistory(cloudTests);
          localStorage.setItem(userHistoryKey, JSON.stringify(cloudTests));
        }
      });
      return () => unsubscribe();
    } else {
      setTestHistory([]);
    }
  }, [user?.email]);

  // Sync Firebase Auth — handles popup and redirect flows
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const authInstance = getFirebaseAuth();
    if (!authInstance) return;

    checkRedirectResult().then((fbUser) => {
      if (fbUser && fbUser.email) {
        loginWithFirebaseUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL
        });
      }
    });

    const unsubscribe = onAuthStateChanged(authInstance, (fbUser) => {
      if (fbUser && fbUser.email) {
        loginWithFirebaseUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Cloud Firestore User Directory & Global Leaderboard Sync (100% Real Users)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const unsubscribe = subscribeToAllUsersFromFirestore((cloudUsers) => {
      if (cloudUsers) {
        const map = new Map<string, User>();
        cloudUsers.forEach(u => {
          if (u && u.email && !u.id?.startsWith('sch_') && !u.email.includes('mock')) {
            const cleanEmail = u.email.toLowerCase().trim();
            map.set(cleanEmail, u);
          }
        });
        const merged = Array.from(map.values());
        setUserDirectory(merged);
        localStorage.setItem('st_user_directory', JSON.stringify(merged));
      }
    });
    return () => unsubscribe();
  }, []);

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

  // Save real account to user directory and Cloud Firestore
  const saveToDirectory = (userData: User) => {
    // 1. Persist to Cloud Firestore database
    saveUserProfileToFirestore(userData);

    // 2. Update local state & localStorage
    setUserDirectory(prev => {
      const cleanEmail = userData.email.toLowerCase().trim();
      const filtered = prev.filter(u => u && u.email && u.email.toLowerCase().trim() !== cleanEmail && !u.id?.startsWith('sch_'));
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
        const emailKey = `st_profile_${email}`;
        const savedAccount = localStorage.getItem(emailKey);
        if (savedAccount) {
          savedProfile = JSON.parse(savedAccount);
        } else {
          const dirFound = userDirectory.find(u => u && u.email && u.email.toLowerCase() === email);
          if (dirFound) {
            savedProfile = dirFound;
          } else {
            isNewUser = true;
          }
        }
      } catch (e) {}
    }

    const defaultUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    const defaultName = fbUser.displayName || savedProfile?.name || defaultUsername.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
    const realAvatar = (fbUser.photoURL && fbUser.photoURL.startsWith('http')) 
      ? fbUser.photoURL 
      : (savedProfile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(defaultName)}&background=00f0ff&color=020617&bold=true`);

    const startingXp = savedProfile?.xp !== undefined ? savedProfile.xp : 0;
    const loggedUser: User = {
      id: fbUser.uid || savedProfile?.id || `usr_fb_${Date.now()}`,
      name: defaultName,
      username: savedProfile?.username || defaultUsername,
      email: email,
      avatar: realAvatar,
      collegeName: savedProfile?.collegeName || '',
      course: savedProfile?.course || '',
      department: savedProfile?.department || '',
      subjects: savedProfile?.subjects || ['Operating Systems', 'Database Management Systems (DBMS)', 'Data Structures & Algorithms (DSA)'],
      xp: startingXp,
      level: getLevelFromXp(startingXp).name,
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
    }

    return { success: true, isNewUser };
  };

  const loginWithGoogle = (customEmail?: string, customName?: string, customAvatar?: string): { success: boolean; message?: string } => {
    const targetEmail = customEmail ? customEmail.trim().toLowerCase() : 'sahil.raj@gmail.com';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      return { success: false, message: 'Please enter a valid Google email address (e.g. user@gmail.com).' };
    }

    let savedProfile: Partial<User> | null = null;

    if (typeof window !== 'undefined') {
      try {
        const emailKey = `st_profile_${targetEmail}`;
        const savedAccount = localStorage.getItem(emailKey);
        if (savedAccount) {
          savedProfile = JSON.parse(savedAccount);
        } else {
          const dirFound = userDirectory.find(u => u.email.toLowerCase() === targetEmail);
          if (dirFound) {
            savedProfile = dirFound;
          }
        }
      } catch (e) {}
    }

    const defaultUsername = targetEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    const defaultName = customName || defaultUsername.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

    const realAvatar = customAvatar || savedProfile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(savedProfile?.name || defaultName)}&background=00f0ff&color=020617&bold=true`;

    const gStartingXp = savedProfile?.xp !== undefined ? savedProfile.xp : 0;
    const loggedUser: User = {
      id: savedProfile?.id || `usr_g_${Date.now()}`,
      name: savedProfile?.name || defaultName,
      username: savedProfile?.username || defaultUsername,
      email: targetEmail,
      avatar: realAvatar,
      collegeName: savedProfile?.collegeName || '',
      course: savedProfile?.course || '',
      department: savedProfile?.department || '',
      subjects: savedProfile?.subjects || ['Operating Systems', 'Database Management Systems (DBMS)', 'Data Structures & Algorithms (DSA)'],
      xp: gStartingXp,
      level: getLevelFromXp(gStartingXp).name,
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
    }

    return { success: true };
  };

  const updateProfile = (updatedData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedData };

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

    const friendUser = userDirectory.find(u => u.username.toLowerCase() === cleanHandle);
    
    if (!friendUser) {
      return {
        success: false,
        message: `No registered scholar found with username @${cleanHandle}.`
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
    logoutFirebase();
  };

  const startNewTest = (test: Test) => {
    setActiveTest(test);
    setActiveTestAnswers({});
    if (typeof window !== 'undefined') {
      localStorage.setItem('st_active_test', JSON.stringify(test));
      localStorage.setItem('st_active_answers', JSON.stringify({}));
    }
  };

  const saveAnswerDraft = (questionId: string, answerText: string) => {
    const updated = {
      ...activeTestAnswers,
      [questionId]: answerText
    };
    setActiveTestAnswers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('st_active_answers', JSON.stringify(updated));
    }
  };

  const submitActiveTest = (answers: Record<string, string>, evaluations: QuestionEvaluation[]): SavedTestResult => {
    if (!activeTest) throw new Error('No active test session to submit');

    let totalScore = 0;
    let maxScore = 0;
    evaluations.forEach(e => {
      totalScore += e.score;
      maxScore += e.maxScore;
    });

    const gainedXP = Math.round((totalScore / (maxScore || 1)) * (activeTest.xpReward || 50));

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

    const updatedHistory = [result, ...testHistory];
    setTestHistory(updatedHistory);

    if (user && user.email) {
      const cleanEmail = user.email.toLowerCase().trim();
      if (typeof window !== 'undefined') {
        localStorage.setItem(`st_history_${cleanEmail}`, JSON.stringify(updatedHistory));
      }
      
      // Save test result to Cloud Firestore Database
      saveTestResultToFirestore(cleanEmail, result);

      // Update user XP & testsCompleted in Cloud Firestore Database
      const newXp = (user.xp || 0) + gainedXP;
      const updatedUser: User = {
        ...user,
        xp: newXp,
        level: getLevelFromXp(newXp).name,
        testsCompleted: (user.testsCompleted || 0) + 1,
        streak: Math.max(user.streak || 1, 1)
      };

      setUser(updatedUser);
      saveToDirectory(updatedUser);
    }

    return result;
  };

  const getTestById = (testId: string): SavedTestResult | undefined => {
    return testHistory.find(t => t.id === testId);
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
      loginWithFirebaseUser,
      logout,
      updateProfile,
      addFriendByUsername,
      startNewTest,
      saveAnswerDraft,
      submitActiveTest,
      getTestById
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
