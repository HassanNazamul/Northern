import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

console.log(`%c[API] Using base URL: ${API_BASE_URL}`, 'color: #00bcd4; font-weight: bold;');

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('[API Error]', error);
        return Promise.reject(error);
    }
);
