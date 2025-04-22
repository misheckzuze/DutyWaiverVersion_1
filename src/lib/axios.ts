import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://e48f-137-115-7-178.ngrok-free.app";
console.log("Base URL:", BASE_URL); // Debug: Check which URL is being used

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
        console.log("Request interceptor - original config:", config); // Debug: original request
        
        const token = localStorage.getItem("accessToken");
        console.log("Retrieved token:", token); // Debug: check if token exists
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("Request headers after token injection:", config.headers); // Debug: verify headers
        }
        return config;
    },
    (error) => {
        console.error("Request interceptor error:", error); // Debug: request error
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging responses
axiosInstance.interceptors.response.use(
    (response) => {
        console.log("Response:", response); // Debug: successful response
        return response;
    },
    (error) => {
        console.error("Response error:", error); // Debug: response error
        if (error.response) {
            console.error("Error response data:", error.response.data);
            console.error("Error response status:", error.response.status);
            console.error("Error response headers:", error.response.headers);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;