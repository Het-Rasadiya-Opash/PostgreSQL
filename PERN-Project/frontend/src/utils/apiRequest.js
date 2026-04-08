import axios from "axios";

const apiRequest = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT,
  withCredentials: true,
});

apiRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    const isGuestPage = window.location.pathname === "/login" || window.location.pathname === "/register";
    
    if (error.response?.status === 401 && !isGuestPage) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default apiRequest;
