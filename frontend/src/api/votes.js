import { http, unwrap } from "./http.js";

const votesApi = {
  cast: (payload) => http.post("/votes", payload).then(unwrap),
  myHistory: (params) => http.get("/votes/my-history", { params }).then(unwrap),
  myPollVote: (pollId) => http.get(`/votes/my-poll/${pollId}`).then(unwrap),
};

export default votesApi;
