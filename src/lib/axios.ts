import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://e48f-137-115-7-178.ngrok-free.app";

export default axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
})