import axios from "axios";

const buildFallbackApiUrl = () => {
  if (typeof window === "undefined") return "http://localhost:5000/api";

  const host = window.location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1";

  if (isLocal) return "http://localhost:5000/api";

  return `${window.location.origin}/api`;
};

const API_URL = import.meta.env.VITE_API_URL || buildFallbackApiUrl();
const TOKEN_KEY = "bloomvote_access_token";
const USER_KEY = "bloomvote_user";

let accessToken = localStorage.getItem(TOKEN_KEY);

const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const setAccessToken = (token) => {
  accessToken = token;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

const getAccessToken = () => accessToken;

const setStoredUser = (user) => {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
};

const clearAuthStorage = () => {
  setAccessToken(null);
  setStoredUser(null);
};

http.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthRoute = original?.url?.includes("/auth/login")
      || original?.url?.includes("/auth/register")
      || original?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        const { accessToken: nextToken, user } = refreshResponse.data.data;
        setAccessToken(nextToken);
        setStoredUser(user);
        original.headers.Authorization = `Bearer ${nextToken}`;
        return http(original);
      } catch (refreshError) {
        clearAuthStorage();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

const unwrap = (response) => response.data;

export {
  API_URL,
  http,
  unwrap,
  setAccessToken,
  getAccessToken,
  setStoredUser,
  getStoredUser,
  clearAuthStorage,
};
