import { API } from "./api";

export const registerUser = async (payload) =>
  API.post("/auth/register", payload);

export const loginUser = async (payload) =>
  API.post("/auth/login", payload);
