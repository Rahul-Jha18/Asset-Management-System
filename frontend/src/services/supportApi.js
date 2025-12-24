import api from "./api";

export const submitSupportTicket = (data) =>
  api.post("/api/support", data);
