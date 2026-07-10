import axios from 'axios';
import { auth } from './firebaseConfig';

const api = axios.create({
  baseURL: 'https://todo-ai-project.onrender.com/api',
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken(); // 만료 시 자동 갱신됨
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;