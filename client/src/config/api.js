// centralized API config

// base API url with fallback
export const BASE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// endpoint-specific URLs
export const API_ENDPOINTS = {
  AUTH: `${BASE_API_URL}/auth`,
  PETS: `${BASE_API_URL}/pets`,
  GROOMERS: `${BASE_API_URL}/groomers`,
  APPOINTMENTS: `${BASE_API_URL}/appointments`,
};

// Add axios default config
import axios from "axios";

axios.defaults.baseURL = BASE_API_URL;
axios.defaults.headers.common["Content-Type"] = "application/json";

// Add interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API_ENDPOINTS;
