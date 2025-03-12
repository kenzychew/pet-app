// centralized API config

// base API url with fallback
export const BASE_API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// endpoint-specific URLs
export const API_ENDPOINTS = {
  AUTH: `${BASE_API_URL}/auth`,
  PETS: `${BASE_API_URL}/pets`,
  GROOMERS: `${BASE_API_URL}/groomers`,
  APPOINTMENTS: `${BASE_API_URL}/appointments`,
};

export default API_ENDPOINTS;
