import axios from "axios";

export const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : "/api");

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default api;

/**
 * Flatten the API's error envelope into one human string:
 * prefers per-field details, falls back to the message.
 */
export function apiError(error) {
  const data = error?.response?.data;
  const firstDetail =
    data?.details && typeof data.details === "object"
      ? Object.values(data.details)[0]
      : undefined;
  return firstDetail || data?.message || "Something went wrong. Please try again.";
}
