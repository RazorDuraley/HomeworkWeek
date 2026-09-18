import axios from 'axios';

const api = axios.create({
    baseURL: 'https://iv-623top.duckdns.org',
});

// Добавляем токен в каждый запрос
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// При 401 — выкидываем на логин
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // не редиректим, если уже на странице логина
            if (!window.location.pathname.startsWith('/login')) {
                window.dispatchEvent(new Event('auth:logout'));
            }
        }
        return Promise.reject(error);
    }
);

export default api;