import axios from "axios";
import dotenv from "dotenv";
dotenv.config({path: "../../.env"});
console.log(import.meta.env.VITE_API_BASE_URL);

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true
});

export default api;