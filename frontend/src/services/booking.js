import { API } from "./api";

export const createBooking = async (token, data) =>
  API.post("/bookings", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getMyBookings = async (token) =>
  API.get("/bookings/my", {
    headers: { Authorization: `Bearer ${token}` },
  });
