import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

// ─── Posts ──────────────────────────────────────────────────────────
export const postsAPI = {
  getAll: (params) => API.get('/posts', { params }),
  getBySlug: (slug) => API.get(`/posts/${slug}`),
  create: (data) => API.post('/posts', data),
  update: (id, data) => API.put(`/posts/${id}`, data),
  delete: (id) => API.delete(`/posts/${id}`),
  toggleLike: (id) => API.post(`/posts/${id}/like`),
  addComment: (id, text) => API.post(`/posts/${id}/comments`, { text }),
  deleteComment: (postId, commentId) => API.delete(`/posts/${postId}/comments/${commentId}`),
  getPopularTags: () => API.get('/posts/tags/popular'),
};

// ─── Users ──────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile: (id) => API.get(`/users/${id}`),
  getUserPosts: (id, params) => API.get(`/users/${id}/posts`, { params }),
  updateProfile: (data) => API.put('/users/profile', data),
  updatePassword: (data) => API.put('/users/password', data),
  toggleSave: (postId) => API.post(`/users/save/${postId}`),
};

export default API;
