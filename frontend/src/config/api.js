export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Universal auto-refresh fetch wrapper.
 * Intercepts 401 Unauthorized responses, triggers token refresh via HttpOnly cookie,
 * updates localStorage access token, and transparently retries the failed request.
 */
export const apiFetch = async (url, options = {}) => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions = {
    ...options,
    headers,
    credentials: 'include'
  };

  try {
    let response = await fetch(fullUrl, fetchOptions);

    // If 401 Unauthorized, attempt background refresh once
    if (response.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(newToken => {
          fetchOptions.headers['Authorization'] = `Bearer ${newToken}`;
          return fetch(fullUrl, fetchOptions);
        });
      }

      isRefreshing = true;

      try {
        const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        const refreshData = await refreshRes.json();

        if (refreshRes.ok && refreshData.success && refreshData.token) {
          localStorage.setItem('token', refreshData.token);
          if (refreshData.user) {
            localStorage.setItem('user', JSON.stringify(refreshData.user));
          }
          isRefreshing = false;
          processQueue(null, refreshData.token);

          // Retry original request with new token
          fetchOptions.headers['Authorization'] = `Bearer ${refreshData.token}`;
          return fetch(fullUrl, fetchOptions);
        } else {
          isRefreshing = false;
          processQueue(new Error('Refresh token expired'), null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return response;
        }
      } catch (refreshErr) {
        isRefreshing = false;
        processQueue(refreshErr, null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return response;
      }
    }

    return response;
  } catch (err) {
    throw err;
  }
};
