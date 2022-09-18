import React, { useEffect, useState } from 'react';
import { Auth, User } from '@utils/auth';

const auth = new Auth(); // singleton

const redirectKey = 'sign_in_redirect';

export const AuthContext = React.createContext<
  | {
      auth: Auth;
      initializing: boolean;
      user: User | null;
      error: { message: string };
      setRedirect: (redirect: string) => void;
      getRedirect: () => string | null;
      clearRedirect: () => void;
    }
  | undefined
>(undefined);

AuthContext.displayName = 'AuthContext';

function setRedirect(redirect: string) {
  window.localStorage.setItem(redirectKey, redirect);
}

function getRedirect(): string | null {
  return window.localStorage.getItem(redirectKey);
}

function clearRedirect() {
  return window.localStorage.removeItem(redirectKey);
}
export function useAuth() {
  const _auth = React.useContext(AuthContext);

  if (!_auth) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return _auth;
}

export function AuthProvider({ children }: { children: JSX.Element }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<{ message: string } | null>(null);
  const [initializing, setInitializing] = useState(true);
  useEffect(() => {
    auth
      .onAuthStateChanged((_user: User | null, _error) => {
        if (_user) {
          setUser(_user);
          setError(null);
        } else {
          setUser(null);
          if (_error) {
            setError(_error);
          }
        }
        setInitializing(false);
      })
      .resolveUser();
  }, []);

  const value = {
    user,
    error,
    auth,
    initializing,
    setRedirect,
    getRedirect,
    clearRedirect,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
