import { http, unwrap } from "./http.js";

const authApi = {
  register: (payload) => http.post("/auth/register", payload).then(unwrap),
  login: (payload) => http.post("/auth/login", payload).then(unwrap),
  logout: () => http.post("/auth/logout").then(unwrap),
  refresh: () => http.post("/auth/refresh").then(unwrap),
  me: () => http.get("/auth/me").then(unwrap),
  updateProfile: (payload) => http.patch("/auth/profile", payload).then(unwrap),
};

export default authApi;
