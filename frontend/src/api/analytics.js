import { http, unwrap } from "./http.js";

const analyticsApi = {
  dashboard: () => http.get("/analytics/dashboard").then(unwrap),
  polls: () => http.get("/analytics/polls").then(unwrap),
  trendingPolls: (params) => http.get("/analytics/polls/trending", { params }).then(unwrap),
  quizzes: () => http.get("/analytics/quizzes").then(unwrap),
  users: () => http.get("/analytics/users").then(unwrap),
  activity: () => http.get("/analytics/activity").then(unwrap),
};

export default analyticsApi;
