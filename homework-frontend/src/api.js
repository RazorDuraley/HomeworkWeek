import axios from 'axios';

const api = axios.create({
    baseURL: 'https://iv-623top.duckdns.org',
});

export default api;