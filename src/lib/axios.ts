import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://e48f-137-115-7-178.ngrok-free.app";

// Create base axios instance
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true" // If you need this for ngrok
    }
});

// Add request interceptor to inject the token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;