import { API } from "./api";

export const getPackages = async (category) =>
  API.get("/packages", { params: { category } });

export const getPackageById = async (id) =>
  API.get(`/packages/${id}`);
