import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, User } from '../lib/db';
import { hashPassword, generateSalt } from '../lib/crypto';

// Minimal user info stored in session
export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (data: Record<string, string>) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'chicsync_session_uid';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedEmail = sessionStorage.getItem(SESSION_KEY);
        if (storedEmail) {
          const dbUser = await db.getUserByEmail(storedEmail);
          if (dbUser && dbUser.id) {
            setUser({ id: dbUser.id, email: dbUser.email, name: dbUser.name });
          }
        }
      } catch (e) {
        console.error("Session restore failed", e);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const dbUser = await db.getUserByEmail(email);
      if (!dbUser) return false;

      const hash = await hashPassword(pass, dbUser.salt);
      if (hash === dbUser.passwordHash && dbUser.id) {
        setUser({ id: dbUser.id, email: dbUser.email, name: dbUser.name });
        sessionStorage.setItem(SESSION_KEY, email);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Login error", e);
      return false;
    }
  };

  const signup = async (data: Record<string, string>): Promise<{ success: boolean; message: string }> => {
    try {
      const existingUser = await db.getUserByEmail(data.email);
      if (existingUser) {
        return { success: false, message: 'An account with this email already exists.' };
      }

      const salt = await generateSalt();
      const passwordHash = await hashPassword(data.password, salt);

      await db.createUser({
        email: data.email,
        name: data.name,
        passwordHash,
        salt,
        createdAt: Date.now()
      });

      return { success: true, message: 'Account created successfully! Please log in.' };
    } catch (e) {
      console.error("Signup error", e);
      return { success: false, message: 'Failed to create account. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};