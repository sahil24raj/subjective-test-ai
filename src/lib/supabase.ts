import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key-here';

let _supabase: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (typeof window === 'undefined') return null;
  if (_supabase) return _supabase;

  try {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
    return _supabase;
  } catch (e) {
    console.warn("Supabase init error:", e);
    return null;
  }
};

/**
 * Sign in with Google OAuth via Supabase
 */
export const signInWithSupabaseGoogle = async () => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized.");

  const targetRedirect = typeof window !== 'undefined' ? `${window.location.origin}/profile` : undefined;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: targetRedirect,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });

  if (error) throw error;
  return data;
};

/**
 * Email & Password Sign Up via Supabase
 */
export const signUpWithSupabaseEmail = async (email: string, pass: string, displayName: string) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized.");

  const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/profile` : undefined;

  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) throw error;
  return data.user;
};

/**
 * Email & Password Sign In via Supabase
 */
export const signInWithSupabaseEmail = async (email: string, pass: string) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized.");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });

  if (error) throw error;
  return data.user;
};

/**
 * Sign Out via Supabase
 */
export const logoutSupabase = async () => {
  if (typeof window === 'undefined') return;
  try {
    const supabase = getSupabaseClient();
    if (supabase) await supabase.auth.signOut();
  } catch (e) {
    console.warn("Supabase sign out error:", e);
  }
};

/**
 * Helper to map DB row -> Frontend User model
 */
export const mapDbUserToAppUser = (dbUser: any) => {
  if (!dbUser) return null;
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name || dbUser.email?.split('@')[0],
    username: dbUser.username || dbUser.email?.split('@')[0],
    avatar: dbUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(dbUser.name || 'User')}&background=00f0ff&color=020617&bold=true`,
    collegeName: dbUser.college_name || dbUser.collegeName || '',
    course: dbUser.course || '',
    department: dbUser.department || '',
    subjects: Array.isArray(dbUser.subjects) ? dbUser.subjects : ['Operating Systems', 'DBMS', 'DSA'],
    xp: dbUser.xp ?? 0,
    level: dbUser.level || 'L1 - Novice',
    streak: dbUser.streak ?? 1,
    testsCompleted: dbUser.tests_completed ?? dbUser.testsCompleted ?? 0,
    isProfileComplete: dbUser.is_profile_complete ?? dbUser.isProfileComplete ?? false,
    createdAt: dbUser.created_at || dbUser.createdAt,
    lastLogin: dbUser.last_login || dbUser.lastLogin,
    lastActive: dbUser.last_active || dbUser.lastActive,
    avgScore: dbUser.avg_score ?? dbUser.avgScore ?? 0,
    highestScore: dbUser.highest_score ?? dbUser.highestScore ?? 0,
  };
};

/**
 * Save / sync real user profile to Supabase `users` table
 */
export const saveUserProfileToSupabase = async (userData: any) => {
  if (typeof window === 'undefined' || !userData || !userData.email) return;
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const cleanEmail = userData.email.toLowerCase().trim();
    const nowIso = new Date().toISOString();

    const dbPayload = {
      id: userData.id || `usr_${Date.now()}`,
      email: cleanEmail,
      name: userData.name,
      username: userData.username,
      avatar: userData.avatar,
      college_name: userData.collegeName,
      course: userData.course,
      department: userData.department,
      subjects: userData.subjects,
      xp: userData.xp ?? 0,
      level: userData.level || 'L1 - Novice',
      streak: userData.streak ?? 1,
      tests_completed: userData.testsCompleted ?? 0,
      is_profile_complete: userData.isProfileComplete ?? false,
      last_active: nowIso,
      last_login: userData.lastLogin || nowIso,
      avg_score: userData.avgScore ?? 0,
      highest_score: userData.highestScore ?? 0,
    };

    const { error } = await supabase
      .from('users')
      .upsert(dbPayload, { onConflict: 'email' });

    if (error) {
      console.warn("Supabase user save warning:", error.message);
    }
  } catch (e) {
    console.warn("Supabase user save error:", e);
  }
};

/**
 * Fetch a single user profile directly from Supabase by email
 */
export const getUserProfileFromSupabase = async (userEmail: string): Promise<any | null> => {
  if (typeof window === 'undefined' || !userEmail) return null;
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const cleanEmail = userEmail.toLowerCase().trim();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (error) {
      console.warn("Supabase user fetch warning:", error.message);
      return null;
    }

    return mapDbUserToAppUser(data);
  } catch (e) {
    console.warn("Supabase user fetch error:", e);
    return null;
  }
};

/**
 * Real-time subscription to registered users from Supabase `users` table
 */
export const subscribeToAllUsersFromSupabase = (callback: (users: any[]) => void) => {
  if (typeof window === 'undefined') return () => {};
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return () => {};

    // Initial fetch
    supabase
      .from('users')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data) {
          const mapped = data.map(mapDbUserToAppUser).filter(Boolean);
          callback(mapped);
        }
      });

    // Realtime channel listener
    const channel = supabase
      .channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        supabase
          .from('users')
          .select('*')
          .then(({ data, error }) => {
            if (!error && data) {
              const mapped = data.map(mapDbUserToAppUser).filter(Boolean);
              callback(mapped);
            }
          });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (e) {
    console.warn("Supabase users subscription error:", e);
    return () => {};
  }
};

/**
 * Save submitted test result to Supabase `test_results` table
 */
export const saveTestResultToSupabase = async (userEmail: string, testResult: any) => {
  if (typeof window === 'undefined' || !userEmail || !testResult || !testResult.id) return;
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const cleanEmail = userEmail.toLowerCase().trim();
    const dbPayload = {
      id: testResult.id,
      user_email: cleanEmail,
      subject_id: testResult.subjectId,
      subject_name: testResult.subjectName,
      title: testResult.title,
      mode: testResult.mode,
      difficulty: testResult.difficulty,
      date: testResult.date,
      questions: testResult.questions,
      answers: testResult.answers,
      evaluations: testResult.evaluations,
      total_score: testResult.totalScore,
      max_score: testResult.maxScore,
      saved_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('test_results')
      .upsert(dbPayload, { onConflict: 'id' });

    if (error) {
      console.warn("Supabase test result save warning:", error.message);
    }
  } catch (e) {
    console.warn("Supabase test result save error:", e);
  }
};

/**
 * Real-time subscription to user's test history from Supabase `test_results` table
 */
export const subscribeToUserTestHistoryFromSupabase = (userEmail: string, callback: (tests: any[]) => void) => {
  if (typeof window === 'undefined' || !userEmail) return () => {};
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return () => {};

    const cleanEmail = userEmail.toLowerCase().trim();

    const fetchHistory = () => {
      supabase
        .from('test_results')
        .select('*')
        .eq('user_email', cleanEmail)
        .order('saved_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) {
            const mapped = data.map((item: any) => ({
              id: item.id,
              subjectId: item.subject_id,
              subjectName: item.subject_name,
              title: item.title,
              mode: item.mode,
              difficulty: item.difficulty,
              date: item.date,
              questions: item.questions,
              answers: item.answers,
              evaluations: item.evaluations,
              totalScore: item.total_score,
              maxScore: item.max_score,
            }));
            callback(mapped);
          }
        });
    };

    fetchHistory();

    const channel = supabase
      .channel(`public:test_results:${cleanEmail}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'test_results', filter: `user_email=eq.${cleanEmail}` }, () => {
        fetchHistory();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (e) {
    console.warn("Supabase test history subscription error:", e);
    return () => {};
  }
};
