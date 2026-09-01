import axios from 'axios';

// Cria uma instância do axios com configurações padrão
export const api = axios.create({
  // Tenta pegar a variável de ambiente, se não houver (ex: fora do Docker sem .env) cai no default
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar o token de autenticação (quando implementarmos o login/zustand) nas rotas
api.interceptors.request.use(
  (config) => {
    // Exemplo:
    // const token = localStorage.getItem('kharify_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros (ex: 401 para deslogar usuário)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se recebermos 401 Unauthorized, podemos forçar o logout
    if (error.response?.status === 401) {
       alert("Sessão expirada. Faça login novamente.");
       window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
