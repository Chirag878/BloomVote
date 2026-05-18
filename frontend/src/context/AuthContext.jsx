import { createContext, useContext, useEffect, useMemo, useState } from "react";
import authApi from "../api/auth.js";
import {
  clearAuthStorage,
  getAccessToken,
  getStoredUser,
  setAccessToken,
  setStoredUser,
} from "../api/http.js";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getAccessToken());
  const [initializing, setInitializing] = useState(Boolean(getAccessToken()));

  useEffect(() => {
    let active = true;
    if (!token) {
      setInitializing(false);
      return undefined;
    }

    authApi.me()
      .then((response) => {
        if (!active) return;
        setUser(response.data);
        setStoredUser(response.data);
      })
      .catch(() => {
        clearAuthStorage();
        if (active) {
          setUser(null);
          setToken(null);
        }
      })
      .finally(() => active && setInitializing(false));

    return () => {
      active = false;
    };
  }, []);

  const persistSession = (payload) => {
    const nextUser = payload.data?.user;
    const nextToken = payload.data?.accessToken;
    setUser(nextUser);
    setToken(nextToken);
    setStoredUser(nextUser);
    setAccessToken(nextToken);
  };

  const login = async (payload) => {
    const response = await authApi.login(payload);
    persistSession(response);
    return response;
  };

  const register = async (payload) => {
    const response = await authApi.register(payload);
    persistSession(response);
    return response;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuthStorage();
      setUser(null);
      setToken(null);
    }
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
    setStoredUser(nextUser);
  };

  const value = useMemo(() => ({
    user,
    token,
    initializing,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
    updateUser,
  }), [user, token, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export { AuthProvider, useAuth };
