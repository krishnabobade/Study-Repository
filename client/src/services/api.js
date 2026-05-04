import axios from 'axios'

const getBaseURL = () => {
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
    if (config.headers.common) {
      delete config.headers.common['Content-Type'];
    }
  }
  
  return config
})

// Handle 401 globally & Graceful Failure Recovery
api.interceptors.response.use(
  res => res,
  async err => {
    const originalConfig = err.config;
    
    // Auto-logout on 401 Unauthorized
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      return Promise.reject(err)
    }

    // Graceful Failure Recovery: Retry failed network requests (timeout or 5xx)
    if ((err.code === 'ECONNABORTED' || err.response?.status >= 500) && !originalConfig._retryCount) {
      originalConfig._retryCount = 1;
      // Exponential backoff wait (1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500));
      return api(originalConfig);
    }
    
    // If still failing or client-side error, reject safely
    return Promise.reject(err)
  }
)

export default api
