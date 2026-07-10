import axios from 'axios';
import { auth } from './firebaseConfig';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://todo-ai-project.onrender.com/api',
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;