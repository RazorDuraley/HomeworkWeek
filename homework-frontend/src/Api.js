import axios from 'axios';

const api = axios.create({
    baseURL: 'https://homeworkweek.onrender.com',
});

export default api;