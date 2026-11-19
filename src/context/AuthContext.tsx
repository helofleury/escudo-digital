import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authenticate, createUser, deleteKv, getKv, getUserById, setKv, updateUserLevel } from '@/db/userRepository';
import type { KnowledgeLevel, User } from '@/types';

const SESSION_KEY = 'session_user_id';

interface AuthValue {
  user: User | null;
  loading: boolean;
  signUp: (name: string, email: string, password: string, level: KnowledgeLevel) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  changeLevel: (level: KnowledgeLevel) => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stored = await getKv(SESSION_KEY);
        const found = stored === null ? null : await getUserById(Number(stored));
        if (active) setUser(found);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string, level: KnowledgeLevel): Promise<void> => {
    const created = await createUser(name, email, password, level);
    await setKv(SESSION_KEY, String(created.id));
    setUser(created);
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    const found = await authenticate(email, password);
    await setKv(SESSION_KEY, String(found.id));
    setUser(found);
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    await deleteKv(SESSION_KEY);
    setUser(null);
  }, []);

  const changeLevel = useCallback(
    async (level: KnowledgeLevel): Promise<void> => {
      if (user === null) return;
      await updateUserLevel(user.id, level);
      setUser({ ...user, level });
    },
    [user],
  );

  const value = useMemo<AuthValue>(
    () => ({ user, loading, signUp, signIn, signOut, changeLevel }),
    [user, loading, signUp, signIn, signOut, changeLevel],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) throw new Error('useAuth fora do AuthProvider');
  return ctx;
}
