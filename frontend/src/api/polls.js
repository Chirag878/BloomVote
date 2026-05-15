import { http, unwrap } from "./http.js";

const pollsApi = {
  list: (params) => http.get("/polls", { params }).then(unwrap),
  get: (pollId) => http.get(`/polls/${pollId}`).then(unwrap),
  create: (payload) => http.post("/polls", payload).then(unwrap),
  update: (pollId, payload) => http.patch(`/polls/${pollId}`, payload).then(unwrap),
  remove: (pollId) => http.delete(`/polls/${pollId}`).then(unwrap),
  analytics: (pollId) => http.get(`/polls/${pollId}/analytics`).then(unwrap),
};

export default pollsApi;
