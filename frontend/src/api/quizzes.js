import { http, unwrap } from "./http.js";

const quizzesApi = {
  list: (params) => http.get("/quizzes", { params }).then(unwrap),
  mine: (params) => http.get("/quizzes/mine", { params }).then(unwrap),
  get: (quizId) => http.get(`/quizzes/${quizId}`).then(unwrap),
  create: (payload) => http.post("/quizzes", payload).then(unwrap),
  update: (quizId, payload) => http.patch(`/quizzes/${quizId}`, payload).then(unwrap),
  remove: (quizId) => http.delete(`/quizzes/${quizId}`).then(unwrap),
  questions: (quizId) => http.get(`/quizzes/${quizId}/questions`).then(unwrap),
  addQuestion: (quizId, payload) => http.post(`/quizzes/${quizId}/questions`, payload).then(unwrap),
  publish: (quizId) => http.post(`/quizzes/${quizId}/publish`).then(unwrap),
  submitAttempt: (quizId, payload) => http.post(`/quizzes/${quizId}/attempts`, payload).then(unwrap),
  attempts: (params) => http.get("/quizzes/attempts/me", { params }).then(unwrap),
  analytics: (quizId) => http.get(`/quizzes/${quizId}/analytics`).then(unwrap),
};

export default quizzesApi;
