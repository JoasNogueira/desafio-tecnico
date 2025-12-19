import axios from 'axios';

const api = axios.create({
    // Aponta para o seu Laravel rodando no Docker
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default api;